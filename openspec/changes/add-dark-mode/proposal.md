## Why

The app already ships dark-mode CSS tokens in `app/globals.css` (`.dark` variant + `oklch` palette), but there is no way for users to switch themes, no persistence, and several components still use hard-coded colors (e.g. `bg-white`, `bg-gray-100`, `text-gray-700`) that ignore the tokens. As a result, dark mode is effectively dead code today. Adding a real theme switcher unlocks the existing styling work, improves readability for users in low-light environments, and aligns the app with the shadcn/Tailwind v4 conventions already adopted.

## What Changes

- Add a user-controllable theme toggle (light / dark / system) accessible from the `Navbar`.
- Persist the user's theme choice across page loads (localStorage) and respect `prefers-color-scheme` when set to "system".
- Apply the active theme by toggling the `dark` class on the `<html>` element from a single client-side provider, with an inline pre-hydration script to prevent a flash of incorrect theme (FOIT/FOUC).
- Replace hard-coded color utilities in `Navbar` and `Main` with theme-aware tokens (`bg-background`, `bg-card`, `text-foreground`, `border-border`, etc.) so layout chrome responds to theme changes.
- Keep PDF prescription templates (`PrescriptionTemplates/*`) on a fixed light palette — generated PDFs must remain print-friendly regardless of the on-screen theme.

## Capabilities

### New Capabilities
- `theme-switching`: User-facing light/dark/system theme selection with persistence, OS-preference fallback, and FOUC-free hydration; exposes a provider, hook, and toggle UI consumable across the app.

### Modified Capabilities
<!-- None — no existing specs in openspec/specs/ to amend. -->

## Impact

- Code:
  - New: `app/components/ThemeProvider.js`, `app/components/ThemeToggle.js`, supporting hook (e.g. `app/hooks/useTheme.js`).
  - Modified: `app/layout.js` (mount provider, inject pre-hydration script), `app/components/Navbar.js` (host toggle, swap hard-coded colors for tokens), `app/components/Main.js` (swap `bg-gray-100` / `bg-red-500` debug styles for tokens).
  - Unchanged on purpose: `app/components/PrescriptionTemplates/**` and the `/api/generate-pdf` route (PDFs stay light-themed).
- Dependencies: no new runtime dependencies required; reuses Tailwind v4 `dark` variant, shadcn primitives, and `lucide-react` icons already in `package.json`.
- Storage: adds a single `localStorage` key (e.g. `rx-gen-theme`) on the browser.
- Security/privacy: no PII; theme value only.
