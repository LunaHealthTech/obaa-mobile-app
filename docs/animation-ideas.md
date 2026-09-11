# Animation Ideas — Making the App Feel Alive

Snapshot as of 2026-09-05. This is a survey of where "cute and thoughtful" micro-animation would add delight, plus how to build it without hurting performance. Nothing here is implemented yet — treat it as a backlog/menu to pick from, not a live plan. Re-verify file/line references against current code before acting on any of this.

## Current state

`react-native-reanimated` (~4.1.1), `react-native-gesture-handler` (~2.28), and `react-native-svg` (15.12.1) are installed, but animation usage is limited to exactly 3 files — `app/intro.tsx`, `components/splash/AnimatedLogo.tsx`, `app/(tabs)/consult/finding-midwife.tsx` — all hand-rolled `useSharedValue`/`withTiming`/`withRepeat`. Reanimated's declarative **Layout Animations** (`entering`/`exiting`/`layout` props, `FadeIn`, `SlideInRight`, `LinearTransition`, etc.) are never used anywhere despite shipping with the installed version — this is the single biggest "free" opportunity in the codebase. `react-native-gesture-handler` is wired up at the root (`GestureHandlerRootView` in `app/_layout.tsx`) but never used for an actual gesture. No haptics (`expo-haptics` isn't installed). Almost every screen outside the consult-booking flow and splash screen is fully static: `home`, `calendar`, `onboarding` have real static content; `logs.tsx` and `community.tsx` are still literal placeholder stubs.

## The technical playbook (apply consistently wherever animation gets added)

- **Animate `transform`/`opacity` only.** These composite on the UI thread without triggering layout/paint. Never drive `width`/`height`/`margin` directly with a shared value — for size/position changes on mount, unmount, or reorder, use Reanimated's **Layout Animations** instead (`entering={FadeInDown}`, `exiting={FadeOutUp}`, `layout={LinearTransition}` props on `Animated.View`). These run as UI-thread worklets automatically, no manual shared-value plumbing, and are the correct tool for: list-item entrance, conditional-render swaps, step-wizard transitions, card stagger-in on mount.
- **`useSharedValue`/`useAnimatedStyle` for continuous or state-driven animation** — pulsing loaders, progress rings, countdown ticks, press-scale feedback. This is the pattern already established in `finding-midwife.tsx` and `AnimatedLogo.tsx`; keep using it for anything tied to a changing number rather than a mount/unmount event.
- **Worklets already run on the UI thread for free** — the Reanimated Babel plugin is active via `babel-preset-expo` (confirmed, no extra config needed), so none of this needs `runOnJS` except to bridge back to React state (e.g. a `useState` set from an `onEntranceComplete` callback, the pattern already used in `AnimatedLogo.tsx`). Keep `runOnJS` calls rare and outside hot loops.
- **Gesture-driven feedback should use `react-native-gesture-handler` + Reanimated together**, not `Pressable`'s default opacity. RNGH gestures are worklet-based (UI thread), so a press-scale/press-haptic response has zero JS-bridge round trip. Worth building one small reusable `AnimatedPressable` (scale 1→0.94→1 on press-in/out via `withTiming`, optional `Haptics.impactAsync`) since press feedback is currently missing or inconsistent (bare `active:opacity-80` in a few places, nothing in others — `SharedNav`'s avatar/bell, `ArticleCardSM`, tab bar icons) and this single component would cover 6+ spots.
- **List perf**: none of the app's 5 `FlatList` usages (`home/index.tsx` x2, `choose-midwife.tsx` x2, `match-preferences.tsx`) currently pass `getItemLayout`/`windowSize`/`initialNumToRender`. Adding entrance animation to list items is safe as-is at current (small) list sizes, but if any of these lists grow, add those tuning props before/alongside animating — otherwise off-screen items animating in as they mount can cause jank on lower-end Android hardware (this app's real-world audience per the Ghana/GHS context — test on a mid/low-tier Android device, not just a simulator).
- **Haptics**: `expo-haptics` isn't installed. It's a tiny native module (already compatible with this project's dev-client/prebuild setup). Pair a light `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` with key delight moments — mood selection, booking confirmation, countdown milestones — so "thoughtful" is felt, not just seen.
- **Respect reduced motion**: Reanimated ships `useReducedMotion()` — gate purely decorative continuous loops (pulsing, floating) behind it so the app doesn't fight an OS-level accessibility setting.
- **Reuse the existing per-shape-animation pattern** from `components/splash/ObaaMark.tsx` (`Animated.createAnimatedComponent(Path)` driven by `useAnimatedProps`) for the calendar's `CircularProgress` ring — same technique, applied to `react-native-svg`'s `Circle` instead of `Path`.

## Screen-by-screen opportunities

### Home (`app/(tabs)/home/index.tsx`)
- **4x `MenstrualInfoCard`**: staggered mount entrance — `entering={FadeInDown.delay(i * 80)}` per card. Zero shared-value code needed.
- **Mood picker → `SentimentCard` swap**: currently an instant boolean-toggle snap. Wrap the conditional render in `entering`/`exiting` (e.g. `FadeIn`/`FadeOut` or `SlideInUp`/`SlideOutDown`) so picking a mood visibly "reveals" the sentiment card instead of popping in.
- **`EmotionCard` tap**: press-scale bounce (`scale` 1→0.9→1 via `withSequence`) + optional haptic tick — the single most-tapped element on this screen, worth the polish.
- **Article carousel (`ArticleCardSM`)**: same stagger entrance as the info cards.
- **Notification bell**: no unread badge exists yet, but when one lands, a `withSequence(withTiming(1.3), withSpring(1))` scale-bump on count change would make it read as "alive" rather than a static icon.
- **Bare "Loading" text**: swap for a soft pulsing placeholder (`opacity` looping 0.4↔1 via `withRepeat`, gated behind `useReducedMotion`) instead of plain text.

### Calendar (`app/(tabs)/calendar.tsx`, `components/Calendar.tsx`, `components/CircularProgress.tsx`)
- **`CircularProgress` ring — the best single opportunity in the app.** It's currently a fully static SVG arc (drawn once via trig + `strokeDasharray`, never animated). Convert to `Animated.createAnimatedComponent(Circle)` (same pattern as `ObaaMark.tsx`) and sweep the arc in via `withTiming` on mount/whenever `day` changes — makes the cycle-progress ring feel like it's counting up to "today," which is exactly the kind of moment worth being cute about in a cycle tracker.
- Phase illustration (Follicular/Ovulation/etc. SVG) swap: crossfade with `entering={FadeIn}`/`exiting={FadeOut}` instead of an instant swap.
- **Stat tiles ("Next Ovulation", "Pregnancy")**: a one-shot count-up on the number (e.g. "15 Days" ticking up from 0). This is low-frequency and one-shot, so a simple JS-interval-driven counter is fine here — forcing it through Reanimated's `useAnimatedProps` onto a `Text` node is more machinery than the moment warrants.
- Legend dots: one-time stagger entrance on screen mount.
- Month-navigation chevrons: press-scale feedback via the shared `AnimatedPressable`.

### Consult flow (already built — small additive polish, not new screens)
- `booking-confirmation.tsx`'s success checkmark: entrance "pop" (scale 0→1.15→1 spring) instead of a static render — first thing seen after paying.
- `appointment.tsx`'s countdown tiles: a brief scale-bump on each tile when its value ticks (especially the seconds tile) instead of an instant text swap.
- `checkout.tsx`'s existing `ActivityIndicator` during "Processing...": pair with a subtle button pulse for extra reinforcement (already has the spinner, this is additive only).

### Onboarding (`app/onboarding/`)
- `persona.tsx` illustration: entrance fade+scale (or a gentle floating loop, reduced-motion-gated) on mount — first screen after auth.
- `menstrual-profile-setup.tsx` — **biggest structural gap**: a 3-step wizard with zero progress indicator and instant step swaps. Recommend: (a) a simple 3-dot/segmented progress bar where the active segment fills via `withTiming` on step change, (b) wrap each step's content in `entering={SlideInRight}`/`exiting={SlideOutLeft}` keyed by step index so moving forward/back reads as a slide, not a snap. This one change would make onboarding feel like a guided flow instead of a bare form.
- `MultiStepButton`'s conditional "back" button: fade/scale in on step change instead of appearing instantly.

### Cross-cutting (small, but touched constantly)
- **`SharedNav`'s avatar + bell buttons**: currently no press feedback at all — prime candidate for the shared `AnimatedPressable`.
- **Tab bar icons** (`app/(tabs)/_layout.tsx`): `tabBarIcon` already receives a `focused` boolean from expo-router; wrap each icon in `Animated.View` with `scale` sprung on focus change. Small individually, but it's the single highest-frequency interaction in the whole app (every tab switch).

### Not much to animate yet
`logs.tsx` and `community.tsx` are still literal placeholder stubs (`<Text>Logs page</Text>` / `<Text>Community page</Text>`). Worth revisiting once real content lands: apply the same list-stagger pattern, plus a gentle floating/bobbing empty-state illustration for "nothing here yet" moments.

## Suggested reusable pieces (build only what gets picked)
- `components/animated/AnimatedPressable.tsx` — press-scale (+ optional haptic) wrapper; used 6+ times above, crosses the reuse threshold unlike smaller one-off duplications elsewhere in this codebase.
- Extend `CircularProgress.tsx` in place using the `ObaaMark.tsx` animated-`Circle` pattern — no new file needed.
