---
name: Academic Zen
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271900'
  on-tertiary-container: '#9f7f49'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdeab'
  tertiary-fixed-dim: '#e7c185'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5c4212'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Instrument Serif
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Instrument Serif
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: '0'
  headline-md-mobile:
    fontFamily: Instrument Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: '0'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-content-width: 1152px
  max-reading-width: 768px
---

## Brand & Style
The design system for Cita is rooted in the "Academic Zen" philosophy—a departure from high-energy, neon-inflected AI platforms in favor of a mature, scholarly atmosphere. It evokes the quiet focus of a prestigious university library. The target audience consists of serious civil service candidates (CPNS) who require a grounding, distraction-free environment for intensive mock exams.

The visual style is **Minimalist and Corporate**, utilizing a sophisticated grid-based structure that values whitespace as a tool for focus. It rejects the "SaaS-standard" of heavy drop shadows and vibrant gradients, instead using hairline borders and tonal surfaces to communicate hierarchy and trustworthiness. The emotional response should be one of calm authority and academic rigor.

## Colors
The palette is inspired by traditional archival materials and high-end publishing.

- **Primary (Ink Blue):** Used for primary typography, dominant interactive states, and branding. It represents authority and professional rigor.
- **Secondary (Serene Slate):** Used for borders, inactive UI states, and metadata. It provides a grounding, neutral balance.
- **Tertiary (Academic Gold):** Used sparingly as an achievement accent—representing success, high-tier progress, and correct answers.
- **Neutral (Parchment White):** The core background surface. This soft, off-white tone is designed to minimize eye strain during multi-hour testing sessions compared to pure hex-white.
- **Surface (Archival White):** Pure white (`#FFFFFF`) is used only for active containers, input fields, and cards to create crisp definition against the Parchment background.

## Typography
The system uses a pairing of a stately serif and a utilitarian sans-serif to bridge the gap between tradition and technology.

- **Headings:** **Instrument Serif** provides a scholarly, established feel. It is used for hero titles and test question prompts to center the user’s focus on the academic content.
- **Body & UI:** **Inter** is used for all functional text, inputs, and long-form explanations to ensure maximum clarity.
- **Labels:** Uppercase labels with wide tracking (`0.08em`) are used for category tags and sticky metadata to maintain a disciplined, organized structure.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy that mimics the organized margins of a textbook.

- **Grid:** A 12-column grid is used for the desktop dashboard, while the testing interface uses a focused two-column split (70/30) for questions and navigation.
- **Breakpoints:**
  - **Desktop (>1024px):** 32px margins. Side-by-side question and chat structures.
  - **Tablet (640px - 1024px):** 24px margins. Question and AI tools stack or use tabbed navigation.
  - **Mobile (<640px):** 16px margins. Single-column fluid cards.
- **Reading Width:** For testing modules, content width is capped at 768px to maintain optimal line lengths for reading comprehension.

## Elevation & Depth
Depth in this design system is communicated through **Tonal Layers and Low-Contrast Outlines** rather than shadows.

- **Hierarchy through Contrast:** The background is `Parchment White`, while primary interactive containers (cards, inputs) are `Archival White` with a `1px` border of `Serene Slate` at 20% opacity.
- **No Shadows:** Shadows are strictly avoided. Instead, active states are indicated by a change in border color (to `Ink Blue` or `Academic Gold`) or a subtle tonal shift in the background fill.
- **Backdrop Blurs:** In sticky navigation headers, use a subtle backdrop blur (`8px`) with a semi-transparent `Parchment White` fill to maintain a sense of space while scrolling.

## Shapes
The shape language is professional and measured. A **Rounded** setting (8px base) is used to ensure the UI feels modern and approachable without losing its "academic" seriousness.

- **Standard Elements:** Buttons and input fields use an 8px radius.
- **Large Containers:** Content cards and panels use a 12px-16px radius to frame the content softly.
- **Interactive Pills:** Chips and quick-action suggestions use a full-pill radius to distinguish them from primary structural elements.

## Components
Consistent application of the "Academic Zen" style across core elements:

- **Buttons:** 
  - *Primary:* Solid `Ink Blue` with `Parchment White` text. No shadow.
  - *Secondary:* `1px` border of `Serene Slate` with `Ink Blue` text.
- **Cards:** White background, `1px` border in `#E2E8F0`, 24px internal padding. No shadow.
- **Input Fields:** Flat white background, `1px` border. On focus, the border transitions to `Academic Gold` with a clean, 2px solid ring of the same color (no blur).
- **Tryout Question Panels:** Subcategory labels in `label-caps`. Question text in `Instrument Serif`. 
- **Selection Options:** Vertical stack with `1px` borders. The selected state uses an `Ink Blue` border and a very faint `Ink Blue` tint (5% opacity) as a fill.
- **AI Tutor Chat:** Framed in a bordered sidebar. Messages use clean, markdown-supported typography with distinct separators instead of "bubbles" to maintain a professional document feel.
- **Progress Bars:** Thin (4px), using `Academic Gold` for the progress fill against a `Serene Slate` track.