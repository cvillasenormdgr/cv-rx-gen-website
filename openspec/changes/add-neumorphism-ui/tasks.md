## 1. Token Foundation in `globals.css`

- [x] 1.1 In `app/globals.css`, add the neumorphic shadow tokens to the `:root` block: `--shadow-neu-light`, `--shadow-neu-dark`, `--shadow-neu-light-sm`, `--shadow-neu-dark-sm`, `--shadow-neu-inset-light`, `--shadow-neu-inset-dark`, and `--neu-radius` (set `--neu-radius` to `calc(var(--radius) * 1.4)` or a comparable larger value).
- [x] 1.2 Mirror the same set of tokens in the `.dark` block, using darker base colors and a brighter highlight tuned for the dark palette so the raised effect is visible against `oklch(0.147 ...)` backgrounds.
- [x] 1.3 Retune `:root { --background }` from `oklch(1 0 0)` to a warm off-white (around `oklch(0.965 0.005 60)`) so the light-direction highlight has somewhere to render. Keep `--card` at or near pure white so cards still lift above the page.
- [x] 1.4 Spot-check sister tokens (`--secondary`, `--muted`, `--accent`) in light mode for visual continuity after the `--background` shift; nudge them only if the inset input becomes invisible on the card. *(Static analysis: kept at `oklch(0.96)` — inputs differentiate via inset shadow on `bg-card`/`bg-background`, not surface color.)*
- [ ] 1.5 Verify (DevTools color picker or a contrast checker) that `text-foreground` on the new `bg-background` still meets WCAG AA in both themes; revert the shift if not.

## 2. Neumorphic Utility Classes

- [x] 2.1 In `app/globals.css`, add an `@layer utilities { ... }` block that declares `.neu-raised` composing the paired `--shadow-neu-light` + `--shadow-neu-dark` shadows and applying `border-radius: var(--neu-radius)`. *(Implemented via Tailwind v4 `@utility neu-raised` directive so variants like `active:`/`aria-expanded:` work; functionally equivalent.)*
- [x] 2.2 Declare `.neu-pressed` in the same block using `--shadow-neu-light-sm` + `--shadow-neu-dark-sm`.
- [x] 2.3 Declare `.neu-inset` using `--shadow-neu-inset-light` + `--shadow-neu-inset-dark`, with `border-radius: var(--neu-radius)`.
- [x] 2.4 Declare `.neu-subtle` (a quieter raised shadow for large chrome surfaces) — recommended approach is to reduce the spread/blur of the raised tokens or use `box-shadow: var(--shadow-neu-light) / 0.5` style attenuation. *(Reuses `--shadow-neu-light-sm` + `--shadow-neu-dark-sm` for a softer permanent lift.)*
- [x] 2.5 Declare `.neu-flat` as an explicit `box-shadow: none` reset with no radius opinion (callers may still apply `rounded-*`).
- [x] 2.6 Inside the same `@layer utilities` block, add a `@media (prefers-contrast: more) { ... }` rule that re-enables `border: 1px solid var(--border)` on `.neu-raised`, `.neu-pressed`, `.neu-inset`, and `.neu-subtle`, and visibly attenuates the shadows. *(Nested inside each `@utility` body so variant-applied utilities also get the override.)*
- [ ] 2.7 Manually verify in dev (`npm run dev`) that adding `className="neu-raised"` to a sample `<div class="bg-card">` actually renders a paired-shadow surface in both themes.

## 3. Update `Button` Variants

- [x] 3.1 In `components/ui/button.jsx`, modify the `default` variant string to include the neumorphic raised treatment at rest (via the shared neumorphic utility), the pressed treatment via the active-state utility, and the inset treatment via `aria-expanded` / `data-[state=open]` equivalents. Keep `bg-primary text-primary-foreground hover:bg-primary/80`. *(Composed via shared `neuStateClasses = "neu-raised active:neu-pressed aria-expanded:neu-inset data-[state=open]:neu-inset disabled:shadow-none"`.)*
- [x] 3.2 Apply the same shadow trio to the `outline`, `secondary`, and `ghost` variants. For `outline`, drop the rest-state `border-border` and re-add it inside the `prefers-contrast: more` rule (handled by the utility).
- [x] 3.3 Add a `disabled:shadow-none` (or equivalent) so disabled buttons drop the raised affordance while keeping the existing `disabled:opacity-50`.
- [x] 3.4 Add `motion-reduce:active:translate-y-0` (or equivalent guard) so the existing `active:not-aria-[haspopup]:translate-y-px` is suppressed under `prefers-reduced-motion: reduce`. *(Implemented as `motion-safe:` prefix on the existing rule, which yields the same compiled behavior — the translate only renders when motion is allowed.)*
- [x] 3.5 Confirm `link` and `destructive` variants are NOT modified (per spec) and that the focus-visible ring chain (`focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30`) is unchanged. *(`link` untouched; `destructive` only gained `rounded-md` to compensate for the removed base `rounded-none` — palette and focus-ring chain unchanged. Base focus-visible classes preserved verbatim.)*
- [ ] 3.6 Manually verify each variant: rest, hover, `:active`, focus-visible, `aria-expanded` (open the `ThemeToggle` dropdown), and `disabled` (set the `Generate` button while loading).

## 4. Update Form Controls

- [x] 4.1 In `app/components/Form/FormInput/index.js`, replace `border border-border` on the `<input>` with `neu-inset` plus a focus ring (`focus:outline-2 focus:outline-ring` or `focus-visible:ring-2 focus-visible:ring-ring/40`); keep `rounded-md px-4 py-2` and the existing `errors[label]` handling. *(Added `bg-background` so the inset surface has a base color, plus `outline-none focus-visible:ring-2 focus-visible:ring-ring/40`.)*
- [x] 4.2 In `app/components/Form/FormSelect/index.js`, apply the same `neu-inset` + focus-ring treatment to the `<select>`; keep the placeholder option and `disabledValues` logic untouched.
- [x] 4.3 Confirm `app/components/Form/FormMedicine/index.js` does NOT need direct edits — it composes `FormSelect` for the input and the shadcn `Button` for Add/Remove, both of which inherit from steps 3 and 4. *(Verified: only renders `FormSelect` + `Button`.)*
- [x] 4.4 Confirm `app/components/Form/utils/createFormField.js` requires no edits (it dispatches to the existing components by type). *(Verified: switch on `field.Type` returning `FormInput` / `FormMedicine` only.)*
- [ ] 4.5 Manually verify: tab through every form field; the focus ring is visible on each, the inset shadow renders, and validation errors still display in `text-destructive`.

## 5. Update Layout Chrome

- [x] 5.1 In `app/components/Navbar.js`, replace `border-b border-border shadow-sm` on the root `<nav>` with `neu-subtle` (keep `bg-card`). The inner flex layout must not change.
- [x] 5.2 In `app/components/Main.js`, wrap the existing `<form>` in a `<div className="bg-card neu-raised rounded-2xl p-6">` (or equivalent) so the form sits on a raised card. Preserve the `mx-50` outer container and `flex flex-col gap-4` form structure.
- [x] 5.3 Confirm the PDF preview (`<iframe>` block) still renders inside the page background (not inside the form card) — wrap only the form, not the preview. *(Verified: only the `<form>` is inside the card; the PDF preview `<div className="flex justify-center">` block remains a sibling outside the card.)*
- [x] 5.4 Verify the `Generate` button inside the card inherits its neumorphism from the updated `Button` variant (no per-instance overrides needed). *(Removed the per-instance `className="border border-border rounded-full"` from the submit button so it inherits the default neumorphic look.)*

## 6. PDF Exclusion Guard

- [x] 6.1 Add a comment near the top of `app/api/generate-pdf/route.js` stating: "This route renders prescription PDFs and MUST remain on the flat light palette. Do not import the ThemeProvider here, do not apply `.neu-*` utility classes to prescription markup." *(Extended the existing dark-mode-era warning comment to cover `.neu-*` utilities and neumorphic shadow tokens.)*
- [x] 6.2 Audit `app/components/PrescriptionTemplates/RegularTemplate.js`, `BestLifeTemplate.js`, `YakapGamotTemplate.js`, and `index.js` to confirm none of them carry `.neu-*` classes, neumorphic shadow utilities, or `dark:`-conditional shadow tokens. *(Grep for `neu-|--shadow-neu|--neu-radius|box-shadow` returned no matches across the PrescriptionTemplates directory. Templates are plain HTML template strings styled exclusively by the inline `<style>` block in `route.js`.)*
- [ ] 6.3 Run the dev server, generate a PDF in light mode, switch to dark mode, generate the same PDF, and visually diff the two outputs — they must be byte-for-byte (or at least pixel-for-pixel) identical aside from any timestamp metadata.

## 7. Accessibility & Cross-Theme Verification

- [ ] 7.1 In Chrome DevTools, emulate `prefers-contrast: more` and confirm: buttons re-render with a visible `border`, form inputs re-render with a visible `border`, and shadows are visibly attenuated. Repeat in both light and dark themes.
- [ ] 7.2 In Chrome DevTools, emulate `prefers-reduced-motion: reduce` and confirm clicking a `Button` does not trigger the `translateY` press animation (shadow change still happens).
- [ ] 7.3 Run a contrast check (DevTools "Check contrast" or any AA checker) on:
  - `text-foreground` on `bg-background` (light + dark).
  - `text-foreground` on `bg-card` (light + dark).
  - `text-muted-foreground` on `bg-card` (light + dark).
  All three combinations must meet AA.
- [ ] 7.4 Manually keyboard-navigate the app: Tab through Navbar → ThemeToggle → form fields → medicine Add/Remove → Generate; every focused element must show a visible focus ring distinguishable from the neumorphic shadows.
- [ ] 7.5 Toggle `Light → Dark → System` via the `ThemeToggle`; confirm the `Navbar` shadow, the form-card shadow, all button shadows, and all input shadows update live without a page reload.

## 8. Cleanup & Polish

- [x] 8.1 Search the modified files for any leftover hardcoded shadow values (`shadow-sm`, `shadow-md`, `shadow-lg`, literal `box-shadow:` strings) that conflict with the neumorphic system; remove or replace them with `.neu-*` utilities as appropriate. Do NOT touch `PrescriptionTemplates/**`. *(Grep across `app/` and `components/` found only: (a) intentional `box-shadow: var(--shadow-neu-*)` inside `@utility` blocks in `globals.css`, (b) intentional `disabled:shadow-none` in `button.jsx`, (c) `shadow-md` on the `Menu.Popup` in `ThemeToggle.js` — left alone per `design.md` Decision 7's QA-deferred guidance.)*
- [x] 8.2 Run `npm run lint` and resolve any new warnings introduced by this change. *(`eslint` exits with 0 errors. The only warning is a pre-existing `@next/next/no-img-element` on the logo `<img>` in `Navbar.js` — untouched by this change and out of scope.)*
- [x] 8.3 Run `npm run build` once locally and confirm a clean build (no Tailwind purge warnings about unused `.neu-*` classes; no React 19 warnings about hydration). *(CSS now reports `✓ Compiled successfully` with zero warnings after rewriting artifact prose that contained a literal arbitrary-value Tailwind shadow candidate. The remaining build failure (`ENOTFOUND asia-east2-medgrocer-develop.cloudfunctions.net`) is pre-existing — the static page fetches external Airtable data via a Firebase Cloud Function that's unreachable in this sandboxed environment, unrelated to neumorphism.)*
- [x] 8.4 Self-review the diff: every modified component should be sourcing its neumorphic look from a `.neu-*` utility or the updated `Button` variants — no inline `box-shadow: var(...)` literals scattered through JSX (those belong centralized in `globals.css`). *(Verified: `Navbar` uses `neu-subtle`, `Main` uses `neu-raised`, `FormInput`/`FormSelect` use `neu-inset`, `Button` variants use `neu-raised`/`neu-pressed`/`neu-inset` via the `neuStateClasses` constant. All shadow declarations live in `globals.css`. No JSX file contains an inline `box-shadow:` declaration or an arbitrary-value Tailwind shadow utility referencing the neumorphic tokens.)*
- [ ] 8.5 Capture before/after screenshots of `Navbar`, the form card, the `ThemeToggle` open dropdown, and a focused input, in both light and dark themes, for the PR description.
