# TTYM Mobile App — Documentation

"TTYM" = **Talk To Your Midwife**. The app's product-facing brand name is **Obaa** ("woman" in Twi), by Ergon Pulse. It is a menstrual-cycle-tracking companion app aimed at expanding into broader women's health features (chat with a midwife, community support, educational articles).

This folder documents the current state of the codebase as of branch `feature/calendar-page` (2026-07-21). It was generated from a full codebase exploration and should be refreshed periodically as the app evolves — treat it as a snapshot, not a live source of truth (prefer reading the actual code/git history when in doubt).

## Contents

- [architecture.md](./architecture.md) — folder structure, layering pattern (View → ViewModel → Service/Store), state management, routing/auth-guard setup, styling, TypeScript config.
- [features.md](./features.md) — screen-by-screen breakdown of what's implemented, what's a placeholder, and the cycle-tracking calendar logic in detail.
- [known-issues.md](./known-issues.md) — placeholder/stubbed features, small bugs, and cleanup items worth knowing about before touching related code.
