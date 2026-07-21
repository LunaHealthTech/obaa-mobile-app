# Architecture

## Stack

- **Expo** `~54.0.30`, **React Native** `0.81.5`, **React** `19.1.0`, **TypeScript** `~5.9.2` (strict mode).
- **expo-router ~6.0.23** for file-based routing (`"main": "expo-router/entry"` in `package.json`). New Architecture enabled (`newArchEnabled: true` in `app.json`).
- **NativeWind v4** (Tailwind for RN) is the dominant styling method via `className`; a few components still use plain `StyleSheet.create`.
- **@tanstack/react-query** for server state, **zustand** for client/global state, **react-hook-form + zod** for forms/validation, **axios** for HTTP, **date-fns** for date math, **react-native-calendars** for the calendar UI, **react-native-svg** (+ `react-native-svg-transformer`) so `.svg` files import as React components, **react-native-mmkv** for fast local KV storage, **expo-secure-store** for auth tokens.
- No test framework is configured (no `test` script, no jest/vitest/testing-library dependency).

> Note: `App.tsx` and `index.ts` at the repo root are leftover Expo bare-template boilerplate (`registerRootComponent(App)`). They are **not** the actual entry point — `expo-router/entry` is — and are effectively dead code.

## Folder structure

```
app/            expo-router file-based routes (screens)
components/     Reusable presentational components (+ components/layout/)
constants/      Static config: theme colors, typography, asset requires
lib/            Cross-cutting utilities: API client, react-query client, zod schemas, calendar/date helpers
providers/      App-wide React context/provider composition (AppProviders.tsx)
repositories/   Zustand stores (persisted client state, not classic data-access repositories)
services/       API-calling functions by domain (auth, menstrual) + storage adapters (mmkv, secure-store)
types/          Shared TypeScript types, segregated by domain (auth, menstrual, onboarding, emotion)
viewmodel/      Custom hooks combining react-query + zustand + business logic ("ViewModels")
assets/         Images, SVGs (icons/ subfolder), app icons/splash
```

## Layering pattern: hooks-as-ViewModels (MVVM-flavored)

This is the one deliberate, non-obvious architectural choice in the codebase — most RN apps just put everything in a flat `hooks/` or `store/` folder. Here the flow is:

```
Screen (app/**)  →  viewmodel/use*.ts  →  services/*Service.ts (API)
                                       →  repositories/*Store.ts (Zustand + MMKV)
```

- **`services/*Service.ts`** — pure API call functions (the "Model"/data layer), thin wrappers around the shared `apiClient` axios instance.
- **`repositories/*Store.ts`** — Zustand stores for persisted/global client state (auth session, settings). Despite the folder name, these are state stores, not repository-pattern data-access classes.
- **`viewmodel/use*.ts`** — hooks combining `useQuery`/`useMutation` with the stores and services, exposing a ViewModel object (`data`, `isLoading`, action functions) to screens.
- Screens mostly consume only the viewmodel hooks. There are a few leaks where a screen reads `useAuthStore` directly (e.g. `SharedNav.tsx`) instead of going through a viewmodel.

Key viewmodels:
- **`viewmodel/useMenstrualProfile.ts`** — wraps `getMenstrualInfo`/`createMenstrualProfile`/`updateMenstrualInfo`. The query's `select` transforms raw API cycle data into two view-ready shapes: `general` (home screen cards) and `calendarPage` (calendar/CircularProgress screen), computing `yourPeriodStarted`, `numberOfDaysIn`, `nextOvulationIn` via `date-fns`. Redirects to `/(tabs)/home` on successful profile creation; toasts via `sonner-native`.
- **`viewmodel/useCycles.ts`** — wraps `getMenstrualCycles`, pipes the result through `lib/CalendarHelpers.ts`'s `extractDates` to build the `react-native-calendars` `markedDates` object. 24-minute stale time.
- **`viewmodel/useAuth.ts`** — wraps `signIn`/`signUp` mutations, coordinates with `useAuthStore` (persists tokens + user, navigates to `(tabs)` or `/onboarding/persona` depending on `menstrual_profile_created`) and sign-up draft state.

## State management

Three layers, no heavy Context/Redux usage:

- **Server state**: react-query, single shared `queryClient` (`lib/queryClient.ts`: `staleTime` 5 min, `gcTime` 10 min, retry 2 for queries / 0 for mutations, no refetch-on-focus). Wired app-wide via `providers/AppProviders.tsx`.
- **Global client state** (`repositories/`):
  - `useAuthStore.ts` — `user`, `token`, `status` (`loading | authenticated | unauthenticated`), `signUpItems` (multi-step signup draft). Not persisted via zustand `persist` middleware — uses `TokenStorage`/SecureStore plus a manual `rehydrate()` called once in `AppProviders`.
  - `useSettingsStore.ts` — theme/locale/notifications/onboarding-seen flags, persisted via `zustand/persist` + MMKV.
  - `useMenstrualStore` (defined inside `services/menstrualService.ts`, oddly co-located with API functions rather than living in `repositories/`) — persisted menstrual profile/cycles cache via MMKV; appears largely superseded by react-query caching in current usage.
- **Local component state**: plain `useState` for wizard steps, date pickers, password visibility, etc.

MMKV instance: `services/mmkvStorage.ts` creates `createMMKV({ id: "obaa-store" })` and adapts it to zustand's `StateStorage` interface for the `persist` middleware.

## Routing & auth guard

`app/_layout.tsx`:
- Loads Inter & Montserrat fonts, hides splash screen once ready.
- Wraps the app in `SafeAreaProvider` → `GestureHandlerRootView` → `AppProviders` (react-query + auth rehydrate) → `Stack`.
- Uses **`Stack.Protected`** (expo-router v6 auth-guard API), keyed off `useAuthStore((s) => s.status)`:
  - authenticated → exposes `(tabs)` and `onboarding` route groups.
  - not authenticated → exposes `intro`, `signin`, `signup`.
- `unstable_settings.initialRouteName = "intro"`.

Post-login routing branches on onboarding completion: `useAuth.ts`'s `signIn` success handler checks `data.user.menstrual_profile_created` to decide between `/(tabs)` and `/onboarding/persona`.

## Backend / API integration

- `lib/apiClient.ts` — axios instance. `BASE_URL` is hardcoded to `"http://10.0.2.2:8000/api/v1"` (Android emulator alias for host localhost), marked with a `// TODO: find a replacement for this` — no environment-based config yet, no `.env` files in the repo. Request interceptor attaches `Authorization: Bearer <token>` from `TokenStorage` (SecureStore). Response interceptor implements a 401 → refresh-token retry flow with a request queue (`isRefreshing`/`failedQueue`) to avoid duplicate refresh calls, force-logging-out via `useAuthStore.getState().logout()` if refresh fails.
- `services/authService.ts` — `signIn`/`signUp` → `POST /auth/login/`, `POST /auth/register/`.
- `services/menstrualService.ts` — `getMenstrualInfo` (`GET /menstrual/profile/`), `updateMenstrualInfo` (`PUT /menstrual/profile/`), `createMenstrualProfile` (`POST /menstrual/profile/`), `getMenstrualCycles` (`GET /menstrual/cycles`).
- `services/tokenStorage.ts` — thin wrapper over `expo-secure-store` for access/refresh tokens.
- **No Contentful/CMS integration exists in code**, despite a past branch/commit named `feature/contentful-fetch` — see [known-issues.md](./known-issues.md).

## Styling

- NativeWind v4 `className` usage is dominant across screens/components.
- `tailwind.config.js` — content globs over `app/**` and `components/**`; custom color tokens (`mainText`, `subText`, `primaryColor` `#0F969C`, `darkPrimaryColor`, `borderGreyColor`, `greyColor`) and two radial-gradient `backgroundImage` utilities (`radial-glow`, `radial-glow-bottom`).
- `global.css` is the Tailwind entry, wired into Metro via `withNativeWind` in `metro.config.js`; `babel.config.js` sets `jsxImportSource: "nativewind"` + the `nativewind/babel` preset.
- `constants/theme.ts` duplicates some of the same color values in plain JS for contexts where className doesn't apply (e.g. `tabBarActiveTintColor`/`tabBarInactiveTintColor` in `(tabs)/_layout.tsx`) — kept manually in sync rather than a single source of truth.

## TypeScript config

- Extends `expo/tsconfig.base`, `strict: true`.
- Path alias `"@/*": ["./*"]` used everywhere (`@/components/...`, `@/lib/...`, `@/services/...`, `@/viewmodel/...`, `@/types/...`, `@/constants/...`, `@/assets/...`).
- `typeRoots: ["./types"]`; `types/svg.d.ts` declares the `*.svg` module type so SVG imports type-check as React components.
- `app.json` sets `"experiments": { "typedRoutes": true }` for expo-router typed routes.
