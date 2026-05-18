---
name: Temporal Simulator Console
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  warning: 'goldenrod'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
  panel-gap: 1px
---

## Brand & Style
The design system is engineered for high-precision technical environments, specifically targeting developers and systems architects. It evokes a "Mission Control" atmosphere—authoritative, dense with information yet surgically clean. 

The aesthetic leans into **Corporate Minimalism** with a **Technical Edge**, mimicking the efficiency of high-end Integrated Development Environments (IDEs). It prioritizes utility over decoration, utilizing a strictly logical information hierarchy. Visual interest is generated through functional color-coding rather than ornamental flourishes. The user should feel in total control of complex time-series data and asynchronous processes.

## Colors
The palette is rooted in a deep charcoal and navy foundation to reduce eye strain during extended monitoring sessions. 

- **Primary (Electric Blue):** Dedicated exclusively to Workflow-level constructs and primary actions.
- **Secondary (Royal Purple):** Reserved for Activity tasks and child-processes.
- **Semantic Colors:** Emerald (#10B981) signifies successful state transitions and "Running" statuses; Rose (#F43F5E) marks failures, timeouts, or terminated threads.
- **Neutrals:** Surfaces use a layered approach of Navy-Charcoal. The background is `#0F172A`, while interactive containers use `#1E293B`. Borders use a medium-low contrast `#334155` to maintain structure without visual noise.

## Typography
This design system employs a dual-font strategy to distinguish between UI orchestration and technical data.

- **Inter:** Used for all functional UI components, navigation, and structural headers. It provides high legibility at small scales common in dense dashboards.
- **JetBrains Mono:** Used for event logs, JSON payloads, workflow IDs, and code snippets. The monospaced nature ensures that timestamps and IDs align vertically for quick scanning.

**Hierarchy Note:** Use `label-caps` for section headers within sidebars or small metadata descriptors. All code-based text should use `code-sm` or `code-md` to immediately signal its "data" status to the developer.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model typical of sophisticated IDEs. 

- **Sidebar:** Fixed width (260px) for primary navigation and environment switching.
- **Main Stage:** A 12-column fluid grid for dashboard widgets.
- **Utility Panels:** Right-aligned drawers (320px-480px) for deep-dive event details.

Spacing is tight and systematic, based on a 4px baseline grid. We use a "Panel" approach where containers are separated by 1px borders or 16px gaps to maximize screen real estate. On mobile, the layout collapses into a single-column stack, prioritizing the active "Workflow Trace" and "Status" indicators.

## Elevation & Depth
In this system, depth is communicated through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows.

- **Level 0 (Background):** `#0F172A` - The base canvas.
- **Level 1 (Panels):** `#1E293B` with a 1px border of `#334155`.
- **Level 2 (Modals/Popovers):** `#1E293B` with a slightly brighter border `#475569` and a very soft, 10% opacity black shadow (0px 4px 20px).

There are no "floating" elements. Everything feels anchored to the grid, suggesting a stable, robust system. Interactive states (hover) should be indicated by subtle background lightening rather than an increase in shadow.

## Shapes
The shape language is "Soft-Technical." Elements use a consistent 0.25rem (4px) corner radius. This is sharp enough to feel precise and professional, but soft enough to avoid the "raw" look of brutalism. 

Status badges and tags follow this same logic—never fully pill-shaped, always maintaining a subtle rectangularity to reinforce the grid-based nature of the terminal.

## Components

### Buttons
- **Primary:** Solid Electric Blue with white text. No gradients.
- **Secondary:** Ghost style with `#334155` borders.
- **Tertiary:** Text-only for low-priority actions in logs.

### Input Fields
- Background: `#0F172A` (inset look).
- Border: `#334155`. 
- Focus: 1px Electric Blue ring with no glow.

### Cards & Panels
- Used for grouping workflow metrics. Borders are mandatory to define boundaries in a dark UI. 
- Headers should have a distinct background tint or a bottom-border to separate metadata from content.

### Chips & Badges
- **Status Badges:** Use a "Dimmed Fill" approach (e.g., Error is a dark rose background with a bright rose text) to prevent the UI from becoming too loud.
- **Activity Tags:** Small, Royal Purple borders with JetBrains Mono text.

### Event Log List
- Zebra striping is discouraged. Use 1px bottom borders.
- Timestamps should be muted (50% opacity) to keep the focus on the event name and payload.
- Hovering a log row should highlight the entire line in a subtle `#2D3748`.