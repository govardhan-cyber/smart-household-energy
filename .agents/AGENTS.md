# Workspace Rules & Version History

## Saved Versions

- **Version 13**: Points to git tag `version-13`.
  - **Features**:
    - **Premium Footer Layout:** Integrated a full-width Final CTA gradient banner, animated stat count-up bridge cards (Homes Audited, AI Accuracy, kWh Analysed, Costs Predicted), a 5-column brand links grid, platform trust badges (SSL, Privacy, AI, Eco, DISCOM), and inline SVG social links.
  - **Recovery Instruction**:
    - If the user says "recover version 13", run `git checkout version-13`.

- **Version 12**: Points to git tag `version-12`.
  - **Features**:
    - **Dual Lighting Source Split:** Separated LED Bulbs and conventional Tube Lights into two first-class, independent selectable appliances. Added custom wattage presets (9W/12W/15W for LEDs; 18W T5/40W Conventional for Tube Lights) and separate runtime configurations.
    - **Concurrent Savings Simulation & Audits:** Upgraded the real-time consumption dashboard simulator and advisory engines to calculate and display potential savings for both lighting types concurrently. Added separate action item recommendations for bulb upgrades and T5 LED tube replacements.
    - **Asymmetrical Glassmorphic Layout:** Redesigned the footer links grid by wrapping it in a parent glassmorphism card container. Added a layered, inner glass brand-sync status widget card on the left side, balanced against offset floating link columns on the right.
    - **Micro-Hover Navigation Transitions:** Integrated interactive slide-up and translate animations on footer links and active glows on hover.
  - **Recovery Instruction**:
    - If the user says "recover version 12", run `git checkout version-12`.

- **Version 11**: Points to git tag `version-11`.
  - **Features**:
    - **Clear Glassmorphic Card:** Upgraded the `BiggestConsumerCard` to a highly translucent, clear glass pane by removing all backdrop blur properties. Integrated a dual concentric ring progress dial, specular reflective gloss sheen, top edge highlights, and high-contrast typography.
    - **Premium Light Mode Background:** Transitioned the root container from flat gray to a gradient backdrop (`from-slate-50 via-slate-100/70 to-blue-50/30`) with three floating animated mesh gradient glows (indigo, cyan, and emerald) in the viewport corners and enhanced mouse spotlight cursor tracking.
    - **Universal Dark Mode Legibility Fixes:**
      - Styled native select options and optgroups globally with specific dark backgrounds and white text.
      - Resolved the harsh solid white background on the Estimated Monthly Usage badge by fixing the invalid tailwind class from `blue-955` to `blue-950`.
      - Configured Recharts chart tooltips to dynamically style backgrounds and text color using `activeTheme` to resolve white text on white background issues.
  - **Recovery Instruction**:
    - If the user says "recover version 11", run `git checkout version-11`.
