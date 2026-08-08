---
name: Agri-Social Core
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bdcabd'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#889489'
  outline-variant: '#3e4a40'
  surface-tint: '#74db98'
  primary: '#74db98'
  on-primary: '#00391d'
  primary-container: '#008148'
  on-primary-container: '#d7ffde'
  inverse-primary: '#006d3c'
  secondary: '#ffb599'
  on-secondary: '#5a1c00'
  secondary-container: '#cb4a00'
  on-secondary-container: '#fffbff'
  tertiary: '#59df89'
  on-tertiary: '#00391a'
  tertiary-container: '#008143'
  on-tertiary-container: '#d6ffdb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#90f8b2'
  primary-fixed-dim: '#74db98'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#00522c'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'
  tertiary-fixed: '#77fca3'
  tertiary-fixed-dim: '#59df89'
  on-tertiary-fixed: '#00210d'
  on-tertiary-fixed-variant: '#005228'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
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
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 20px
---

## Brand & Style
The brand personality is professional, community-focused, and grounded in agricultural heritage. It balances the reliability of established farming practices with the forward-thinking nature of modern ag-tech. The UI should evoke a sense of growth, trust, and structural clarity.

The design style is **Corporate / Modern** with subtle **Minimalist** influences. It prioritizes information density and clarity—essential for data-heavy agricultural social interactions—while utilizing high-quality whitespace to prevent cognitive overload. The aesthetic is clean and functional, ensuring that user-generated content (crops, livestock, soil data) remains the focal point.

## Colors
The palette is centered around the official Hobi Tohum brand colors. The primary green (#008148) represents vitality and growth, while the secondary orange (#F26522) acts as a high-visibility accent for calls-to-action and critical alerts.

This design system defaults to **Dark Mode** to reduce eye strain for users who may be checking data in low-light outdoor environments. 
- **Surfaces:** We use a deep slate hierarchy. Level 0 is #121212, Level 1 (cards/containers) is #1E1E1E.
- **Accessibility:** Text on primary/secondary backgrounds must use pure white or high-contrast black based on WCAG 2.1 AAA standards. 
- **Vibrant Accents:** In dark mode, the secondary orange is slightly desaturated to 85% to prevent vibration against the slate background while maintaining its "vibrant" feel.

## Typography
The system uses **Inter** exclusively to maintain a systematic, utilitarian aesthetic. It is a highly legible typeface that performs exceptionally well on small screens where agricultural data (measurements, dates, weather metrics) must be read quickly.

- **Headlines:** Use tighter letter-spacing and heavier weights to establish a strong visual hierarchy.
- **Body Text:** Standard weight (400) is used for readability in social feeds and forum posts.
- **Labels:** Uppercase styling is permitted for small category labels or "overlines" to differentiate metadata from content.

## Layout & Spacing
This design system utilizes a **Fluid Grid** model based on an 8px rhythmic scale. 

- **Desktop:** A 12-column grid with 24px gutters and 40px margins. 
- **Tablet:** An 8-column grid with 16px gutters.
- **Mobile:** A 4-column grid with 16px gutters and margins.

Spacing is used to group related agricultural data. For instance, a "Field Report" card uses `md` (16px) internal padding, while the gap between separate feed items uses `lg` (24px) to provide clear visual separation without the need for heavy lines.

## Elevation & Depth
In this dark-themed system, depth is communicated through **Tonal Layers** rather than heavy shadows. 

1. **Level 0 (Base):** #121212 - Used for the main background.
2. **Level 1 (Surface):** #1E1E1E - Used for cards, feed items, and navigation bars. 
3. **Level 2 (Overlay):** #2C2C2C - Used for hover states, tooltips, and modal dialogs.

A subtle **1px Low-Contrast Outline** (#FFFFFF15) is applied to all Level 1 surfaces to define boundaries against the dark background. This replaces shadows, which often become "muddy" in dark mode UI.

## Shapes
We use a **Soft** shape language (roundedness: 1). This provides a professional and modern look that isn't overly playful. 

- **Base Components:** 0.25rem (4px) corner radius for buttons and input fields.
- **Containers:** 0.5rem (8px) corner radius for cards and modal windows.
- **Avatars:** Circular (full-round) to distinguish people and profiles from data objects.

## Components

### Buttons
- **Primary:** Solid #008148 background with White text. High-contrast and authoritative.
- **Secondary:** Solid #F26522 background. Used for conversion points like "Marketplace Purchase" or "Join Group."
- **Ghost:** Transparent background with a 1px border of the brand color. Used for secondary actions in a list.

### Cards (Agricultural Social Context)
- **Feed Card:** Uses Surface Level 1. Includes a header for user info, a content area for text/images, and a footer for social actions (Seed/Share/Comment).
- **Data Card:** Displays sensor data or crop status. Uses the primary green as a subtle left-border accent to denote "Healthy" status.

### Inputs & Selection
- **Text Fields:** Darker surface (#121212) with a 1px #FFFFFF30 border. On focus, the border changes to Primary Green.
- **Chips:** Used for "Crop Categories" (e.g., #Organic, #Wheat). Rounded-lg with a subtle green tint background.
- **Checkboxes:** Square with a 2px radius, filling with Primary Green when active.

### Specific Social Components
- **Weather Widget:** A specialized surface-level container with high-contrast typography for temperature and humidity.
- **Marketplace Item:** A card variant with a secondary orange badge for "Price" to ensure it stands out in a dense grid.