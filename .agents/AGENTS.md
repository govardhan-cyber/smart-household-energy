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

