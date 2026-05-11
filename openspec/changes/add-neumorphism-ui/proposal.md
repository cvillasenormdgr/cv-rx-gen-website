## Why

The current UI is a flat shadcn-derived skin: hairline borders, hard shadows, and pure-white surfaces that look generic and read as "stock template." Neumorphism (soft, extruded surfaces with paired light/dark shadows) gives the prescription generator a more tactile, branded feel — especially in dark mode, where the existing oklch dark palette already provides the muted base color this style needs. The theme tokens shipped in the dark-mode change make this the right time to layer a coherent shadow system on top of them, before more components accrete the current flat treatment.

## What Changes

- Introduce a small neumorphic design system anchored on shared CSS custom properties (e.g. `--shadow-neu-light`, `--shadow-neu-dark`, `--shadow-neu-inset`, `--neu-radius`) defined once in `app/globals.css` for both `:root` (light) and `.dark` palettes, so every neumorphic surface in either theme is driven from the same source of truth.
- Add reusable Tailwind v4 utility shorthands via `@layer utilities` (`.neu-raised`, `.neu-pressed`, `.neu-inset`, `.neu-subtle`) so consumers don't hand-write four-shadow rules at every call site.
- Apply neumorphism to the **interactive chrome** of the app, not the page chrome:
  - `Button` (shadcn `@/components/ui/button`): the `default`, `outline`, `secondary`, `ghost` variants get raised shadows at rest, deeper press shadows on `:active`, and a subtle inset on `aria-expanded` / `data-[state=open]`. `destructive` and `link` keep their semantics.
  - Form controls in `app/components/Form/**` (`FormInput`, `FormSelect`) get an inset (pressed-into-the-surface) treatment instead of the current `border border-border` outline.
  - Card-like surfaces in `Navbar` and `Main` get raised neumorphic surfaces (`bg-card` already, plus the `.neu-raised` shadow utility) instead of the flat `border-b`/`shadow-sm` look.
- Tune `--background`, `--card`, and `--muted` slightly so the neumorphic shadows actually read. In light mode the page background must be off-white (not pure `oklch(1 0 0)`), and in dark mode the card needs to sit *above* the page background. **BREAKING (visual only):** the light-mode `--background` token shifts from pure white to a warm-gray off-white; downstream consumers that assumed `#fff` may need re-screenshotting.
- Keep PDF prescription templates (`app/components/PrescriptionTemplates/**`) and the `/api/generate-pdf` route on the **flat** light palette. Neumorphism does not survive print/Puppeteer rasterization and would degrade legibility — the PDFs must stay deterministic and ink-efficient.
- Document the accessibility floor in `design.md` and enforce it in implementation: focus rings stay visible (use the existing `--ring` token, not just shadow), interactive contrast meets WCAG AA, and `prefers-reduced-motion` / `prefers-contrast: more` users get a flatter fallback.

## Capabilities

### New Capabilities
- `neumorphic-ui`: Token-driven neumorphic design system covering the shared CSS variables, utility classes, and per-component application rules (buttons, form inputs, cards/chrome) with explicit dark-mode parity, accessibility fallbacks, and a documented exclusion list (PDF templates).

### Modified Capabilities
<!-- None — `theme-switching` is unchanged. The light/dark tokens this change tweaks are owned by the layout/theme layer but no theme-switching requirement is being modified. -->

## Impact

- Code:
  - **Modified globally**: `app/globals.css` (new shadow tokens, retuned `--background`/`--card` for both themes, `@layer utilities` block for `.neu-*` classes).
  - **Modified components**: `components/ui/button.jsx` (variant shadow classes), `app/components/Form/FormInput/index.js`, `app/components/Form/FormSelect/index.js`, `app/components/Form/FormMedicine/index.js` (Add/Remove buttons inherit via `Button`), `app/components/Navbar.js` (raised surface), `app/components/Main.js` (form card surface, generate-button placement).
  - **Untouched on purpose**: `app/components/PrescriptionTemplates/**` (Regular, BestLife, YakapGamot) and `app/api/generate-pdf/route.js` — PDFs stay flat.
  - **Possibly modified**: `app/components/ThemeToggle.js` only insofar as it consumes the updated `Button` (no per-component overrides).
- Dependencies: no new runtime dependencies. The design uses Tailwind v4 `@layer utilities` and stock CSS custom properties.
- Storage / network: none.
- Risk surface:
  - Visual regression on every screen — covered by manual QA in tasks.
  - Accessibility (low contrast is the canonical neumorphism failure mode) — addressed by keeping focus rings token-driven, retaining the `border-border` fallback on a `prefers-contrast: more` query, and verifying AA on text inside neumorphic surfaces.
  - PDFs — explicit non-goal; verified by re-generating a sample PDF and diffing.
