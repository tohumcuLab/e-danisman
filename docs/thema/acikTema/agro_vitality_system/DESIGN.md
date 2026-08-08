---
name: Agro-Vitality System
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#3e4a40'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#6e7a6f'
  outline-variant: '#bdcabd'
  surface-tint: '#006d3c'
  primary: '#006537'
  on-primary: '#ffffff'
  primary-container: '#008148'
  on-primary-container: '#d7ffde'
  inverse-primary: '#74db98'
  secondary: '#a63b00'
  on-secondary: '#ffffff'
  secondary-container: '#fc6c29'
  on-secondary-container: '#5a1c00'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cca730'
  on-tertiary-container: '#4f3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#90f8b2'
  primary-fixed-dim: '#74db98'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#00522c'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
    fontFamily: Work Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Work Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
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
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The brand personality is rooted in agricultural expertise, vitality, and productivity. It balances the "dirt-under-the-fingernails" utility required for field work with the sophisticated data-driven insights of modern horticulture. The target audience includes home gardeners, professional growers, and agricultural hobbyists.

The design style is **Corporate / Modern** with **High-Contrast** accents. It prioritizes legibility and clarity to ensure the interface remains functional in high-glare outdoor environments. The aesthetic is clean and systematic, using structured grids and purposeful color application to guide the user through complex seed catalogs and planting schedules.

## Colors

The palette is anchored by a deep **Forest Green** (Primary), symbolizing growth and reliability, and a vibrant **Harvest Orange** (Secondary) used for critical calls to action and urgent notifications. 

To meet the "High Contrast" requirement for outdoor use, the system utilizes a pure white background with a secondary neutral palette of cool grays. **Premium** elements are distinguished by a refined Gold or a shimmering Diamond blue accent. **Advertisements** are housed within a subtle, warm-tinted surface to distinguish them from organic content without disrupting the visual flow.

## Typography

The typography system uses **Work Sans** for its exceptional legibility and professional, grounded character. Its high x-height ensures that text remains readable even on smaller mobile screens in sunlight. 

For technical data, seed SKU numbers, and growth metrics, **JetBrains Mono** is employed to provide a precise, systematic feel. Display styles use tight letter spacing and heavy weights to create a strong visual hierarchy, while body text maintains generous line-heights to reduce eye strain during long reading sessions.

## Layout & Spacing

The layout follows a **Fluid Grid** model based on an 8px base unit. 

- **Mobile:** 4-column grid with 16px side margins and 16px gutters.
- **Tablet:** 8-column grid with 24px side margins.
- **Desktop:** 12-column grid with a maximum content width of 1280px, centered with 32px margins.

Spacing is aggressive; generous white space is used to prevent the interface from feeling cluttered when displaying dense botanical information. Elements are grouped using logical padding tiers (e.g., 24px between sections, 8px between related inputs).

## Elevation & Depth

This design system utilizes **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows. In high-glare environments, subtle shadows often disappear; therefore, depth is communicated through background color shifts.

- **Level 0 (Base):** Pure White (#FFFFFF).
- **Level 1 (Cards/Containers):** Light Gray/Green tint (#F1F4F1) with a 1px solid border (#E1E4E1).
- **Level 2 (Modals/Popovers):** Pure White with a soft, 12% opacity neutral shadow to lift it from the UI.
- **Interactive States:** Hovering or focusing on an element increases the border weight or shifts the background to a slightly darker tonal value.

## Shapes

The shape language is **Soft**. A 4px (0.25rem) base radius is applied to standard components like inputs and buttons, providing a modern feel that isn't overly "bubbly." This geometric precision reflects the structured nature of commercial farming and rows of crops. Larger components like cards use a 12px (0.75rem) radius to create clear visual containment.

## Components

### Buttons & Inputs
- **Primary Button:** Solid #008148 with White text. Bold weight.
- **Secondary Button:** 2px border of #008148 with transparent background.
- **Input Fields:** 1px border (#D1D5DB) with a subtle #F9FAFB background. Active state uses a 2px Primary Green border.

### Premium Badges
- **Gold Tier:** Use a gradient background (Linear: #D4AF37 to #F2D472) with a dark neutral (#1A1C1E) label. Use the `label-caps` typography.
- **Diamond Tier:** Use a subtle holographic effect or a solid #B9F2FF background with #004E64 text. Include a small diamond icon prefix.

### Ad Containers
- **Styling:** Advertisements must be clearly demarcated using a pale yellow background (#FFF9E6) and a thin #E6D5A3 border.
- **Labeling:** A "SPONSORED" or "AD" tag using `label-caps` must appear in the top-right corner in #8A7A4D.

### Lists & Cards
- **Product Cards:** Use a 1px border. The secondary orange color is reserved for "Add to Cart" or "Sale" price indicators.
- **Growth Logs:** Use JetBrains Mono for all timestamps and numeric data within list items.