# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"TTYM" = **Talk To Your Midwife**. Product-facing brand name is **Obaa** ("woman" in Twi), by Ergon Pulse — a menstrual-cycle-tracking companion app expanding into broader women's health features (consultation booking, chat with a midwife, community support, educational articles).

There is a `docs/` folder (`docs/architecture.md`, `docs/features.md`, `docs/known-issues.md`) generated from a full codebase exploration on 2026-07-21. Treat it as a snapshot, not a live source of truth — prefer this file plus the actual code for anything commands/architecture-related, and check `docs/known-issues.md` before touching a screen it flags.

## Commands

```
npm run start   # expo start — main dev server (scan QR / press a/i/w)
npm run android # expo run:android — native build, requires Android SDK/emulator
npm run ios     # expo run:ios — native build, requires Xcode/simulator (macOS only)
npm run web     # expo start --web
npm run lint    # expo lint (ESLint, flat config in eslint.config.js)
npx tsc --noEmit -p .   # type-check (no dedicated npm script)
```

- **No test framework is configured** — no `test` script, no jest/vitest/testing-library dependency, no test files anywhere in first-party code. Don't assume `npm test` exists.
- The project currently has a number of pre-existing `tsc` errors (react-hook-form generic mismatches, `expo-image` prop typing, implicit-`any` params, etc.) scattered across `app/`, `components/`, `services/`, `viewmodel/`. These predate any given change — when running `npx tsc --noEmit`, diff against this baseline rather than treating every reported error as something you introduced.
- An `android/` folder exists (native project, from `expo-dev-client` / prebuild) — don't hand-edit native files unless the task specifically requires it.

## Architecture

### Stack

Expo `~54` + Expo Router `~6` (file-based routing, typed routes enabled via `experiments.typedRoutes` in `app.json`) + React Native `0.81` + React `19` + TypeScript `~5.9` (`strict: true`). NativeWind v4 (`className`) is the dominant styling method. `@tanstack/react-query` for server state, `zustand` for client state, `react-hook-form` + `zod` for forms, `axios` for HTTP, `date-fns` for date math, `react-native-calendars` for the calendar, `react-native-mmkv` for local KV storage, `expo-secure-store` for auth tokens.

Path alias `@/*` → repo root (see `tsconfig.json`). `app/_layout.tsx` + `index.ts`/`App.tsx` at repo root are **dead code** (`expo-router/entry` is the real entry point per `package.json`'s `main` field).

### Layering: hooks-as-ViewModels (MVVM-flavored)

The one deliberate, non-obvious architectural choice here — most RN apps just use a flat `hooks/`/`store/` folder:

```
Screen (app/**)  →  viewmodel/use*.ts  →  services/*Service.ts (API calls, axios)
                                       →  repositories/*Store.ts (Zustand + MMKV, persisted client state)
```

- `services/*Service.ts` — pure API functions, thin wrappers over the shared `lib/apiClient.ts` axios instance.
- `repositories/*Store.ts` — despite the name, these are Zustand state stores, not data-access repositories.
- `viewmodel/use*.ts` — combine `useQuery`/`useMutation` with stores/services, exposing `{ data, isLoading, actions }` to screens. Screens should consume viewmodels, not call services/stores directly (a few existing screens leak this, e.g. reading `useAuthStore` directly — don't propagate that pattern into new code).
- Key existing viewmodels: `useMenstrualProfile.ts` (profile CRUD + derived calendar/home view shapes), `useCycles.ts` (cycle data → `react-native-calendars` marking objects via `lib/CalendarHelpers.ts`), `useAuth.ts` (sign in/up, session + post-login routing).

### Routing conventions (expo-router)

- Tab bar is `app/(tabs)/_layout.tsx` (a `<Tabs>`). Each `Tabs.Screen` maps to either a flat file (`app/(tabs)/logs.tsx`) or a **folder** (`app/(tabs)/home/`, `app/(tabs)/consult/`) when that tab needs its own sub-pages/back-navigation.
- **Nested-tab-stack pattern** (used by `home/` and `consult/`): the folder has its own `_layout.tsx` rendering a `<Stack>` with one `Stack.Screen` per sub-route. The outer `Tabs.Screen` entry in `app/(tabs)/_layout.tsx` sets `headerShown: false` to suppress the redundant tab-level header chrome; the inner `Stack`'s screens then own the real header — either via `options` in the nested `_layout.tsx` (see `home/_layout.tsx`'s `settings` screen, which supplies a custom `headerLeft` back-chevron `Link`), or dynamically from *inside* the screen component by rendering `<Stack.Screen options={...} />` (this is what `SharedNav` does — it's not a visible component, it's a header-configuring side effect). If a screen builds a fully custom in-body header (no `<Stack.Screen>` render), its entry in the nested `_layout.tsx` must explicitly set `headerShown: false`, or the Stack's default header will double up above it.
- Auth guard: `app/_layout.tsx` uses `Stack.Protected`, keyed off `useAuthStore((s) => s.status)` — authenticated exposes `(tabs)`/`onboarding`, unauthenticated exposes `intro`/`signin`/`signup`.
- Post-login routing branches on `data.user.menstrual_profile_created` (see `useAuth.ts`) between `/(tabs)` and `/onboarding/persona`.

### State management

Three layers, no Context/Redux:
- **Server state**: react-query, single `queryClient` (`lib/queryClient.ts`, 5 min staleTime).
- **Global client state** (`repositories/`): `useAuthStore` (session; token persistence via `TokenStorage`/SecureStore + manual `rehydrate()`, not zustand `persist`), `useSettingsStore` (persisted via `zustand/persist` + MMKV).
- `useMenstrualStore` is defined inside `services/menstrualService.ts` rather than `repositories/` — an inconsistency to be aware of, not a pattern to copy.

### Styling conventions worth matching

- Color tokens live in **both** `tailwind.config.js` (`primaryColor` `#0F969C`, `darkPrimaryColor`, `borderGreyColor`, `greyColor`, `mainText`, `subText`) and `constants/theme.ts` (plain JS, for native props like `tabBarActiveTintColor` where `className` doesn't apply) — kept manually in sync, no single source of truth.
- Common component conventions (established across `MenstrualInfoCard`, `ArticleCardSM`, calendar legend/stat-card blocks): cards = `bg-white rounded-lg|xl border border-borderGreyColor`; icon badges = circular, pale-tint background via hex+alpha suffix (e.g. `bg-[#0F969C1A]`) with a solid-color icon/border variant for emphasis; primary buttons = `bg-primaryColor rounded-full`, outline variant = `bg-white border-2 border-primaryColor` with `text-primaryColor`.
- Typography is standardized via `components/Typography.tsx` (`PageTitle`, `SectionHeading`, `CardTitle`, `Body`, `Label`, `Caption`, `ButtonText`) — a `<Text>` wrapper per semantic role, screens should use these instead of raw `<Text className="text-lg font-semibold" ...>` combos. Each role's classes reference `fontFamily` tokens defined in `tailwind.config.js` (`font-sans`/`font-sans-medium`/`font-sans-semibold`/`font-sans-bold` for Inter, `font-display`/`font-display-medium`/`font-display-semibold`/`font-display-bold` for Montserrat) that must exactly match the font names registered via `useFonts()` in `app/_layout.tsx`. Never combine one of these `font-*` family classes with a generic Tailwind weight utility (`font-bold`/`font-semibold`/`font-medium`) on the same node — RN needs the exact per-weight family name to render custom fonts correctly, so the two systems fighting on one element silently picks the wrong weight.
- `.svg` files import directly as React components (via `react-native-svg-transformer`, configured in `metro.config.js`), taking `width`/`height`/`color` props.

### Backend / API

- `lib/apiClient.ts` — axios instance, `BASE_URL` hardcoded to `http://10.0.2.2:8000/api/v1` (Android emulator's alias for host localhost) with a `// TODO: find a replacement`. No `.env`/environment-based config exists yet.
- Request interceptor attaches `Authorization: Bearer <token>`; response interceptor implements 401 → refresh-token retry with a request queue, force-logout on refresh failure.
- No Contentful/CMS integration exists despite a past `feature/contentful-fetch` branch name — articles are still a hardcoded static list.

## Known gaps to check before touching related code

See `docs/known-issues.md` for the full list; the ones most likely to bite:
- `CircularProgress.tsx`'s default `phase` prop (`"Follicular"`) won't match its uppercase-keyed lookup maps — only the real caller path (passing the API's uppercase status) works.
- Sentiment "sharing" counts and the calendar's "Next Ovulation" tile value are hardcoded/simulated, not real backend data.
- `PhoneInput.tsx` and its zod schema are Ghana-only (`+233` hardcoded).
- `tsconfig.json` sets `typeRoots: ["./types"]`, which replaces (not merges with) the base config's typeRoots — if a future dependency needs ambient types from `node_modules/@types`, this is why they might not resolve.
