## Context

`rx-gen-website` is a Next.js 16 (App Router) prescription generator built on React 19, Tailwind v4, shadcn primitives (`components/ui/button.jsx` + `@base-ui/react`), and the oklch token palette in `app/globals.css` (light + dark, plus the just-landed `ThemeProvider` / `useTheme` / `ThemeToggle`). Today every surface is rendered with the default shadcn flat-with-hairline-border treatment; the tokens are present but the visual language is generic.

Neumorphism (a.k.a. soft UI) renders interactive elements as if they were extruded from — or pressed into — the surrounding surface. Two paired shadows (a light highlight from one direction, a dark shadow from the opposite) sell the illusion. It is monochromatic by design, looks great in both light and dark themes when tuned correctly, and has well-known accessibility pitfalls (low contrast, ambiguous affordance) that we have to engineer around.

Constraints inherited from the project:
- "One export per file" (workspace coding rules) — utility helpers must live in their own modules, not be defined inline.
- `app/components/PrescriptionTemplates/**` and `/api/generate-pdf` must remain on a deterministic, print-friendly flat palette. Puppeteer rasterizes shadows poorly and any neumorphic look would harm legibility.
- Tailwind v4 with `@theme inline` token mapping; the `dark` variant is `@custom-variant dark (&:is(.dark *))`.
- No new runtime dependencies are desired; the styling system already exposes everything needed.

Stakeholders: clinicians using the app under varied lighting; engineering (must not break existing PDFs or theme switching).

## Goals / Non-Goals

**Goals:**
- Define a single source of truth (CSS custom properties) for the neumorphic shadow system that both light and dark themes consume.
- Ship a small, named utility surface (`.neu-raised`, `.neu-pressed`, `.neu-inset`, `.neu-subtle`, optional `.neu-flat`) so component code stays declarative and grep-able.
- Apply the system consistently to: `Button` variants, form inputs/selects, navbar surface, and main form card.
- Preserve full accessibility: focus rings, AA contrast on text inside neumorphic surfaces, and a flatter fallback under `prefers-contrast: more` and `prefers-reduced-motion` (the latter only affects the press-down `transform`).
- Preserve PDF output: zero changes to `PrescriptionTemplates/**` or the generate route.
- Preserve theme switching: tokens still owned by `:root` and `.dark`, no new globals or providers.

**Non-Goals:**
- Re-skinning the prescription PDF templates.
- Adding a third-party CSS framework or a CSS-in-JS layer (`styled-components`, etc.).
- A theme builder / per-component customization UI.
- Animating an entire "press" microinteraction beyond the active-state `transform` already used by `Button`.
- Changing the spec/behavior of `theme-switching` — only the **values** of `--background`/`--card` shift, not the contract.
- Re-skinning the `ThemeToggle` dropdown menu items themselves (they consume `bg-popover` and `bg-accent`; we leave them alone unless QA flags them).

## Decisions

### Decision 1: Token-first design system, not per-component magic numbers
- **Choice**: Define `--shadow-neu-light`, `--shadow-neu-dark`, `--shadow-neu-light-sm`, `--shadow-neu-dark-sm`, `--shadow-neu-inset-light`, `--shadow-neu-inset-dark`, and `--neu-radius` as CSS custom properties under `:root` and `.dark` in `app/globals.css`. Component CSS (and our utilities) compose them; **never** hardcode `rgba(...)` shadows in JSX.
- **Why**: Single point of control. Tweaking the depth/feel of every neumorphic surface = changing four lines of CSS. Aligns with how the rest of the project already drives color via tokens.
- **Alternatives considered**:
  - Tailwind `theme.extend.boxShadow` keys: also workable, but Tailwind v4's preferred path is `@theme inline` + custom properties, and our `globals.css` already lives in that idiom.
  - Per-component inline styles: violates the "one source of truth" goal and grows N copies of the same tuned values.

### Decision 2: Shorthand `.neu-*` utilities under `@layer utilities`
- **Choice**: Author `.neu-raised`, `.neu-pressed`, `.neu-inset`, `.neu-subtle` (and optional `.neu-flat` for explicit overrides) in an `@layer utilities { ... }` block in `app/globals.css`, each composing two `box-shadow`s plus a `border-radius` from `--neu-radius`.
- **Why**: Consumers write `className="neu-raised"` rather than a 4-shadow tuple. Survives Tailwind purge because it's an explicit class. Keeps shadcn variants readable.
- **Alternatives**:
  - Plain Tailwind arbitrary-value shadow utilities composed at every site: very noisy and easy to drift.
  - A React `<NeuSurface />` wrapper: solves nothing CSS doesn't, costs a component layer, and conflicts with existing shadcn primitives.

### Decision 3: Background retune — light is off-white, dark surfaces lift above background
- **Choice**:
  - Light: `--background` shifts from `oklch(1 0 0)` to roughly `oklch(0.965 0.005 60)` (warm off-white). `--card` stays bright. `--muted`/`--secondary` get a *very* slight tone adjustment so an inset input sits visibly below the card.
  - Dark: `--background` stays dark (`oklch(0.147 0.004 49.3)`), `--card` (`oklch(0.214 …)`) is the raised surface. We may bump `--card` ~0.01–0.02 lightness to read against the page.
- **Why**: Pure white can't show a light highlight shadow (already at the brightness ceiling). Off-white gives the highlight room to breathe. Dark mode already has the layered ramp; we only sanity-check it.
- **Trade-off**: This is a visual-only breaking change to `--background`. Pre-change screenshots will diff.
- **Alternatives**: Add a separate `--neu-surface` token and use it only for neumorphic chrome. Rejected — leaks the visual style into the token name and creates two parallel "background" semantics.

### Decision 4: Borders are the neumorphism's accessibility insurance, not its aesthetic
- **Choice**: Default neumorphic surfaces drop `border` in favor of shadows. Under `@media (prefers-contrast: more)`, the `.neu-*` utilities re-enable `border: 1px solid var(--border)` and weaken the shadows. The focus state always uses `outline` / `ring` from the existing `--ring` token regardless.
- **Why**: Neumorphism's biggest documented failure is invisible affordances for low-vision users. We satisfy "soft UI when possible, accessible UI when needed" by layering the contrast media query on top of the shadow utilities.
- **Alternatives**:
  - Always-on borders (defeats the look).
  - Borders only on form inputs (form inputs are the most accessibility-sensitive surface; partial coverage is worse than the conditional approach).

### Decision 5: Button = raised → pressed → inset (state-driven, in the variant CSS itself)
- **Choice**: Update `buttonVariants` in `components/ui/button.jsx` so each visual variant gets:
  - rest: `.neu-raised` (or its inline equivalent: `box-shadow: var(--shadow-neu-light), var(--shadow-neu-dark)`).
  - `:active`: `.neu-pressed` (smaller paired shadows, plus the existing `active:translate-y-px`).
  - `aria-expanded` / `data-[state=open]`: `.neu-inset` so dropdown triggers (e.g. the theme toggle when its menu is open) read as "engaged."
  - `:disabled`: keep the current opacity-based treatment; drop neumorphic shadows so disabled buttons don't trick the eye into thinking they're pressable.
- **Why**: Centralizes the look in one CVA so every callsite inherits it. Preserves the existing focus-ring chain (`focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30`) untouched.
- **Variants exception**: `link` and `destructive` keep their current treatment — a link with neumorphic shadows is nonsensical, and a destructive shadow weakens the urgency cue.

### Decision 6: Form inputs = pressed-inset surface (the "pushed in" look)
- **Choice**: `FormInput` and the `<select>` in `FormSelect` swap `border border-border` for `.neu-inset` and gain a focus-only outline driven by `--ring`. Padding, `rounded-md`, and label markup are unchanged.
- **Why**: Inputs visually represent "user puts data in," and a pressed-in surface is the canonical neumorphic affordance for that. It also visually differentiates inputs from buttons (raised = clickable, inset = fillable).
- **Trade-off**: Native `<select>` styling on Chrome/Safari is partially OS-driven; the inset works but the dropdown caret remains the browser's. Acceptable for now.

### Decision 7: Navbar and Main form wrapper = subtle raised card
- **Choice**:
  - `Navbar` swaps its `border-b border-border shadow-sm` for `.neu-subtle` (a softer, single-direction raised treatment) on the same `bg-card` it already uses.
  - `Main`'s form section gets wrapped in a `<div class="neu-raised bg-card rounded-2xl p-6">` (or equivalent) so the form sits on a card instead of bleeding into the page background.
- **Why**: The chrome stops looking like a div soup and starts looking like deliberate surfaces. Doesn't change layout.
- **Alternatives**: Make the entire page neumorphic (every `<div>` raised). Rejected — neumorphism only works when most of the screen is the *base* and only a few elements lift off it.

### Decision 8: PDFs are explicitly out
- **Choice**: `app/components/PrescriptionTemplates/**` and `/api/generate-pdf/route.js` are not modified. They continue to render with their own scoped Tailwind classes against the light palette.
- **Why**: Puppeteer's rasterizer + printer paper + unknown viewer ink budgets all hate soft shadows. PDFs must remain deterministic and high-contrast.
- **Implementation note**: The generate route already does not import `ThemeProvider` (verified during the dark-mode change). We add a comment in the route reaffirming "no neumorphism in PDFs."

### Decision 9: Reduced-motion fallback
- **Choice**: Inside `@media (prefers-reduced-motion: reduce)`, skip the `:active { transform: translateY(1px) }` press microinteraction. Shadow change still happens (it's communicative, not motion).
- **Why**: The shadow swap is the affordance; the 1px translate is decoration. Honoring the OS preference costs us a 3-line media query.

## Risks / Trade-offs

- **Accessibility regressions on form inputs.** Inset inputs against a near-card background can reduce the visual edge between input and surrounding chrome.
  → Mitigation: the `prefers-contrast: more` fallback restores `border-border`. We also keep the focus ring fully visible (it uses `outline`, not box-shadow, so it stacks on top of neumorphic shadows).
- **Pure white was used as a contrast baseline.** Shifting `--background` away from `#fff` will subtly change perceived contrast everywhere (including `text-foreground` on `bg-background`).
  → Mitigation: use a very small shift (~0.035 in oklch lightness). Verify AA contrast for `--foreground` against the new `--background` with a contrast checker before merge. Roll back the shift if any AA failure surfaces.
- **PDF coupling**. A future contributor might wrap the entire app in a neumorphic body class and accidentally bleed it into the PDF.
  → Mitigation: scope all new utilities to explicit `.neu-*` classes (no global element selectors), and keep the comment in `/api/generate-pdf/route.js`.
- **Browser shadow rendering quality**. Multiple layered shadows can look banded on low-DPI displays.
  → Mitigation: keep blur radii moderate (≤ 24px) and avoid stacking more than two shadows per surface. Spot check on a non-retina display before merging.
- **Visual diff churn in QA.** Almost every component changes appearance.
  → Mitigation: bundle the entire change in one PR (do not ship piecemeal); QA once on every screen.
- **Native `<select>`'s OS-controlled chrome.** The dropdown panel is browser-painted and can't be fully neumorphized.
  → Mitigation: out of scope. Document that the closed select is neumorphic; the open list is browser default.
- **Theme-toggle dropdown popup vs. neumorphic nav.** The `Menu.Popup` already uses `bg-popover` and `shadow-md`; under our retuned tokens this should still read.
  → Mitigation: visual check during QA; only adjust if it visibly clashes.

## Migration Plan

1. **Tokens first.** Land the new `--shadow-neu-*` and `--neu-radius` properties in `globals.css` for both `:root` and `.dark`. Retune `--background` (and any sister tokens) in the same commit so the tokens & utilities ship together.
2. **Utilities next.** Add the `@layer utilities { .neu-raised, .neu-pressed, .neu-inset, .neu-subtle }` block. Verify in dev that the classes purge correctly and apply expected shadows in both themes.
3. **Buttons.** Update `buttonVariants` in `components/ui/button.jsx`. Re-screenshot ThemeToggle, FormMedicine Add/Remove buttons, and the Generate button.
4. **Form controls.** Update `FormInput` and `FormSelect`. Confirm `FormMedicine` inherits via composition (it already uses `FormSelect` + the shadcn `Button`).
5. **Chrome.** Update `Navbar` and `Main`. Confirm layout remains unchanged (only shadows / background do).
6. **Accessibility passes.** Run a manual `prefers-contrast: more` check (DevTools "Emulate CSS media feature") and confirm borders re-appear and shadows soften. Run a `prefers-reduced-motion: reduce` check and confirm the press translate is suppressed.
7. **PDF parity.** Generate a PDF in light, dark, and system→dark themes; diff against pre-change baseline screenshots. Must be pixel-equal.
8. **Rollback.** Revert the PR. No data, no storage, no API changes — visual rollback only.

## Open Questions

- Do we want a `.neu-flat` utility for callers that want to opt **out** of neumorphism on a specific surface (e.g. a future modal)? Default: yes, ship it as a `box-shadow: none` reset for parity with the rest of the system.
- Should the press-down `:active` `transform` move from `translateY(1px)` to `translateY(2px)` to better sell the depth, or is the current 1px enough? Default: keep 1px to minimize layout flicker; revisit if QA finds it too subtle.
- Do we want to expose a `--neu-radius` per size (sm/md/lg) or stick with one global radius and let Tailwind's `rounded-*` utilities co-vary? Default: one global `--neu-radius` to match how the existing `--radius` token works; component CSS can override locally if needed.
- Should `Button` variant `outline` keep a 1px border *and* gain neumorphic shadows, or drop the border entirely? Default: drop the border at rest, restore it under `prefers-contrast: more`.
