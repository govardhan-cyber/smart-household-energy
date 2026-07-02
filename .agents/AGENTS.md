# Workspace Rules & Version History

## Saved Versions

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
