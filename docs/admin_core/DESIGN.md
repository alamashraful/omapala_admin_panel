---
name: Admin Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4945'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f7975'
  outline-variant: '#bec9c3'
  surface-tint: '#106b56'
  primary: '#004a3a'
  on-primary: '#ffffff'
  primary-container: '#006450'
  on-primary-container: '#8edec4'
  inverse-primary: '#87d6bd'
  secondary: '#55615e'
  on-secondary: '#ffffff'
  secondary-container: '#d8e5e1'
  on-secondary-container: '#5b6764'
  tertiary: '#6b2e24'
  on-tertiary: '#ffffff'
  tertiary-container: '#884439'
  on-tertiary-container: '#ffbfb4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a2f2d8'
  primary-fixed-dim: '#87d6bd'
  on-primary-fixed: '#002018'
  on-primary-fixed-variant: '#005140'
  secondary-fixed: '#d8e5e1'
  secondary-fixed-dim: '#bcc9c6'
  on-secondary-fixed: '#121e1c'
  on-secondary-fixed-variant: '#3d4947'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a7'
  on-tertiary-fixed: '#3b0904'
  on-tertiary-fixed-variant: '#73342a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  table-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
  mono:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
---

## Brand & Style

This design system is engineered for high-performance administration, shifting the soft, consumer-facing aesthetic of the original app into a **Corporate / Modern** framework. The goal is to project professional reliability, authority, and systematic efficiency.

The design emphasizes high information density without sacrificing clarity. It utilizes a structured visual hierarchy where the deep teal acts as a grounding anchor for global navigation, while the main workspace remains pristine and functional. The emotional response is one of "focused control"—reducing visual noise to allow the administrator to process large datasets and complex workflows quickly.

## Colors

The palette leverages the deep teal from the consumer app as the high-authority primary color, primarily used for the sidebar and top-level navigation. The workspace utilizes a very light gray canvas (`#F8FAFC`) to reduce eye strain during long sessions.

A semantic color system is introduced for data integrity:
- **Success (Green):** Confirmed actions or active states.
- **Pending (Amber):** Items requiring attention or in progress.
- **Review (Orange):** Manual intervention required; higher priority than pending.
- **Rejected/Blocked (Red):** Critical errors or stopped processes.

The "soft green" from the consumer app is transitioned into a subtle background tint (`#E8F5F1`) for highlights and active row states in tables.

## Typography

The design system utilizes **Inter** for its exceptional legibility and neutral, systematic tone. The type scale is intentionally condensed to support data-dense layouts.

- **Tables:** Use `table-header` for column titles to differentiate them from row data. Use `body-sm` for standard cell content.
- **Data IDs:** Technical strings or IDs should use a monospaced font for character clarity.
- **Forms:** Labels use `body-sm` with a medium weight (500) to ensure they are distinct from input text.

## Layout & Spacing

The layout utilizes a **fluid grid** system to maximize screen real estate on wide desktop monitors. The workspace is divided into a fixed-width left sidebar (240px or 64px collapsed) and a flexible main content area.

Information density is maintained through a 4px baseline grid. Internal component padding is significantly tighter than the consumer app (e.g., table cells use `8px` vertical padding instead of `16px`). Content should be organized into logical modules separated by `24px` margins.

## Elevation & Depth

Depth is communicated through **Tonal Layers** and **Low-contrast Outlines** rather than aggressive shadows. 

- **Level 0 (Canvas):** The base light-gray background.
- **Level 1 (Cards/Sections):** White background with a 1px border (`#E2E8F0`) and a very soft, diffused shadow (0px 1px 3px rgba(0,0,0,0.05)).
- **Level 2 (Popovers/Modals):** White background with a more pronounced shadow to indicate focus (0px 10px 15px rgba(0,0,0,0.1)).

This approach maintains a flat, enterprise-ready feel while providing enough depth to distinguish interactive surfaces.

## Shapes

The design system adopts a **Soft** shape language. While the consumer app uses large, playful radii, this system uses a standard `4px` (0.25rem) radius for buttons, input fields, and small cards. 

This smaller radius maximizes usable space within components and aligns with the professional, structured nature of an admin panel. Larger containers like main content panels may use `8px` (rounded-lg) to subtly soften the overall UI.

## Components

- **Buttons:** Primary buttons use the deep teal. Secondary buttons use a white background with a gray border. Size should be compact (32px height for standard).
- **Data Tables:** The core of the system. Use zebra striping with the soft green (`#E8F5F1`) on hover. Borders should be horizontal-only to emphasize row scanning.
- **Status Chips:** Small, pill-shaped indicators using a low-opacity background of the semantic color with high-contrast text (e.g., Red text on light pink background).
- **Inputs:** Clean, outlined boxes with a `1px` border that shifts to the deep teal on focus. Placeholder text should be a light neutral (`#94A3B8`).
- **Sidebar:** Uses the primary deep teal with a slightly darker shade for the active state. Icons should be simple, 20px line icons.
- **Cards:** Used to group related data. They should be border-heavy rather than shadow-heavy to keep the UI feeling "tight" and professional.