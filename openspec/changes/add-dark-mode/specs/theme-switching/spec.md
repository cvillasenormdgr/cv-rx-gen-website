## ADDED Requirements

### Requirement: Theme Selection
The system SHALL allow the user to select between three themes — `light`, `dark`, and `system` — and SHALL apply the chosen theme to the entire application UI by toggling the `dark` class on the root `<html>` element.

#### Scenario: User selects dark theme
- **WHEN** the user opens the theme toggle in the navbar and chooses "Dark"
- **THEN** the `<html>` element receives the `dark` class
- **AND** all theme-aware surfaces (background, card, text, borders) re-render with the dark token palette defined in `app/globals.css`

#### Scenario: User selects light theme
- **WHEN** the user opens the theme toggle and chooses "Light"
- **THEN** the `dark` class is removed from `<html>`
- **AND** the UI renders using the light token palette

#### Scenario: User selects system theme
- **WHEN** the user opens the theme toggle and chooses "System"
- **THEN** the applied theme MUST follow the OS-level `prefers-color-scheme` value
- **AND** the UI MUST update live if the OS preference changes while the app is open (e.g. macOS auto-switches at sunset)

### Requirement: Theme Persistence
The system SHALL persist the user's explicit theme choice across sessions and tabs using `localStorage` under a single, namespaced key (e.g. `rx-gen-theme`). The stored value MUST be one of `light`, `dark`, or `system`.

#### Scenario: Returning user keeps prior choice
- **WHEN** a user previously selected "Dark" and reloads the page
- **THEN** the page MUST render in dark mode on first paint without flashing the light palette

#### Scenario: First-time visitor defaults to system
- **WHEN** a user visits the app for the first time and no value exists in `localStorage`
- **THEN** the effective theme MUST default to `system` (OS preference)

#### Scenario: Storage value is invalid or missing
- **WHEN** the stored value is absent, malformed, or not one of the allowed strings
- **THEN** the system MUST fall back to `system` without throwing

### Requirement: Flash-Free Hydration
The system SHALL prevent a flash of incorrect theme (FOUC) on initial page load by resolving and applying the theme synchronously before the React tree hydrates.

#### Scenario: Dark-mode user reloads
- **WHEN** a user with persisted `dark` reloads any route
- **THEN** the document MUST NOT render any frame in light mode prior to hydration
- **AND** the resolution script MUST execute as a blocking inline script in `<head>` (no external request, no `async`/`defer`)

#### Scenario: Script failure is non-fatal
- **WHEN** the inline theme-resolution script throws (e.g. `localStorage` unavailable in private mode)
- **THEN** the failure MUST be swallowed and the app MUST continue to render in the default `system` theme

### Requirement: Theme Toggle Component
The system SHALL expose a reusable `ThemeToggle` component, mounted in the `Navbar`, that displays the current theme and lets the user switch between `light`, `dark`, and `system`.

#### Scenario: Toggle reflects active theme
- **WHEN** the active theme is `dark`
- **THEN** the toggle MUST visually indicate dark is selected (e.g. moon icon active or "Dark" option marked)

#### Scenario: Toggle is keyboard accessible
- **WHEN** a user navigates the toggle using the keyboard (Tab to focus, Enter/Space to open, arrows to choose, Enter to confirm)
- **THEN** they MUST be able to change the theme without a mouse
- **AND** the trigger MUST expose an accessible name (e.g. `aria-label="Toggle theme"`)

### Requirement: Theme Context API
The system SHALL provide a single React context (mounted once near the root) and a `useTheme` hook that exposes:
- `theme`: the user's stored preference (`light` | `dark` | `system`)
- `resolvedTheme`: the actually-applied theme (`light` | `dark`)
- `setTheme(next)`: a setter that updates state, persists to `localStorage`, and updates the `<html>` class

Components MUST consume the hook rather than reading `localStorage` or DOM classes directly.

#### Scenario: Hook used outside provider
- **WHEN** a component calls `useTheme` and no `ThemeProvider` is mounted above it
- **THEN** the hook MUST throw a developer-friendly error identifying the missing provider

#### Scenario: setTheme updates everywhere
- **WHEN** any consumer calls `setTheme("dark")`
- **THEN** `localStorage` MUST be updated, the `<html>` class MUST be toggled, and all components consuming `useTheme` MUST re-render with the new values within the same React commit

### Requirement: Theme-Aware Layout Chrome
The application's layout chrome (root container, `Navbar`, `Main` wrapper) SHALL use Tailwind theme tokens (e.g. `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`) instead of hard-coded color utilities (e.g. `bg-white`, `bg-gray-100`, `text-gray-700`, `bg-red-500`) so the chrome responds to theme changes.

#### Scenario: Navbar in dark mode
- **WHEN** the active theme is dark
- **THEN** the `Navbar` background MUST use the dark `card`/`background` token, link text MUST use `foreground`/`muted-foreground`, and no light-only utility (e.g. `bg-white`) may remain in the Navbar markup

#### Scenario: Main wrapper in dark mode
- **WHEN** the active theme is dark
- **THEN** the `Main` page wrapper MUST use `bg-background` (or equivalent token) instead of `bg-gray-100`
- **AND** debug-style utilities such as `bg-red-500` MUST be removed from production markup

### Requirement: PDF Templates Remain Light
The prescription PDF templates rendered server-side via Puppeteer (`app/components/PrescriptionTemplates/**` and the `/api/generate-pdf` route) SHALL always render with the light palette regardless of the on-screen theme.

#### Scenario: PDF generated while dark mode active
- **WHEN** a user with `dark` theme clicks "Generate"
- **THEN** the produced PDF MUST be visually identical to one generated with `light` theme
- **AND** the rendered HTML used by Puppeteer MUST NOT carry the `dark` class on `<html>`
