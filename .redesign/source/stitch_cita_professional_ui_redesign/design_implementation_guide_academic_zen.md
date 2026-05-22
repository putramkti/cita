# Design Implementation Guide: Cita (Academic Zen)

This document provides the design tokens and structural patterns for implementing the "Academic Zen" redesign for Cita.

## 1. Visual Philosophy: Academic Zen
A blend of **Modern Academic** and **Calm UI**.
- **Oversized Typography**: Clear hierarchy using high-contrast Serif for authority.
- **Minimalist Palette**: Deep Ink and Academic Gold accents on clean surfaces.
- **Precision Layout**: No heavy shadows; use 1px borders for structure.

## 2. Design Tokens

### Colors (Tailwind CSS Variables)
```css
:root {
  --primary: #0F172A;        /* Ink Blue - Text, Primary Buttons */
  --primary-foreground: #FFFFFF;
  --accent: #B5935B;         /* Academic Gold - Highlights, Icons, Progress */
  --background: #FFFFFF;
  --surface: #F8F9FA;        /* Light Gray for sections/cards */
  --outline: #E2E8F0;        /* 1px Border color */
  --text-muted: #64748B;
}
```

### Typography
- **Headings & Soal**: `Source Serif 4` (or similar premium Serif). Bold/Semi-bold.
- **Body & UI**: Modern Sans-Serif (Inter, Geist, or System Sans).

## 3. Key Components Structure

### Top Navigation
- Transparent or `bg-white/80` with `backdrop-blur`.
- Logo on left, minimal text links, Primary CTA (`Start Test`) in Solid Ink Blue.

### Tryout Card (Distraction-Free)
- **Container**: `border border-outline rounded-none` (sharp or very small radius).
- **Question Text**: Serif, large line-height (`leading-relaxed`), `text-primary`.
- **Options**: `bg-surface` by default, `border-primary` with subtle gold accent when selected.

### Results / Analytics
- **Bento Grid**: Use modular blocks with `border-outline` and zero shadows.
- **Data Viz**: Use `var(--accent)` for positive progress and `var(--primary)` for baseline.

## 4. Logo Implementation (SVG)
```svg
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M20 12V20L25 23" stroke="#B5935B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32" cy="12" r="3" fill="#B5935B"/>
</svg>
```

## 5. Integration Checklist for Hermes Agent
1. **Update Tailwind Config**: Add the Ink Blue and Academic Gold to the color palette.
2. **Apply Typography**: Set the global font-family for headings to a Serif stack.
3. **Refactor Components**: Replace `shadow-*` utility classes with `border` and `border-outline`.
4. **Copy HTML**: Use the provided screen structures as the baseline for your React/Next.js components.
