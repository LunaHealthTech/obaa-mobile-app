# Known Issues / Placeholders / Cleanup Notes

Snapshot as of branch `feature/calendar-page`, 2026-07-21. Re-verify against current code before relying on any of this — the app is in active early development and these may already be fixed.

## Bugs

- **`CircularProgress.tsx` default `phase` prop mismatch** — the component's default prop is `phase = "Follicular"` (capitalized), but the `PhaseImagePair`/`PhaseWordPair` lookup maps are keyed by uppercase enum values (`"MENSTRUATING" | "OVULATING" | "LUTEAL" | "FOLLICULAR"`). The default therefore won't match any map key and renders `undefined`. The real caller in `calendar.tsx` passes `data?.calendarPage.phase` (the raw `status` string from the API), which must match those uppercase keys to render correctly — worth double-checking the API actually returns uppercase values.
- **`components/Calendar.tsx`** renders a bare `"loading..."` string while `isLoadingMenstrualCycles`, not wrapped in a `<Text>` component — RN will warn/error on this ("Text strings must be rendered within a <Text> component").
- **Calendar screen's "Next Ovulation" tile is hardcoded** to "15 Days" text rather than wired to the viewmodel's computed `nextOvulationIn` value.

## Placeholder / simulated features (not real yet)

- **Sentiment sharing is fake**: `SentimentCard` shows "You are feeling X with N others" where `N` is generated via `Math.random()`, not a real backend-aggregated count. Matches the "sentiment sharing simulation" commit — flag before treating this as a real feature.
- **Articles feed is fully static**: despite a past branch/commit named `feature/contentful-fetch`, there is **no Contentful SDK or any CMS integration in the codebase** (confirmed via dependency and repo-wide search). `ArticleCardSM` and the Home screen's article `FlatList` use a hardcoded string array and a single local image. Real CMS wiring is still pending/future work.
- **Social login buttons** (Facebook/Google/Apple icons on the sign-in screen) have no handlers wired up — decorative only.
- **`(tabs)/chat`, `(tabs)/community`, `(tabs)/logs`, `(tabs)/home/settings`** are all placeholder screens with stub text (e.g. "Chat page", "Community page", "Logs page", "Settings Pages").

## Hardcoded / non-general logic

- **Ghana-only phone numbers**: `PhoneInput.tsx` hardcodes a `+233` prefix and strips non-digits; the zod regex in `FormSchemas.ts` enforces the same assumption. Will need generalizing for other markets.
- **`lib/apiClient.ts` `BASE_URL`** is hardcoded to `"http://10.0.2.2:8000/api/v1"` (Android emulator's alias for host localhost), with a `// TODO: find a replacement for this` comment already in the code. No environment-based config (`.env`) exists yet — needed before this can point at a real staging/prod backend or work on iOS/web.

## Dead code / cleanup candidates

- **`App.tsx` and `index.ts`** at the repo root are leftover Expo bare-template scaffolding (`registerRootComponent(App)`, including a placeholder "Prince here. Time to start working on this application!" string). The actual entry point is `expo-router/entry` per `package.json`, so these files are not used and are likely safe to delete.
- **`console.log` debugging statements** are pervasive across services/viewmodels/screens (`authService.ts`, `menstrualService.ts`, `useAuth.ts`, `home/index.tsx`, etc.), several explicitly marked `// TODO: remove these`.
- **Theming duplication**: color tokens exist in both `tailwind.config.js` (className usage) and `constants/theme.ts` (plain JS, for native props like tab bar tint colors) — kept manually in sync rather than a single source of truth. Worth consolidating if colors start drifting.
- **`useMenstrualStore`** (defined inside `services/menstrualService.ts`, not in `repositories/` with the other stores) appears largely superseded by react-query caching — worth confirming it's still needed or removing/relocating it.
- **`components/layout/ScreenContainer.tsx`** exists but isn't consistently used; some screens duplicate its `KeyboardAvoidingView`/`ScrollView` wrapper pattern inline instead.

## Testing gap

No test framework, test files, or `test` script exist anywhere in the project's own code (only third-party `*.test.*` files inside `node_modules`). Worth setting up Jest + React Native Testing Library, especially before the API/backend integration and calendar-phase logic solidify further.
