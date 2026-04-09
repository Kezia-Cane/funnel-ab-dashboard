# Design System Document: The Precision-Layered Dashboard

## 1. Overview & Creative North Star: "The Digital Architect"
This design system is built to move beyond the "standard SaaS" aesthetic into a realm of high-end, editorial precision. Our Creative North Star is **The Digital Architect**. 

Instead of treating the dashboard as a flat canvas of boxes and lines, we treat it as a curated architectural space. We lean into **Soft Minimalism**, where the UI feels lightweight yet authoritative. We break the "template" look by utilizing intentional asymmetry—placing high-density data visualizations against expansive, airy whitespace. The goal is to evoke the feeling of a premium physical workspace: intentional, layered, and surgically clean.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in a sophisticated range of cool grays and deep indigos. We do not use color merely for decoration; we use it to define physics and focus.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or container definition. 
Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` section sitting on a `surface` background provides all the structural definition required. If a container "needs" a line, it actually needs more whitespace or a subtle shift in tonal value.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested, physical layers.
- **Base Layer:** `surface` (#faf8ff) or `background` (#faf8ff).
- **Secondary Tier:** `surface_container_low` (#f2f3ff) for sidebar or secondary navigation.
- **Action Tier:** `surface_container_lowest` (#ffffff) for primary cards and content modules to make them "pop" against the background.
- **Nested Tier:** Use `surface_container_high` (#e2e7ff) for small, inner-nested elements like code snippets or tag containers.

### The "Glass & Gradient" Rule
To achieve the premium feel of Stripe or Vercel:
- **Glassmorphism:** Use `surface` colors at 80% opacity with a `backdrop-blur: 24px` for floating headers or navigation bars.
- **Signature Textures:** For primary CTAs, do not use flat hex codes. Apply a subtle linear gradient from `primary` (#3525cd) to `primary_container` (#4f46e5) at a 135-degree angle. This adds a "jewel-tone" depth that feels high-end.

---

## 3. Typography: Editorial Authority
We utilize a dual-typeface system to create an editorial feel that distinguishes brand moments from functional data.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-premium" feel. Use `display_lg` to `headline_sm` for page titles and high-level metrics.
*   **Interface & Body (Inter):** Chosen for its unparalleled legibility at small sizes. Use `title_md` down to `label_sm` for functional UI elements, navigation, and dense data tables.

**Hierarchy Strategy:** 
Maintain a "Low-High" contrast. Use `on_surface_variant` (#464555) for secondary labels to create a soft gray wash, making the `on_surface` (#131b2e) primary text feel exceptionally sharp and authoritative.

---

## 4. Elevation & Depth: Tonal Layering
Traditional structural lines are replaced by a system of "Natural Lift."

### The Layering Principle
Depth is achieved by "stacking" surface tokens. Place a `surface_container_lowest` card on a `surface_container_low` section to create a soft, natural lift without a single pixel of shadow.

### Ambient Shadows
When a "floating" effect is required (e.g., Modals, Popovers):
- **Blur:** 32px to 64px.
- **Opacity:** 4%–8%.
- **Color:** Use a tinted shadow based on `on_surface` (#131b2e) rather than pure black. This mimics natural light reflecting off the surface.

### The "Ghost Border" Fallback
If accessibility requirements demand a border, use the **Ghost Border**: The `outline_variant` (#c7c4d8) token at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Minimalist Primitives

### Buttons
- **Primary:** Gradient (`primary` to `primary_container`), `xl` (1.5rem) rounded corners, white text.
- **Secondary:** `surface_container_high` background with `primary` text. No border.
- **Tertiary:** Ghost style. No background; `primary` text. Use only for low-priority actions.

### Cards & Lists
- **Rule:** Forbid the use of divider lines.
- **Separation:** Use vertical whitespace (referencing the Tailwind-style scale, e.g., `py-8`) or a subtle background shift to `surface_container_low`.
- **Rounding:** All cards must use `2xl` (1.5rem) corners to maintain the "Soft Minimalist" aesthetic.

### Input Fields
- **Background:** `surface_container_lowest` (#ffffff).
- **State:** On focus, transition the background to `surface_bright` and apply a 2px "Ghost Border" using the `primary` color at 30% opacity.

### A/B Testing Specific Components
- **The "Confidence Metric" Chip:** Use `secondary_container` with `on_secondary_container` text. This provides a distinct, "mellowed" purple that feels trustworthy but distinct from the primary action.
- **Variant Splitters:** Use wide, `2xl` rounded containers with asymmetric padding (e.g., `pl-12 pr-6`) to create a modern, editorial look for comparing "A" vs "B" results.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace Whitespace:** If an element feels "stuck," don't add a border; add 16px of padding.
- **Use "Optical Alignment":** In dashboards, data often feels heavy. Use `label_sm` for metadata but increase the `letter-spacing` (tracking) by 2-5% to maintain premium airiness.
- **Layer for Importance:** The most important data lives on the "lightest" surface (`surface_container_lowest`).

### Don’t:
- **Don't use 100% black:** Never use #000000. Use `on_surface` (#131b2e) for all high-contrast needs.
- **Don't use "Default" Shadows:** Avoid the standard `box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1)`. It looks "Bootstrap-era." Use our diffused Ambient Shadows.
- **Don't crowd the corners:** Even with `2xl` rounding, ensure content doesn't "hug" the curve. Use generous internal padding (`p-6` or `p-8`).

---