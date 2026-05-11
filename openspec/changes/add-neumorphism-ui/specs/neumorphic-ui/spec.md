## ADDED Requirements

### Requirement: Neumorphic Token System
The application SHALL define a single set of CSS custom properties in `app/globals.css` that drive every neumorphic surface, with explicit values for both the light (`:root`) and dark (`.dark`) palettes. Component code MUST consume these tokens (directly or via the `.neu-*` utility classes) and MUST NOT hardcode `box-shadow` color/offset values inline.

The token set MUST include, at minimum:
- `--shadow-neu-light` and `--shadow-neu-dark`: paired raised shadows for the default depth.
- `--shadow-neu-light-sm` and `--shadow-neu-dark-sm`: smaller paired shadows for the pressed/active state.
- `--shadow-neu-inset-light` and `--shadow-neu-inset-dark`: paired inset shadows for the pushed-in state used by inputs.
- `--neu-radius`: the canonical corner radius for neumorphic surfaces.

#### Scenario: Tokens defined for both palettes
- **WHEN** `app/globals.css` is loaded
- **THEN** every required `--shadow-neu-*` and `--neu-radius` token MUST be defined under `:root`
- **AND** every required `--shadow-neu-*` and `--neu-radius` token MUST be defined under `.dark` (dark-palette values may differ)

#### Scenario: No hardcoded shadow values in components
- **WHEN** a component renders a neumorphic surface
- **THEN** it MUST reference the tokens via the `.neu-*` utility classes or `box-shadow: var(--shadow-neu-*)`
- **AND** it MUST NOT inline literal `rgba(...)` or `oklch(...)` shadow color values for the neumorphic look

### Requirement: Neumorphic Utility Classes
The application SHALL expose at least the following utility classes via `app/globals.css` (declared inside `@layer utilities`):
- `.neu-raised`: a default raised surface (paired light + dark shadows from the `--shadow-neu-light` / `--shadow-neu-dark` tokens).
- `.neu-pressed`: a smaller, attenuated paired-shadow set, intended for `:active` or pressed states.
- `.neu-inset`: an inset (pushed-in) surface using `--shadow-neu-inset-light` / `--shadow-neu-inset-dark`.
- `.neu-subtle`: a quieter raised treatment for large chrome surfaces (e.g. the `Navbar`).
- `.neu-flat`: an explicit `box-shadow: none` reset for surfaces that opt out of neumorphism.

Each utility MUST also apply `border-radius: var(--neu-radius)` (callers may override with a Tailwind `rounded-*` class as needed).

#### Scenario: Utility resolves both shadows in one declaration
- **WHEN** a consumer applies `className="neu-raised"`
- **THEN** the rendered element MUST receive both the light and dark shadow declarations from the token pair
- **AND** the element MUST receive `border-radius: var(--neu-radius)` unless overridden by a more-specific class

#### Scenario: Utility responds to theme switch
- **WHEN** the active theme changes from light to dark while a `.neu-raised` element is on screen
- **THEN** the rendered shadow values MUST update to the dark-palette token values without a page reload

### Requirement: Neumorphic Button Variants
The shadcn `Button` (`@/components/ui/button`) SHALL render its `default`, `outline`, `secondary`, and `ghost` variants with neumorphic depth: a raised surface at rest, a pressed (attenuated) surface on `:active`, and an inset surface on `aria-expanded` / `data-[state=open]`. The `link` and `destructive` variants SHALL NOT receive neumorphic shadows.

The button's existing focus-visible ring (driven by the `--ring` token) MUST remain visible and unchanged in z-order — neumorphic shadows MUST NOT obscure or replace it. The `:disabled` state MUST drop the neumorphic depth (no raised affordance) while keeping the existing opacity treatment.

#### Scenario: Default button at rest
- **WHEN** a `<Button variant="default">` is rendered with no interaction state
- **THEN** the rendered element MUST have a raised neumorphic shadow (paired light + dark)
- **AND** the element MUST NOT render a hairline `border` against the neumorphic background

#### Scenario: Default button while pressed
- **WHEN** the user presses (mouse-down or keyboard activate) the same button
- **THEN** the rendered element MUST switch to the pressed (`.neu-pressed`-equivalent) shadow set
- **AND** the existing `active:translate-y-px` micro-interaction MUST still apply (unless `prefers-reduced-motion: reduce` is set)

#### Scenario: Dropdown trigger while open
- **WHEN** a button has `aria-expanded="true"` (e.g. the `ThemeToggle` while its menu is open) or `data-[state=open]`
- **THEN** the button MUST render with the inset (`.neu-inset`-equivalent) shadow set so it visibly reads as engaged

#### Scenario: Disabled button does not look pressable
- **WHEN** a `<Button disabled>` is rendered
- **THEN** the neumorphic raised shadows MUST be removed
- **AND** the existing `disabled:opacity-50` treatment MUST still apply

#### Scenario: Link and destructive variants are excluded
- **WHEN** a `<Button variant="link">` or `<Button variant="destructive">` is rendered
- **THEN** the rendered element MUST NOT carry any neumorphic shadow utilities

#### Scenario: Focus ring remains visible
- **WHEN** any neumorphic button receives keyboard focus (`:focus-visible`)
- **THEN** the existing focus ring (driven by the `--ring` token) MUST remain visible and visually distinct from the neumorphic shadows

### Requirement: Neumorphic Form Controls
Native form controls rendered by `app/components/Form/FormInput` and `app/components/Form/FormSelect` SHALL use the inset (pushed-in) neumorphic surface as their default treatment instead of the current `border border-border` outline. Padding, label markup, and validation messaging MUST remain unchanged.

A clearly visible focus indicator MUST appear when the input/select is focused, driven by the existing `--ring` token, and MUST NOT depend on the neumorphic shadows alone.

#### Scenario: Text input default state
- **WHEN** a `FormInput` is rendered without focus
- **THEN** the `<input>` MUST carry the inset neumorphic shadow set
- **AND** the visible `border border-border` outline MUST be replaced (under default contrast settings) by the inset shadow

#### Scenario: Text input focused state
- **WHEN** the user focuses the same `<input>` via keyboard or click
- **THEN** an outline / ring driven by `--ring` MUST be visible around the input
- **AND** the focus indicator MUST NOT be conveyed by shadow change alone (i.e. an outline or `ring` width MUST be present)

#### Scenario: Select default state
- **WHEN** a `FormSelect` is rendered with no interaction
- **THEN** the rendered `<select>` MUST carry the inset neumorphic shadow set
- **AND** existing functionality (placeholder option, `disabledValues`) MUST be preserved

#### Scenario: Validation error state
- **WHEN** a form field has a validation error and renders the error message
- **THEN** the existing error styling (e.g. `text-destructive` on the message) MUST still apply
- **AND** the inset surface MUST still render so the field remains visually identifiable as an input

### Requirement: Neumorphic Layout Chrome
The `Navbar` and the `Main` form-card surface SHALL render as raised neumorphic cards driven by the new utilities, replacing the current flat `border-b` / `shadow-sm` treatment. Layout dimensions, responsive breakpoints, and existing `bg-card` / `bg-background` / `text-foreground` token usage MUST be preserved; only the shadow and (optionally) border treatments change.

The form region inside `Main` SHALL be wrapped in (or itself become) a card surface using `bg-card` plus a raised neumorphic utility, so the form visually sits above the page background.

#### Scenario: Navbar uses subtle raised treatment
- **WHEN** the `Navbar` is rendered in either theme
- **THEN** it MUST carry the `.neu-subtle` (or equivalent token-driven) raised shadow
- **AND** it MUST NOT carry the previous `border-b border-border shadow-sm` combination

#### Scenario: Main form sits on a card
- **WHEN** the form region in `Main` is rendered
- **THEN** the form MUST be contained by a surface using `bg-card` plus a raised neumorphic utility
- **AND** the form fields and `Generate` button MUST remain functionally and visually accessible (no clipping by the card)

#### Scenario: Theme switch updates chrome live
- **WHEN** the user switches themes via the `ThemeToggle` while viewing the page
- **THEN** the `Navbar` and form-card surfaces MUST re-render their neumorphic shadows from the appropriate (light vs dark) token values without a page reload

### Requirement: Accessibility Fallbacks
The neumorphic system SHALL respect user accessibility preferences. Specifically:
- Under `@media (prefers-contrast: more)`, the `.neu-*` utilities MUST attenuate (or drop) shadows and re-enable a visible `border` (using the existing `--border` token) on neumorphic surfaces, including buttons and form controls.
- Under `@media (prefers-reduced-motion: reduce)`, the `:active` press-down `transform` (`translateY`) MUST be suppressed; the shadow swap (which is communicative, not decorative motion) MAY still occur.
- WCAG AA contrast for body text on `bg-background` and on `bg-card` (in both themes) MUST be preserved after the `--background` token retune; failing combinations MUST be reverted before merge.

#### Scenario: High-contrast user gets borders back
- **WHEN** the user agent reports `prefers-contrast: more`
- **THEN** neumorphic surfaces (buttons, form inputs, navbar, form card) MUST render a visible `border` using the `--border` token
- **AND** the `box-shadow` MUST be visibly attenuated or removed so the border is the primary affordance

#### Scenario: Reduced-motion user does not get translate
- **WHEN** the user agent reports `prefers-reduced-motion: reduce`
- **THEN** activating a neumorphic button MUST NOT trigger the `translateY` press animation
- **AND** the shadow change between rest and pressed states MAY still occur

#### Scenario: Text contrast preserved after background retune
- **WHEN** the application renders body text using `text-foreground` on `bg-background` (light or dark theme)
- **THEN** the rendered combination MUST meet WCAG AA contrast (≥ 4.5:1 for normal text, ≥ 3:1 for large text)

### Requirement: PDF Templates Excluded
The neumorphic system SHALL NOT be applied to the prescription PDF templates rendered server-side via Puppeteer (`app/components/PrescriptionTemplates/**`) or to the `/api/generate-pdf` route. Generated PDFs MUST remain visually identical to the pre-change baseline regardless of the on-screen UI theme or any neumorphic styling.

The `/api/generate-pdf/route.js` file MUST contain an explanatory comment stating that PDF rendering must remain on the flat light palette.

#### Scenario: PDF generated while UI is neumorphic
- **WHEN** a user clicks `Generate` while the on-screen UI is rendered with neumorphic chrome (in either light or dark mode)
- **THEN** the produced PDF MUST be visually identical to one generated before this change shipped
- **AND** the rendered HTML used by Puppeteer MUST NOT include any `.neu-*` class on prescription markup

#### Scenario: PDF route documents the exclusion
- **WHEN** a developer reads `app/api/generate-pdf/route.js`
- **THEN** they MUST find an inline comment explicitly stating that the PDF route must not consume neumorphic styling and must remain on the flat light palette
