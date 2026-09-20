# Design System

Snapshot as of branch `feat/fun`, 2026-09-19. Sourced entirely from the **Home** tab (`app/(tabs)/home/index.tsx`), the **Calendar** tab (`app/(tabs)/calendar.tsx`, `components/Calendar.tsx`, `components/CircularProgress.tsx`), and the cycle-flow bottom sheet launched from Calendar (`components/cycle-flow/*.tsx`) — these are the two screens with the most consistent, load-bearing design language in the app today. **Consultation screens (`app/(tabs)/consult/**`) were deliberately excluded as a source** and should not be treated as authoritative until reconciled against this doc.

This is a reference, not an aspiration: every value/className below is copied verbatim from real code. Where the code is inconsistent or has drifted, that's called out explicitly in [Known inconsistencies / gaps](#known-inconsistencies--gaps) rather than smoothed over — treat those as things to fix, not patterns to copy.

## Foundations

### Color tokens

Defined in `tailwind.config.js` (`theme.extend.colors`), used via `className`:

| Token | Hex | Typical use |
|---|---|---|
| `primaryColor` | `#0F969C` | Primary buttons, active/selected states, links, icon accents |
| `darkPrimaryColor` | `#015364` | Dark filled cards (`SentimentCard`), gradients |
| `mainText` | `#17252A` | Primary body/heading text color |
| `subText` | `#455A64` | Secondary/subtitle text |
| `borderGreyColor` | `#DADADA` | Default card/input borders, disabled button fill |
| `greyColor` | `#72777A` | Muted captions (e.g. "Welcome back", card subtext) |

Two gradient `backgroundImage` tokens also exist: `radial-glow` and `radial-glow-bottom` (both `radial-gradient(..., #0FCAD2, #015364, #015364)` at different focal points) — used behind `ShareCard`.

`constants/theme.ts` **duplicates** `mainText`, `subText`, and `primaryColor` (same hex values, kept in sync by hand — no single source of truth) because native props like React Navigation's `tabBarInactiveTintColor` can't consume Tailwind classes. It adds one token not present in `tailwind.config.js`: `tabBarItemIconColor: "#B3B3B3"`. If you add a new color token, add it to **both** files.

No custom spacing or border-radius tokens exist — see [Spacing & radius scale](#spacing--radius-scale) for the plain-Tailwind conventions actually in use.

### Typography scale

All from `components/Typography.tsx` — a `<Text>` wrapper per semantic role. **Always use these instead of raw `<Text className="text-lg font-semibold">`-style combos.**

| Component | className | Use |
|---|---|---|
| `PageTitle` | `text-2xl font-display-bold` | Screen-level headline, big stat numbers |
| `SectionHeading` | `text-lg font-display-semibold` | Section headers, bottom-sheet step titles, header name |
| `CardTitle` | `text-base font-display-medium` | Card headline text, month label |
| `Body` | `text-sm font-sans` | Default body copy, subtitles |
| `Label` | `text-sm font-sans-medium` | Emphasized inline text (e.g. summary row values) |
| `Caption` | `text-xs font-sans` | Muted small text (captions, legend labels, step counters) |
| `ButtonText` | `text-base font-sans-semibold` | All button labels |

`font-*` family classes (`font-display-*` = Montserrat, `font-sans-*` = Inter) must never be combined with a generic Tailwind weight utility (`font-bold`, `font-semibold`, `font-medium`) on the same node — RN needs the exact registered font-family name, and the two systems fighting on one element silently picks the wrong weight.

### Spacing & radius scale

No tokens are defined for these — the values below are simply what's used *consistently* across Home/Calendar, and should be treated as the de facto scale:

- **Page padding**: `px-4` horizontal, applied at the screen's root content wrapper.
- **Vertical rhythm**: `mt-5` between major sections, `mb-3` between a `SectionHeading` and the content under it, `my-2` on stacked list-style cards, `my-5` around a standalone row (e.g. the date row on Home).
- **Flex gaps**: `gap-2` / `gap-3` / `gap-4` are the common values. Horizontal `FlatList`s use `contentContainerStyle={{ gap: 10 }}` (raw style — NativeWind can't target `contentContainerStyle` via `className`).
- **Border radius**: `rounded-lg` for simple info-row cards, `rounded-xl` for chip/promo/dark cards, `rounded-full` for every button, avatar, icon badge, and pill.
- **Border width**: `border` (1px, `border-borderGreyColor`) for default card/outline treatment, `border-2` for emphasis — outline buttons (`border-primaryColor`), selected states, icon-button borders.

### Iconography

Local `.svg` files imported directly as React components (via `react-native-svg-transformer`) are the dominant convention — 26 occurrences across 9 files. There is exactly one exception: `FontAwesome` (`@expo/vector-icons/FontAwesome`) is used once, for the back-arrow in `components/MultiStepButton.tsx`.

- Size via `width`/`height` props (these are SVG components, not icon-font components with a `size` prop). Common sizes: `18px` (AppHeader's small circular icon buttons), `20px` (SharedNav's equivalent — see gaps below), `25px` (inline content icons on Home/Calendar headers), `55px` (large decorative flourishes).
- Color via a `color` prop when the SVG supports it (monochrome icons), omitted when the SVG is pre-colored/multi-color.
- `#3A3A3A` is used repeatedly as a hardcoded icon color (not a token — see gaps).

## Components

### Buttons

**Primary, filled, fixed-size** (auth/onboarding screens):
```
bg-primaryColor text-white w-[360px] h-[62px] rounded-full flex items-center justify-center active:opacity-80
```

**Outline counterpart, same size**:
```
bg-white w-[360px] h-[62px] border-2 border-primaryColor rounded-full flex items-center justify-center active:opacity-80
```

**Primary, filled, flexible-width** (the most common variant — cycle-flow steps and similar):
```
bg-primaryColor rounded-full py-4 items-center justify-center mt-4 active:opacity-80
```

**Outline counterpart**:
```
bg-white border-2 border-primaryColor rounded-full py-4 items-center justify-center mt-4 active:opacity-80
```
Inside cycle-flow steps specifically, the outline/secondary button often swaps to a neutral border for "Back"/"Cancel" actions: `border-2 border-borderGreyColor rounded-full py-4 items-center` with `ButtonText` in `text-mainText`.

**Small pill/chip button** (e.g. the calendar error banner's Retry button):
```
bg-primaryColor rounded-full px-4 py-2
```

**Disabled/saving state**: swap `bg-primaryColor` → `bg-borderGreyColor` (text usually stays white or is dimmed via the surrounding component).

All buttons: `rounded-full`, `active:opacity-80` for pressed feedback via `Pressable` + className (one exception — `EmotionCard` uses inline `style={{ opacity: pressed ? 0.5 : 1 }}` instead).

### Selectable pill (chip toggle)

Used for mood/symptom/flow-intensity selection in cycle-flow steps:
```
rounded-full px-4 py-2 border  →  border-primaryColor bg-primaryColor (selected, text-white)
                                →  border-borderGreyColor (unselected, text-mainText)
```
A full-width variant (`FlowIntensityStep`) swaps `border` → `border-2` and toggles border/text color instead of filling the background.

### Cards

**Info-row card** (`MenstrualInfoCard` — the primary stat-row card on Home):
```
bg-white rounded-lg text-sm w-full h-20 drop-shadow-sm border border-borderGreyColor my-2 flex flex-row items-center py-2 px-4
```
Icon passed as raw `children` (no tinted badge wrapper). `CardTitle` for the main text, `Caption className="text-greyColor"` for the subtext.

**Promo/gradient card** (`ShareCard`):
```
h-[100px] w-full relative flex flex-row   (+ a RadialBackground gradient layer behind it)
```
CTA button inside: `bg-[rgba(255,255,255,0.5)] text-white border-2 border-white rounded-full w-[100px] py-2 px-2 flex flex-row items-center justify-center`. Title: `Label className="text-white"`. Subtext: `Body className="text-[#CCDDE0]"`.

**Selectable chip card** (`EmotionCard`):
```
flex items-center justify-center p-2 gap-3 border border-borderGreyColor rounded-xl w-[70px] h-[90px]
```

**Article card** (`ArticleCardSM`):
```
flex items-center justify-center p-2 gap-3 border border-borderGreyColor rounded-xl w-[271px] h-[230px]
```
Image: `borderRadius: 10`, `contentFit="cover"`.

**Dark filled card** (`SentimentCard`):
```
bg-darkPrimaryColor rounded-xl h-[100px] p-4 w-full relative
```
All text `text-white`.

**Bordered stat card with icon badge** (Calendar's "Next Ovulation"/"Pregnancy" cards):
```
border-2 border-[accentColor] flex-row rounded-xl p-4 items-center gap-5
```
Paired with an icon badge (see below) and `Caption className="text-greyColor"` label + `PageTitle` value.

### Icon badges

**Tinted circular badge** (accent color at ~10% alpha + solid-color icon) — the more common form, e.g. a cycle-flow intro icon:
```
w-20 h-20 rounded-full bg-[#0F969C1A] items-center justify-center
```
Calendar's "Next Ovulation" badge uses the same idea at a smaller size with its own accent: `bg-[#07226B30] rounded-full w-[50px] h-[50px] items-center justify-center` (`30` = ~19% alpha).

**Solid-fill circular badge** (accent color at full opacity, white icon) — Calendar's "Pregnancy" badge:
```
bg-[#AF52DE] w-[50px] h-[50px] p-2 rounded-full
```
Use the tinted version by default; reserve the solid-fill version for a card that specifically wants to read as more emphatic/alert (as Pregnancy probability does here).

### Alert / banner

The one existing instance in the app (`calendar.tsx`, added when wiring up query-error handling) — treat this as the canonical pattern until/unless a shared `Banner` component is extracted:
```tsx
<View className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex-row items-center justify-between gap-3">
  <Body className="text-red-600 flex-1">Couldn't load your cycle data. Please try again.</Body>
  <Pressable onPress={retry} className="bg-primaryColor rounded-full px-4 py-2">
    <ButtonText className="text-white">Retry</ButtonText>
  </Pressable>
</View>
```
Note this uses `rounded-lg`, not the `rounded-xl`/`rounded-full` used elsewhere for cards/buttons — intentionally slightly less rounded to read as distinct/utilitarian.

### Bottom sheet (cycle-flow)

Hosted by `CycleFlowSheet.tsx` via `@expo/ui`'s `BottomSheetModal`/`BottomSheetView` (not `@gorhom/bottom-sheet`). **No custom chrome theming exists** — no `handleStyle`/`backgroundStyle`/corner-radius override is passed anywhere; the sheet renders the platform's native default chassis. The only customization is a floating close button:
```
absolute top-4 right-4 z-10 bg-[#00000010] rounded-full p-1
```
(Ionicons `close`, `size={18}`, `color="#3A3A3A"`.)

**Step screen anatomy**, repeated across all 12 step components:
1. Root: `bg-white px-6 pt-8 pb-8` (form-style steps) or `bg-white items-center px-8 py-8` (message/confirmation steps).
2. Step counter: `Caption className="text-subText text-center"` — e.g. "Step 1 of 3".
3. Title: `SectionHeading className="text-mainText text-center mt-1 mb-1"` — titles are consistently emoji-prefixed (e.g. "🩸 When did your period start?").
4. Subtitle: `Body className="text-subText text-center mb-4"`.
5. Primary button, then (optionally) outline "Back"/"Cancel" button, per the [Buttons](#buttons) section.

**Summary row** (label/value definition-list row, `SummaryStep`'s `SummaryRow`):
```tsx
<View className="flex-row items-center justify-between mb-2">
  <Caption className="text-subText">{label}</Caption>
  <Label className="text-mainText">{value}</Label>
</View>
```

**Status pill** (`SuccessStep`):
```
bg-[#0F969C1A] rounded-full px-3 py-1
```
containing `Caption className="text-primaryColor"`.

### Header

`AppHeader.tsx`:
```
container: flex-row items-center justify-between px-4 pb-2  (+ style paddingTop: insets.top + 16)
avatar: rounded-full overflow-hidden w-[50px] h-[50px]
greeting: Body.text-greyColor "Welcome back" + SectionHeading.text-mainText {name}
icon button: border-2 border-borderGreyColor w-[44px] h-[44px] rounded-full items-center justify-center
notification badge: absolute -top-1 -right-1 bg-[#E82A73] rounded-full w-[18px] h-[18px]
```

### Calendar-specific

**Day-marking colors** (from `lib/CalendarHelpers.ts` — coloring is done entirely per-day via `markedDates`/custom styles, there is no calendar-wide `theme` color object):

| State | Color |
|---|---|
| Confirmed period | `#E82A73` solid fill, white text |
| Predicted period | white fill, `#E82A73` dashed 1px border, black text |
| Fertile window | `#DEE4F5` fill, black text |
| Ovulation day | `#07226B` fill, white text |
| Safe days | `#3CB9FB50` fill (~31% alpha), black text |

All day-cell containers share the same shape: `width: 35.43, height: 30, borderRadius: 40`.

**Legend swatches** (matching the above, as rendered in `calendar.tsx`): `w-4 h-4 rounded-full`, either solid `bg-[hex]` (confirmed states) or `border border-dashed border-[hex]` (predicted state).

**`CircularProgress`** (the cycle-day ring): built with raw `react-native-svg` (`Svg`/`Circle`/`G`), not a third-party ring library. Track `#F5F5F5`, progress stroke `#0d6e7a` (⚠️ see gaps — this is *not* `primaryColor`). Behind it, a tinted halo: `bg-[#0F969C1A] w-[230px] h-[230px] rounded-full`. Center text currently uses raw `text-gray-900`/`text-5xl` rather than a `Typography.tsx` component/token (see gaps).

## Loading & empty states

There is **no shared loading component** — every screen inlines its own, inconsistently:
- `calendar.tsx` / `Calendar.tsx`: `<Body>Loading...</Body>` (bare, unwrapped).
- `home/index.tsx`: `<View><Body>Loading</Body></View>` (no ellipsis, wrapped in an unstyled `View`).

Until a shared component is introduced, match the `calendar.tsx` form (`<Body>Loading...</Body>`, no wrapper) as the closer-to-consistent default rather than inventing a third variant. No empty-state UI (e.g. "no cycles yet") exists anywhere in Home/Calendar — an empty query result just renders the screen with nothing marked/populated.

## Known inconsistencies / gaps

Found while researching this doc — listed so they're not mistaken for intentional patterns to replicate:

- **`tailwind.config.js` vs `constants/theme.ts`** duplicate `mainText`/`subText`/`primaryColor` by hand, no single source of truth.
- **`#3A3A3A`** is used as a hardcoded icon color in 4 places (`AppHeader.tsx`, `home/index.tsx`, `components/Calendar.tsx`, `SharedNav.tsx`) but isn't a defined token — likely should reconcile with `mainText` or become an explicit `iconColor` token.
- **`CircularProgress`** uses an off-token teal (`#0d6e7a`, not `primaryColor` `#0F969C`) and raw Tailwind `text-gray-900`/`text-5xl` instead of `mainText`/a `Typography.tsx` component.
- **Dead/stray classNames**: a literal `.border-2` string (not a real Tailwind class) in `calendar.tsx`'s legend rows, and `border-amber-500` debug leftover in `Calendar.tsx`'s header row.
- **`AppHeader` vs `SharedNav`** render near-identical header UI but with different icon sizes (18px vs 20px) — a drift worth reconciling into one shared component.
- **No calendar `theme` object exists** — all `react-native-calendars` coloring is per-day via `markedDates`, so don't assume there's a central palette to extend; add new day-states the same per-day way.
- **Loading states are ad hoc** per screen (see above) — no shared component yet.
- Calendar's "Next Ovulation" stat card shows a hardcoded **"15 Days"**, not real data (already tracked in `docs/known-issues.md`).

## How to use this doc

- Prefer `components/Typography.tsx` exports over raw `<Text className="...">` — always.
- Reuse the className strings above **verbatim** for buttons/cards/badges rather than approximating a "close enough" variant — the whole point is visual consistency across screens built at different times.
- Need a new color? Add a named token to **both** `tailwind.config.js` and (if it's needed in a native-prop context) `constants/theme.ts` — don't drop in another one-off hex literal.
- Treat everything in [Known inconsistencies / gaps](#known-inconsistencies--gaps) as bugs to eventually fix, not precedent — if you're touching one of those files anyway, prefer reconciling it over extending it further.
