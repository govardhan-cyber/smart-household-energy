# Workspace Rules & Version History

## Saved Versions

- **Version 7**: Points to git tag `version-7` (Commit `e52dc92` / updated commit).
  - **Features**:
    - Curved Help Center FAQ Hero Header banner.
    - Responsive 2-column FAQ layout with centered glassmorphic filter switcher and centered results count.
    - Symmetric/centered Biggest Energy Consumer Card (View Details button and MoreVertical three dots menu removed, dial dial gauge enlarged).
    - Sticky Dashboard sidebars and premium dark mode support.
  - **Recovery Instruction**:
    - If the user says "recover version 7", run `git checkout version-7`.

- **Version 8**: Points to git tag `version-8` (Commit `d2ea8e1`).
  - **Features**:
    - High-fidelity print overrides for PDF reports (dashboards, history logs, and bill analysis).
    - Flex layout flattening during printing to prevent container height collapses and empty page rendering.
    - Automatic exclusion of the global ThreeBackground canvas and animated SVGs during print, resolving preview load lag and background overlay issues.
    - Successful deployment to Firebase Hosting on the Spark plan by isolating hosting resource uploads.
  - **Recovery Instruction**:
    - If the user says "recover version 8", run `git checkout version-8`.

- **Version 9**: Points to git tag `version-9` (Commit `bcf07bc`).
  - **Features**:
    - Added glassmorphic styling, glowing gradient border, and spring scaling/wiggle animations to the chatbot container and trigger.
    - Replaced the chatbot logo with a custom-generated friendly 3D robot avatar matching reference styling.
    - Updated chatbot instructions and greeting to explicitly state its access to context-aware records, bills, and simulations.
    - Removed the harsh black border from the home page recommendation box in favor of a soft glass backdrop.
  - **Recovery Instruction**:
    - If the user says "recover version 9", run `git checkout version-9`.

- **Version 10**: Points to git tag `version-10`.
  - **Features**:
    - Card hover lift animation simplified to clean CSS-only `translateY(-10px)` with `transition: transform/box-shadow/border-color 0.3s ease` — removed all Framer Motion `whileHover` from appliance tiles, recommendation items, and biggest consumer card.
    - Fixed card blinking caused by `transition: all` interfering with Framer Motion opacity entrance animations.
    - Home page "How It Works" step circles upgraded from plain bordered boxes to rich gradient-filled circles with glow halos (blue, green, teal per step).
    - Home page feature cards now have a subtle tinted gradient at rest (not just on hover) giving immediate visual personality.
    - Home page Testimonials section gets ambient radial glow orbs and a gradient background for depth.
    - Hero primary CTA button ("Create free account") gets a `btn-shimmer` sweep animation via CSS keyframe.
    - Dashboard wizard stepper replaces emoji icons (⚡📅📊🌿) with proper Lucide React icons (`Zap`, `SlidersHorizontal`, `BarChart3`, `Leaf`) for full UI consistency.
    - Added `shimmer-sweep` keyframe + `.btn-shimmer` and `.section-ambient-glow` CSS utilities to `index.css`.
    - Pre-existing unused TypeScript variables (`container`, `item`) in `PremiumDashboard.tsx` cleaned up.
  - **Recovery Instruction**:
    - If the user says "recover version 10", run `git checkout version-10`.
