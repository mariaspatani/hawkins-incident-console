## Hawkins Incident Command Console — Design Notes

This document captures rough design intent for the UI and interaction model.  
It is not a spec; treat it as guidance for evolving the console.


### Visual Tone
- **Atmosphere**: Low‑light emergency control room, with subtle sci‑fi elements.
- **Color**: Deep blues and near‑black backgrounds with red/orange alert accents.
- **Feel**: Operational and cinematic, not playful.

### Layout
- **Three‑column grid on desktop**:
  - Left: Incident feed and filters.
  - Center: Classified incident details panel.
  - Right: Global threat meter + new‑incident form.
- **Responsive behavior**:
  - On tablets, details may span full width below the list.
  - On phones, panels stack vertically in a logical order: list → threat meter → details → form.

### Interactions
- **Incident selection**:
  - Clicking an incident highlights it and opens a detailed classified view.
  - Status and threat level are visually reinforced via colored pills and subtle glow.
- **Filtering & sorting**:
  - Chips for Threat Level (Low / Medium / Critical) and Status (Open / Investigating / Contained).
  - Sort toggle: Latest / Oldest.
- **Upside Down Mode**:
  - Toggled via keyboard (`U`).
  - Darker palette, increased contrast, slight distortion/glow on high‑threat incidents.
  - Purely visual immersion; does not change stored data.

### Threat Level Meter
- Aggregates incident severity to show an overall Hawkins danger score.
- Ranges from **Low → Medium → Critical**, with:
  - Color‑blended bar.
  - Marker showing current level.
  - “Reality Breach Imminent” banner when critical threshold is exceeded.

### Incident Model (Client‑Side)
- Each incident includes:
  - `title`
  - `location`
  - `threat` (Low / Medium / Critical)
  - `status` (Open / Investigating / Contained)
  - `officer` (optional)
  - `description`
  - `createdAt` timestamp
- Optional auto‑generated tags help classify incidents (e.g. “Power anomaly”, “Civilian impact”).

### Persistence
- Data is client‑side only.
- LocalStorage can be used to keep incidents between refreshes.

### Accessibility & UX
- Clear focus states on interactive elements.
- High contrast for critical alerts and important text.
- Descriptive text in the details panel so the UI is understandable even with no incidents selected.


