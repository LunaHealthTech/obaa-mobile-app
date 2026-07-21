# Features & Screens

## Route map (expo-router, `app/`)

| Route | File | Purpose |
|---|---|---|
| `/intro` | `app/intro.tsx` | Minimal splash/landing screen with Sign in / Sign up links (bare-bones placeholder) |
| `/signin` | `app/signin.tsx` | Sign-in form (react-hook-form + zod `loginSchema`), social login icon row (FB/Google/Apple — non-functional), calls `useAuth().signIn` |
| `/signup` | `app/signup.tsx` | 3-step sign-up wizard (name → DOB/email → phone/password), local `step` state, `SignUpSchema` (zod), calls `useAuth().register` |
| `/onboarding/persona` | `app/onboarding/persona.tsx` | Marketing/intro screen ("Track Your Cycle with Confidence!") with a Rafiki illustration, navigates to menstrual-profile-setup |
| `/onboarding/menstrual-profile-setup` | `app/onboarding/menstrual-profile-setup.tsx` | 3-question wizard (cycle length, period length, last period start date) using a wheel picker + `DateInput`; submits via `useMenstrualProfileViewModel().createMenstrualProfile`; redirects to `/(tabs)/home` on success |
| `(tabs)/home` | `app/(tabs)/home/index.tsx` | Main dashboard: menstrual info cards, "Share the Love" referral card, mood/emotion tracker with sentiment sharing, horizontal article list (currently hardcoded), logout link |
| `(tabs)/home/settings` | `app/(tabs)/home/settings.tsx` | Placeholder — fetches the menstrual profile, renders "Settings Pages" |
| `(tabs)/logs` | `app/(tabs)/logs.tsx` | Placeholder ("Logs page") with a logout button |
| `(tabs)/calendar` | `app/(tabs)/calendar.tsx` | Main calendar/cycle screen — see detail below |
| `(tabs)/chat` | `app/(tabs)/chat.tsx` | Placeholder ("Chat page") — presumably future chat-with-a-midwife |
| `(tabs)/community` | `app/(tabs)/community.tsx` | Placeholder ("Community page") |

The bottom tab bar (`(tabs)/_layout.tsx`) lists: home, logs, calendar, chat, community, with custom SVG icons and theme colors.

## Calendar / cycle-tracking screen (`app/(tabs)/calendar.tsx`)

This is the most actively developed screen (current branch `feature/calendar-page`). It renders:

1. `SharedNav` — shared header (avatar via DiceBear API keyed by the user's first name, calendar/notification icon buttons).
2. `components/Calendar.tsx` — month view with marked cycle days.
3. A legend: dashed circle = "Predicted Period", solid pink = "Confirmed Period", light blue = "Fertile Window", dark blue = "Ovulation day", pale blue = "Safe days".
4. `components/CircularProgress.tsx` — a ring showing the current cycle day/phase, fed by `useMenstrualProfileViewModel()`'s `data.calendarPage` fields (`phase`, `numberOfDaysIn`, `totalDays`).
5. Two info tiles: "Next Ovulation" and "Pregnancy" probability (see [known-issues.md](./known-issues.md) for a bug in the first one).

### `components/Calendar.tsx`

Wraps `react-native-calendars`' `CalendarProvider` + `ExpandableCalendar`. Pulls a pre-built `markedDates` map from `useMenstrualCycles()`. Custom header (`renderHeader`) shows a calendar icon, month/year (`date-fns format`), a decorative flower image, and manual back/forward chevrons that call a local `shiftMonth(delta)` (the built-in arrows are disabled via `hideArrows={true}`). Uses `markingType="custom"` to support the custom-styled dots/containers produced by `CalendarHelpers`.

### `components/CircularProgress.tsx`

Pure SVG ring built from `react-native-svg`'s `Circle`/`G` primitives (`SIZE=300`, `STROKE_WIDTH=24`). Draws a full gray track circle plus a teal (`#0d6e7a`) progress arc sized by `progress = day/totalDays`, with a small dot marking the arc's end point (trig from the progress angle). Overlays the cycle day text ("Day N"), a phase label, and a phase-specific SVG illustration (`follicular.svg` / `luteal.svg` / `ovulation.svg` / `period_phase.svg`) inside a soft-teal circular badge, selected via a `PhaseImagePair` map keyed by the `phase` prop (expects uppercase values: `MENSTRUATING | OVULATING | LUTEAL | FOLLICULAR`).

### `lib/CalendarHelpers.ts` — cycle-phase calendar marking logic

Two exported functions built on `date-fns`:

- **`generateDays({ startDate, endDate, colorCode, category, customProps })`** — enumerates every day in `[startDate, endDate]` (`eachDayOfInterval`) and produces a `react-native-calendars`-compatible marking object keyed by `"yyyy-MM-dd"`, e.g. `{ [date]: { selected: true, selectedColor, category, ...customProps } }`. `customProps` typically carries a `customStyles.container/text` object for `markingType="custom"` rendering.

- **`extractDates(dates: UserCycleData[])`** — the core algorithm that turns API cycle data into calendar markings. For each cycle record:
  1. **Menstrual/period days** — `generateDays` over `[start_date, bleed_end_date]`, solid pink `#E82A73` if `data.id` is truthy (confirmed/logged cycle), else a dashed pink border on white fill if `data.id === null` (predicted future period, not yet confirmed).
  2. **Ovulation window** — `generateDays` over `[ovulation_day - 2, ovulation_day + 2]`, light blue `#DEE4F5`, category `"OVULATION"` — a 5-day fertile window centered on the predicted ovulation day.
  3. **Safe days** — iterates `data.safe_days` (array of `{start_date, end_date}` ranges from the API), pale blue `#3CB9FB99`, category `"NORMAL"`.
  4. Merges all three per cycle (spread order: `{...ovulationDays, ...safeDays, ...menstrualDays}`), so menstrual-day styling wins over ovulation/safe-day styling on any date collision.

  **Important**: the actual cycle-phase math (ovulation day, safe/fertile windows, luteal/follicular boundaries, pregnancy probability, `next_cycle_start_window`) is computed **server-side**. The mobile app only consumes precomputed fields (`ovulation_day`, `safe_days`, `current_phase`, `pregnancy_probability`, `next_cycle_start_window.{lower,likely_start,upper}`) per `types/menstrual.types.ts`'s `MenstrualProfileInfo` shape. `CalendarHelpers.ts` is purely about turning those API-provided ranges into calendar-marking/visual objects, not about deriving the phases itself.

### Cycle-phase SVG assets

`assets/follicular.svg`, `luteal.svg`, `ovulation.svg`, `ovulation_blue.svg`, `period_phase.svg`, `pregnancy_white.svg`, plus `assets/rafiki.svg` (onboarding illustration).

- `follicular.svg` / `luteal.svg` / `ovulation.svg` / `period_phase.svg` are imported directly as React components in `CircularProgress.tsx` and rendered inside the `PhaseImagePair` lookup map.
- `ovulation_blue.svg` (`BlueOvulation`) and `pregnancy_white.svg` (`PregnancyWhite`) are imported directly in `calendar.tsx` for the "Next Ovulation" / "Pregnancy" info tiles.
- This works because `metro.config.js` registers `react-native-svg-transformer` and treats `.svg` as a source extension, so any `.svg` file can be imported as a component (with `width`/`height`/`color` props) — same pattern used by `assets/icons/*.svg` (`CalendarIcon`, `ChatIcon`, etc.).

## Home screen mood/sentiment feature

Tapping an emoji card (`EmotionCard`) flips to a `SentimentCard` showing "You are feeling X with N others" — this is a **simulated** feature (see [known-issues.md](./known-issues.md)), not a real backend-aggregated count.

## Articles feature

`ArticleCardSM` renders a small article preview card; the Home screen shows a horizontal `FlatList` of these fed by a hardcoded string array — a placeholder for a future CMS-backed articles feed (see [known-issues.md](./known-issues.md) re: the `feature/contentful-fetch` branch name vs. actual code).

## Other reusable components

- `PhoneInput.tsx` — Ghana-only phone input (`+233` hardcoded prefix, formats E.164).
- `DateInput.tsx` — opens `@react-native-community/datetimepicker` in spinner mode, `maximumDate={new Date()}`.
- `MultiStepButton.tsx` — shared Next/Back button pair for the onboarding wizard.
- `MenstrualInfoCard.tsx` — generic icon+text+subtext row card used on the home screen.
- `ShareCard.tsx` + `RadialBackground.tsx` — "Share the Love" referral card with an SVG radial-gradient background.
- `SharedNav.tsx` — reusable header configuration used by both Home and Calendar screens.
- `components/layout/ScreenContainer.tsx` — `KeyboardAvoidingView` + `ScrollView` wrapper (defined but not consistently used — some screens duplicate the pattern inline instead).

## Product scope (inferred from code + git history)

A menstrual-cycle-tracking app (calendar with period/ovulation/safe-day/fertile-window visualization, cycle-phase progress ring, pregnancy-probability indicator) layered with supplementary "women's health companion" features that are still early/scaffolded: mood/sentiment check-ins with social-comparison framing (simulated), an educational articles feed (static, CMS wiring implied but not yet implemented), a referral/share card, and stubbed Chat/Community/Logs tabs — presumably chat-with-a-midwife and community/peer-support features, matching the "Talk To Your Midwife" project name.
