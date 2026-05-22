---
name: Scholarly Refinement
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#42474a'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#73787b'
  outline-variant: '#c3c7ca'
  surface-tint: '#4e616a'
  primary: '#33454e'
  on-primary: '#ffffff'
  primary-container: '#4a5d66'
  on-primary-container: '#c1d5e0'
  inverse-primary: '#b5cad4'
  secondary: '#49645b'
  on-secondary: '#ffffff'
  secondary-container: '#c8e6db'
  on-secondary-container: '#4d685f'
  tertiary: '#523f2f'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b5645'
  on-tertiary-container: '#e9cdb7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e6f0'
  primary-fixed-dim: '#b5cad4'
  on-primary-fixed: '#0a1e26'
  on-primary-fixed-variant: '#374952'
  secondary-fixed: '#cbe9de'
  secondary-fixed-dim: '#afcdc2'
  on-secondary-fixed: '#042019'
  on-secondary-fixed-variant: '#314c44'
  tertiary-fixed: '#fbddc7'
  tertiary-fixed-dim: '#ddc1ac'
  on-tertiary-fixed: '#27180b'
  on-tertiary-fixed-variant: '#564333'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2.5rem
  xl: 4rem
  container-max: 1120px
  gutter: 24px
---

## Brand & Style

The design system is built for a "Sophisticated Academic" experience, prioritizing long-form reading, deep focus, and intellectual clarity. The brand personality is authoritative yet approachable, evoking the feeling of a modern library or a high-end editorial publication.

The design style is a blend of **Minimalism** and **Modern Corporate**, utilizing generous whitespace and a restricted, muted palette to reduce cognitive load. It avoids aggressive visual cues in favor of subtle transitions and precise typography. The emotional response is one of calm, stability, and quiet confidence, ensuring that the content remains the primary focus while the UI provides a supportive, high-quality framework.

## Colors

This color system departs from high-contrast cool tones in favor of a "Warm Academic" palette. The background is a soft cream (`#F9F7F2`) to minimize eye strain during extended sessions. 

- **Primary:** A muted Slate Blue-Grey, replacing deep navy for a softer but still authoritative presence.
- **Secondary:** A desaturated Sage Green, evolving the mint accent into a more organic, harmonious tone.
- **Tertiary:** A warm Sandstone, used sparingly for highlights or categorized metadata.
- **Neutrals:** Surfaces use subtle shifts in warmth rather than grey scales to maintain the sophisticated atmosphere.

All text combinations are calibrated to meet WCAG AA standards, ensuring legibility without the "piercing" effect of pure black on white.

## Typography

The typography strategy pairs the authoritative, literary feel of **Source Serif 4** with the contemporary, precise clarity of **Hanken Grotesk**. 

Headlines use the serif face to establish a traditional academic rhythm, while body copy utilizes the sans-serif for optimal digital legibility. Line heights are intentionally generous (1.6x for body) to facilitate ease of scanning and reading. Labels and small metadata use increased letter spacing and semi-bold weights in Hanken Grotesk to maintain distinctness at smaller scales.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop to mirror the layout of a physical journal or monograph, centering content to promote focus. 

- **Desktop:** 12-column grid with a 1120px max-width.
- **Tablet:** 8-column fluid grid with 32px side margins.
- **Mobile:** 4-column fluid grid with 20px side margins.

The spacing rhythm is based on a 4px baseline, with a preference for larger "breathing room" (`lg` and `xl` units) between major sections to reinforce the calm, sophisticated aesthetic. Content blocks should use consistent vertical rhythm to maintain a sense of structured order.

## Elevation & Depth

To maintain the "Sophisticated Academic" feel, this design system avoids heavy shadows and floating effects. Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines**.

- **Surface Tiers:** The base layer is the warmest (`#F9F7F2`). Raised containers (like cards) use a slightly lighter, "pure" off-white with a very thin (1px) border in a muted neutral-grey.
- **Interactive Depth:** Elements do not lift off the page; instead, they change fill color slightly or darken their borders when hovered.
- **Modals:** When necessary, modals use a soft backdrop dimming effect (40% opacity of the Primary color) rather than a harsh black, keeping the transitions smooth and integrated.

## Shapes

The shape language is conservative and disciplined. A **Soft (0.25rem)** roundedness is applied to standard UI components like buttons and input fields, providing just enough approachability without losing the professional, structured feel of an academic publication. 

Larger containers like cards may use `rounded-lg` (0.5rem) to differentiate them from smaller interactive elements, but the overall silhouette remains crisp and geometric.

## Components

### Buttons
Primary buttons use the muted Slate Blue-Grey with white text. Secondary buttons are outlined with the same color and no fill. The "ghost" variant uses the Sage Green for text to indicate a positive, secondary action.

### Input Fields
Fields use a subtle cream-grey fill that is slightly darker than the background, with a 1px border. Focus states transition the border to the Primary color and add a soft 2px outer glow in the same hue.

### Cards
Cards are defined by their 1px soft borders and white backgrounds. They should not have shadows. Padding within cards should be generous (minimum 24px) to maintain the "airy" academic feel.

### Chips & Tags
Used for categories or metadata, these use the Tertiary (Sandstone) color at low opacity (15%) with darker text of the same hue. This keeps them legible but prevents them from competing with the primary call-to-action.

### Lists
Bibliographic or data lists should use thin horizontal dividers in a very light neutral tone. Typography within lists should strictly follow the `body-md` and `label-sm` hierarchy to maintain a clean, organized appearance.