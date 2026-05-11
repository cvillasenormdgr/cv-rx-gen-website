## Context

`rx-gen-website` is a Next.js 16 (App Router) application using React 19, Tailwind v4, and shadcn UI primitives. `app/globals.css` already defines two complete token palettes (light under `:root`, dark under `.dark`) plus the Tailwind v4 `@custom-variant dark (&:is(.dark *))` declaration. What's missing is:

1. A runtime mechanism to add/remove the `.dark` class on `<html>`.
2. Persistence of the user's choice across reloads.
3. A toggle UI for the user to control the theme.
4. Cleanup of hard-coded colors in `Navbar` and `Main` (e.g. `bg-white`, `bg-gray-100`, `bg-red-500`, `text-gray-700`) so the chrome actually consumes the tokens.

The app also generates PDFs server-side through Puppeteer (`app/api/generate-pdf/route.js` rendering the components in `app/components/PrescriptionTemplates/`). Those must remain on the light palette regardless of UI state, because PDFs are printed/shared.

Stakeholders: end-users (clinicians) reading on varied devices and lighting; engineering (maintainability of styling). No backend changes; this is a client-side concern.

## Goals / Non-Goals

**Goals:**
- One canonical source of truth for theme state, owned by a `ThemeProvider` mounted at the app root.
- Three user-facing modes: `light`, `dark`, `system` (with `system` reacting live to OS changes).
- Zero theme flash on reload, including for users who selected `dark` previously.
- Replace hard-coded colors in `Navbar` and `Main` with semantic tokens already defined in `globals.css`.
- Keep PDF output visually identical to today.

**Non-Goals:**
- Adding a third-party theming library (`next-themes`, etc.). The implementation is small and dependency-free.
- Theming the prescription PDF templates.
- Restyling shadcn primitives (they already consume the tokens).
- Per-component theme overrides or theme-customization UI.
- Server-side rendering of theme based on cookie negotiation. We accept client-side resolution + an inline pre-hydration script.

## Decisions

### Decision 1: Roll our own provider instead of `next-themes`
- **Choice**: Implement `ThemeProvider` + `useTheme` + `ThemeToggle` in-repo.
- **Why**: Surface area is tiny (one context, one effect, one inline script). Avoids adding a runtime dependency, and `next-themes` historically lags behind major Next.js releases — a non-trivial concern given the project rule that this is "NOT the Next.js you know." Direct ownership keeps the integration explicit and debuggable.
- **Alternatives considered**:
  - `next-themes`: quick to drop in but adds a dep; SSR strategy may need extra work in Next 16.
  - CSS-only via `prefers-color-scheme`: no user override, fails the spec's requirement that users can force a theme.

### Decision 2: Apply `.dark` on `<html>` (not `<body>`)
- **Choice**: Toggle the class on `document.documentElement`.
- **Why**: Matches the Tailwind v4 `@custom-variant dark (&:is(.dark *))` selector chain (parent of all rendered nodes), avoids edge cases where `<body>` is replaced/recreated, and works for any portals/popovers that mount outside `<body>`'s subtree.

### Decision 3: Pre-hydration inline script in `<head>` for FOUC prevention
- **Choice**: Inject a small synchronous IIFE via `dangerouslySetInnerHTML` in `app/layout.js` that reads `localStorage` + `matchMedia('(prefers-color-scheme: dark)')` and applies the `dark` class before paint.
- **Why**: Server-rendered HTML can't know the per-user theme. The only way to avoid a wrong-theme flash is to mutate `<html>` before the first paint. An inline script is the standard, dependency-free pattern.
- **Trade-off**: Adds an inline script. We accept this and keep it tiny + self-contained. A future CSP tightening can use a hash for `unsafe-inline` exemption.

### Decision 4: Three modes (`light`, `dark`, `system`) with `resolvedTheme`
- **Choice**: Persist the user's *intent* (`light` / `dark` / `system`) and compute `resolvedTheme` (`light` / `dark`) for actual rendering. Subscribe to `matchMedia` change events while in `system` mode.
- **Why**: `system` is the most respectful default (matches OS auto-switching). Users who explicitly pick light or dark stay locked to that choice across devices/contexts.

### Decision 5: Single `localStorage` key `rx-gen-theme`
- **Choice**: One namespaced key, value ∈ {`light`, `dark`, `system`}; on read, validate and fall back to `system`.
- **Why**: Simple, debuggable, matches shadcn convention, avoids cookie/SSR complexity. Validation prevents corrupt values from breaking the resolver.

### Decision 6: Toggle UI = three-option dropdown in `Navbar`
- **Choice**: A dropdown menu (sun / moon / monitor icons via `lucide-react`) anchored from a `Button` in the right side of `Navbar`. Uses shadcn's `DropdownMenu` primitive (or equivalent base-ui menu) for accessibility.
- **Why**: A single sun↔moon toggle hides the `system` mode. A three-state dropdown is the shadcn idiom and keyboard accessible. `lucide-react` is already in `package.json`.
- **Alternatives**: Tri-state segmented control (more visual real-estate); single icon button cycling through 3 states (poor discoverability).

### Decision 7: PDFs stay light
- **Choice**: The Puppeteer-rendered route (`/api/generate-pdf`) does not use the provider. Templates render server-side without `.dark` on `<html>`, so token consumers naturally use the light palette.
- **Why**: PDFs are documents to be printed/shared; they must be deterministic. Coupling them to the user's UI theme would harm both predictability and ink usage.
- **Implementation note**: Verify the route does not import `ThemeProvider`. Templates may use the same tokens but the dark variant simply won't apply.

### Decision 8: Replace hard-coded utilities with semantic tokens
- **Choice**: In `Navbar.js`, swap `bg-white` → `bg-card` (or `bg-background`), `text-gray-700` → `text-muted-foreground`, hover `text-blue-500` → `text-primary` (or `hover:text-foreground`). In `Main.js`, replace `bg-gray-100` → `bg-background`, drop `bg-red-500` (debug).
- **Why**: The whole point of the change. Using tokens keeps the styling in lockstep with both palettes and any future palette tweaks.
- **Mapping (proposed):**
  | Current | Replacement |
  | --- | --- |
  | `bg-white` (Navbar) | `bg-card` |
  | `bg-gray-100` (Main wrapper) | `bg-background` |
  | `text-gray-700` (Navbar links) | `text-muted-foreground` |
  | `hover:text-blue-500` (Navbar links) | `hover:text-foreground` |
  | `border-blue-500` (active border) | `border-primary` |
  | `bg-red-500` (debug wrapper in Main) | remove |

## Risks / Trade-offs

- **Inline script and CSP**: Adds an inline `<script>` to `<head>`.
  → Mitigation: keep the script minimal and self-contained; document a future move to a hashed CSP entry.
- **`localStorage` unavailable** (private browsing, embedded contexts): script could throw.
  → Mitigation: wrap the IIFE in `try/catch`; fall back to `system`. Provider also defends against thrown reads at runtime.
- **Hydration mismatch warnings**: if the server renders without `.dark` and the script adds it before hydration, React 19 may warn for any class diffs on `<html>`.
  → Mitigation: only the `<html>` class changes, and Next/React 19 tolerates `<html>`/`<body>` className diffs from inline scripts. If warnings still surface, add `suppressHydrationWarning` to the `<html>` element.
- **Live OS preference change while in `system`**: requires subscribing to `matchMedia.addEventListener('change', …)` and unsubscribing on unmount.
  → Mitigation: implement in a `useEffect` and verify subscription cleanup; gate behind `theme === 'system'` to avoid unnecessary listeners.
- **PDF regression**: future contributors might add the provider to the PDF route or apply `.dark` to template HTML by accident.
  → Mitigation: add a smoke check (manual or an automated visual diff) and a comment in the PDF route explicitly stating it must not consume the theme provider.
- **Hard-coded color regressions**: nothing today prevents new components from hard-coding `bg-white` again.
  → Mitigation: out-of-scope here; consider an ESLint rule in a follow-up change.

## Migration Plan

1. Land the provider, hook, toggle, and inline pre-hydration script behind no feature flag (low risk, additive).
2. Swap hard-coded utilities in `Navbar.js` and `Main.js` in the same PR so QA only happens once.
3. Manual verification:
   - Toggle through all three modes; confirm OS preference changes propagate while in `system`.
   - Hard-reload while in dark mode; confirm no light flash.
   - Generate a PDF in each mode; confirm visual parity.
   - Lighthouse pass on light & dark; confirm no contrast regressions on chrome.
4. Rollback: revert the PR. No data migration needed; the lone `localStorage` key can be left in place — it has no effect without the provider.

## Open Questions

- Should the toggle live inside `Navbar` only, or also be reachable from a future settings page? (Default: Navbar only for now.)
- Do we want a `colorScheme` `<meta>` tag synchronized with `resolvedTheme` so native form controls/scrollbars match? (Recommended; cheap; include if time permits.)
- Should we add `suppressHydrationWarning` preemptively on `<html>`, or only if React 19 logs warnings during testing? (Default: only if it logs.)
