## 1. Theme State Foundation

- [x] 1.1 Create `app/components/ThemeProvider.js` exporting a `ThemeProvider` client component that owns `theme` (`light` | `dark` | `system`) and `resolvedTheme` (`light` | `dark`) via React context (`"use client"`, single export, follows the project's "one export per file" rule).
- [x] 1.2 Inside `ThemeProvider`, on mount: read `rx-gen-theme` from `localStorage`, validate it ∈ {`light`, `dark`, `system`}, fall back to `system` if missing/invalid, and seed state.
- [x] 1.3 Compute `resolvedTheme` from `theme`: when `theme === "system"`, derive from `window.matchMedia('(prefers-color-scheme: dark)')`; otherwise mirror `theme`.
- [x] 1.4 Subscribe to `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', …)` only while `theme === "system"`, and clean up the listener on unmount or when `theme` changes.
- [x] 1.5 In an effect, sync `resolvedTheme` to the DOM by adding/removing the `dark` class on `document.documentElement`.
- [x] 1.6 Implement `setTheme(next)` that updates state, writes the value to `localStorage`, and (for `light`/`dark`) immediately updates the `<html>` class without waiting for the effect.
- [x] 1.7 Wrap `localStorage` reads/writes in `try/catch` so private-mode and storage-quota errors do not crash the provider.

## 2. Hook + Public API

- [x] 2.1 Create `app/hooks/useTheme.js` exporting a single `useTheme` hook that returns `{ theme, resolvedTheme, setTheme }` from the provider's context.
- [x] 2.2 Make `useTheme` throw a clear error (e.g. `"useTheme must be used within ThemeProvider"`) when called outside the provider.
- [x] 2.3 Confirm the provider file exports nothing else (context object stays module-private) and that consumers only depend on `useTheme`.

## 3. FOUC-Prevention Inline Script

- [x] 3.1 Add a small synchronous IIFE (string literal) that reads `rx-gen-theme` from `localStorage`, falls back to `matchMedia('(prefers-color-scheme: dark)').matches`, and adds the `dark` class to `document.documentElement` when needed; wrap the whole body in `try {} catch (_) {}`.
- [x] 3.2 Inject the script into `<head>` from `app/layout.js` via `<script dangerouslySetInnerHTML={{ __html: ... }} />` so it runs before hydration on every route.
- [x] 3.3 Keep the script self-contained (no imports, no template variables); store the source as a module-level constant for readability.
- [ ] 3.4 Manually verify on a hard reload while in dark mode that no light-mode frame is painted (DevTools Performance recording or visual check).

## 4. Layout Wiring

- [x] 4.1 In `app/layout.js`, mount `<ThemeProvider>` around `{children}` (inside `<body>`), keeping the existing font className composition intact.
- [x] 4.2 Confirm the inline pre-hydration script is rendered inside `<head>` (use `next/script` with `strategy="beforeInteractive"` only if `<head>` injection is not viable; default is direct `<script>`).
- [x] 4.3 If React 19 emits hydration warnings on the `<html>` element due to the `dark` class diff, add `suppressHydrationWarning` to `<html>`.
- [x] 4.4 Optional polish: sync a `<meta name="color-scheme">` tag with `resolvedTheme` so native form controls and scrollbars match.

## 5. Theme Toggle UI

- [x] 5.1 Create `app/components/ThemeToggle.js` (client component, single default export, `"use client"`).
- [x] 5.2 Render a trigger `Button` (using the existing `@/components/ui/button`) with an icon that swaps with `resolvedTheme` (Sun in light, Moon in dark) from `lucide-react`; include `aria-label="Toggle theme"`.
- [x] 5.3 Open a dropdown menu with three items — Light / Dark / System — using shadcn's `DropdownMenu` primitive (or the existing `@base-ui/react` menu if a shadcn dropdown is not yet installed).
- [x] 5.4 Wire each item to call `setTheme("light" | "dark" | "system")` from `useTheme` and visually mark the active option (e.g. checkmark or filled icon).
- [ ] 5.5 Verify keyboard support: Tab focuses the trigger, Enter/Space opens, ArrowUp/ArrowDown navigates, Enter selects, Esc closes.

## 6. Replace Hard-Coded Colors

- [x] 6.1 In `app/components/Navbar.js`, replace `bg-white` with a token-driven class (`bg-card` or `bg-background`), `text-gray-700` with `text-muted-foreground`, `hover:text-blue-500` with `hover:text-foreground`, and the hover border with `hover:border-primary`. Remove any other hard-coded grays/whites.
- [x] 6.2 Mount `<ThemeToggle />` on the right side of the `Navbar` (e.g. after the nav link group), keeping the responsive layout intact.
- [x] 6.3 In `app/components/Main.js`, swap `bg-gray-100` for `bg-background` on the root wrapper.
- [x] 6.4 In `app/components/Main.js`, remove the debug `bg-red-500` utility from the form wrapper.
- [x] 6.5 Audit the rest of `app/components/**` (excluding `PrescriptionTemplates/**`) for residual hard-coded color utilities (`bg-white`, `bg-gray-*`, `text-gray-*`, `text-blue-*`, `bg-red-*`, etc.) and replace them with the appropriate semantic token.

## 7. Protect PDF Output

- [x] 7.1 Confirm `app/api/generate-pdf/route.js` does NOT import `ThemeProvider` and that the rendered HTML it ships to Puppeteer never includes the `dark` class on `<html>`.
- [x] 7.2 Add a short comment in the PDF route explicitly stating that PDFs must remain on the light palette and the theme provider must not be mounted there.
- [ ] 7.3 Generate a sample PDF in each UI theme (light, dark, system→dark) and confirm pixel parity with the pre-change baseline.

## 8. Verification

- [ ] 8.1 Manual check: toggle Light → Dark → System; while in System, change OS preference and confirm the UI follows live.
- [ ] 8.2 Manual check: hard-refresh in dark mode; confirm no light-mode flash on first paint.
- [ ] 8.3 Manual check: toggle persists across full reloads and across new tabs (same origin).
- [ ] 8.4 Manual check: open in a private/incognito window; confirm the app still renders (defaults to system) and no console errors are thrown by `localStorage` access.
- [x] 8.5 Run `npm run lint` and fix any new warnings introduced by the change.
- [ ] 8.6 Lighthouse / contrast spot-check on chrome elements (Navbar, Main wrapper, buttons) in both themes; address any WCAG AA failures by adjusting only the affected component classes (do not retune the global tokens in this change).
