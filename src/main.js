const INCIDENT_STORAGE_KEY = "hawkins_incidents_v1";

const incidentListEl = document.getElementById("incidentList");
const sortToggleEl = document.getElementById("sortToggle");
const incidentForm = document.getElementById("incidentForm");
const confirmationEl = document.getElementById("confirmation");
const clockEl = document.getElementById("clock");
const threatValueEl = document.getElementById("threatValue");
const meterFillEl = document.getElementById("meterFill");
const meterMarkerEl = document.getElementById("meterMarker");
const breachWarningEl = document.getElementById("breachWarning");
const modeLabelEl = document.getElementById("modeLabel");

const detailTitleEl = document.getElementById("detailTitle");
const detailOfficerEl = document.getElementById("detailOfficer");
const detailStatusThreatEl = document.getElementById("detailStatusThreat");
const detailDescriptionEl = document.getElementById("detailDescription");
const detailTagsEl = document.getElementById("detailTags");
const detailActionEl = document.getElementById("detailAction");
const detailMetaEl = document.getElementById("detailMeta");

const titleInput = document.getElementById("titleInput");

let incidents = [];
let activeIncidentId = null;
let threatFilter = "All";
let statusFilter = null;
let sortDirection = "desc";

function seedIncidents() {
  return [
    {
      id: "i1",
      title: "Unscheduled power grid spike near forest perimeter",
      location: "Mirkwood Forest Access Road",
      threat: "Medium",
      status: "Investigating",
      officer: "Chief Hopper",
      description:
        "Multiple residents reported synchronized power flickers and radio static near the forest perimeter. Patrol units detected brief electromagnetic interference on band 3, followed by a sudden temperature drop of 7°F over 3 minutes.",
      tags: ["Power anomaly", "EM interference", "Civilians unaffected"],
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
    },
    {
      id: "i2",
      title: "Structural breach signatures beneath laboratory sub-levels",
      location: "Hawkins National Laboratory - Sublevel C",
      threat: "Critical",
      status: "Open",
      officer: "Dr. Owens",
      description:
        "Sensors flagged repeating seismic micro-spikes centered below decommissioned test chambers. Infrared sweeps show pockets of air significantly colder than surrounding concrete, forming a ring pattern consistent with prior breach events.",
      tags: [
        "Dimensional stress",
        "Seismic irregularity",
        "High containment risk",
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 1.8,
    },
    {
      id: "i3",
      title: "Missing persons cluster near abandoned rail yard",
      location: "East Hawkins Rail Yard",
      threat: "Critical",
      status: "Investigating",
      officer: "Hawkins PD",
      description:
        "Three separate missing person reports within 24 hours, all last seen traveling along the same access road. Patrol discovered elongated shadow impressions on pavement with no corresponding light source. Ambient sound levels drop significantly near loading bay 4.",
      tags: ["Missing persons", "Acoustic anomaly", "Night-time activity"],
      createdAt: Date.now() - 1000 * 60 * 60 * 8,
    },
    {
      id: "i4",
      title: "Nocturnal screeching and claw scoring on water tower",
      location: "Sattler Water Tower",
      threat: "Medium",
      status: "Open",
      officer: "Deputy Powell",
      description:
        "Residents reported metallic screeching echoing between 01:00–01:15. Inspection revealed fresh, parallel scoring marks 20 feet above the main ladder access. No known equipment or vehicles were logged in the vicinity.",
      tags: ["Unknown lifeform", "Acoustic anomaly"],
      createdAt: Date.now() - 1000 * 60 * 60 * 20,
    },
    {
      id: "i5",
      title: "Localized static haze over cornfields",
      location: "Hargrove Farm Perimeter",
      threat: "Low",
      status: "Contained",
      officer: "Rural Patrol Unit",
      description:
        "A faint, flickering haze was observed hovering above the northern crop line. Small animals avoided the field boundary during the event. Haze dissipated after 9 minutes with no visible residue.",
      tags: ["Visual anomaly", "Short duration", "Low immediate risk"],
      createdAt: Date.now() - 1000 * 60 * 60 * 36,
    },
  ];
}

function loadIncidents() {
  try {
    const stored = localStorage.getItem(INCIDENT_STORAGE_KEY);
    if (!stored) {
      incidents = seedIncidents();
      saveIncidents();
    } else {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) {
        incidents = parsed;
      } else {
        incidents = seedIncidents();
      }
    }
  } catch (e) {
    incidents = seedIncidents();
  }
}

function saveIncidents() {
  try {
    localStorage.setItem(INCIDENT_STORAGE_KEY, JSON.stringify(incidents));
  } catch (e) {}
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    }) +
    " " +
    d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function updateClock() {
  const now = new Date();
  const formatted = now.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  clockEl.textContent = formatted.toUpperCase();
}

function matchesFilters(incident) {
  if (threatFilter !== "All" && incident.threat !== threatFilter) {
    return false;
  }
  if (statusFilter && incident.status !== statusFilter) {
    return false;
  }
  return true;
}

function sortIncidents(list) {
  return list.slice().sort((a, b) => {
    return sortDirection === "desc"
      ? b.createdAt - a.createdAt
      : a.createdAt - b.createdAt;
  });
}

function renderIncidents() {
  const filtered = sortIncidents(incidents).filter(matchesFilters);
  incidentListEl.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.style.padding = "0.6rem 0.4rem";
    empty.style.fontSize = "0.75rem";
    empty.style.color = "#9ca3c5";
    empty.textContent = "No incidents match the current filters.";
    incidentListEl.appendChild(empty);
    updateThreatMeter();
    return;
  }

  filtered.forEach((incident) => {
    const row = document.createElement("div");
    row.className = "incident-row";
    row.dataset.id = incident.id;
    row.dataset.threat = incident.threat;

    if (incident.id === activeIncidentId) {
      row.classList.add("active");
    }

    row.innerHTML = `
      <div class="incident-title">${incident.title}</div>
      <div>
        <span class="pill threat-${incident.threat.toLowerCase()}">
          ${incident.threat}
        </span>
      </div>
      <div>
        <span class="pill status-${incident.status.toLowerCase()}">
          ${incident.status}
        </span>
      </div>
      <div style="font-size: 0.72rem; color: var(--muted);">
        ${incident.location}
      </div>
      <div class="timestamp">
        ${formatTimestamp(incident.createdAt)}
      </div>
    `;

    row.addEventListener("click", () => {
      activeIncidentId = incident.id;
      renderIncidents();
      renderDetail(incident);
    });

    incidentListEl.appendChild(row);
  });

  updateThreatMeter();
}

function autoTags(incident) {
  const tags = new Set(incident.tags || []);
  if (incident.threat === "Critical") {
    tags.add("High priority");
    tags.add("Reality breach risk");
  }
  if (incident.status === "Open") {
    tags.add("Immediate review");
  }
  if (/missing/i.test(incident.title + incident.description)) {
    tags.add("Civilian impact");
  }
  return Array.from(tags);
}

function suggestedAction(incident) {
  if (incident.threat === "Critical") {
    return "Deploy containment units, restrict civilian access within a 3-mile radius, and maintain continuous monitoring until anomaly stabilizes.";
  }
  if (incident.threat === "Medium") {
    return "Assign dedicated patrol, capture environmental telemetry, and schedule follow-up sweep within the next 6 hours.";
  }
  return "Log observations, collect resident statements, and flag area for low-frequency monitoring.";
}

function renderDetail(incident) {
  if (!incident) {
    detailTitleEl.textContent = "Select an incident from the feed";
    detailOfficerEl.textContent = "—";
    detailStatusThreatEl.textContent = "—";
    detailDescriptionEl.textContent =
      "Use the left-hand feed to open a classified incident file. Details will populate here, including observed anomalies, civilian reports, and recommended next steps.";
    detailTagsEl.innerHTML = "";
    detailActionEl.innerHTML =
      '<span class="action-label">Recommended Action</span><span>Await incident selection to view operational directives.</span>';
    detailMetaEl.textContent = "No incident selected.";
    return;
  }

  detailTitleEl.textContent = incident.title;
  detailOfficerEl.textContent = incident.officer || "Unassigned";
  detailStatusThreatEl.textContent = `${incident.status} \u00b7 ${incident.threat}`;
  detailDescriptionEl.textContent =
    incident.description || "No description provided.";

  const tags = autoTags(incident);
  detailTagsEl.innerHTML = "";
  tags.forEach((tag) => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = tag;
    detailTagsEl.appendChild(el);
  });

  detailActionEl.innerHTML = `
    <span class="action-label">Recommended Action</span>
    <span>${suggestedAction(incident)}</span>
  `;

  detailMetaEl.textContent = `Logged ${formatTimestamp(
    incident.createdAt
  )} \u00b7 ${incident.location}`;
}

function updateThreatMeter() {
  if (!incidents.length) {
    threatValueEl.textContent = "LOW";
    meterFillEl.style.width = "20%";
    meterMarkerEl.style.left = "20%";
    breachWarningEl.style.display = "none";
    return;
  }

  const weights = { Low: 1, Medium: 3, Critical: 7 };
  const totalWeight = incidents.reduce(
    (sum, inc) => sum + (weights[inc.threat] || 1),
    0
  );
  const maxPossible = incidents.length * weights["Critical"];
  const ratio = maxPossible ? totalWeight / maxPossible : 0;
  const percent = 20 + ratio * 70;

  meterFillEl.style.width = `${percent}%`;
  meterMarkerEl.style.left = `${percent}%`;

  let label = "LOW";
  if (ratio > 0.35 && ratio <= 0.7) {
    label = "MEDIUM";
  } else if (ratio > 0.7) {
    label = "CRITICAL";
  }
  threatValueEl.textContent = label;

  breachWarningEl.style.display = ratio > 0.7 ? "flex" : "none";
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(incidentForm);
  const now = Date.now();
  const incident = {
    id: "i" + now.toString(36),
    title: (formData.get("title") || "").toString().trim(),
    location: (formData.get("location") || "").toString().trim(),
    threat: formData.get("threat") || "Medium",
    status: formData.get("status") || "Open",
    officer: (formData.get("officer") || "").toString().trim(),
    description: (formData.get("description") || "").toString().trim(),
    tags: [],
    createdAt: now,
  };

  incidents.push(incident);
  saveIncidents();
  activeIncidentId = incident.id;
  renderIncidents();
  renderDetail(incident);

  incidentForm.reset();
  document.getElementById("threatInput").value = incident.threat;
  document.getElementById("statusInput").value = incident.status;

  confirmationEl.classList.add("visible");
  setTimeout(() => {
    confirmationEl.classList.remove("visible");
  }, 1600);
}

function initFilters() {
  const chips = Array.from(document.querySelectorAll(".chip"));
  chips.forEach((chip) => {
    const threat = chip.dataset.threatFilter;
    const status = chip.dataset.statusFilter;

    if (!threat && !status && chip !== sortToggleEl) {
      return;
    }

    chip.addEventListener("click", () => {
      if (threat) {
        if (threatFilter === threat) {
          threatFilter = "All";
        } else {
          threatFilter = threat;
        }
        chips
          .filter((c) => c.dataset.threatFilter)
          .forEach((c) => c.classList.toggle("active", false));
        const match = chips.find((c) => c.dataset.threatFilter === threatFilter);
        if (match) match.classList.add("active");
      }
      if (status) {
        statusFilter = statusFilter === status ? null : status;
        chips
          .filter((c) => c.dataset.statusFilter)
          .forEach((c) =>
            c.classList.toggle(
              "active",
              c.dataset.statusFilter === statusFilter
            )
          );
      }
      renderIncidents();
    });
  });

  sortToggleEl.addEventListener("click", () => {
    sortDirection = sortDirection === "desc" ? "asc" : "desc";
    sortToggleEl.dataset.sort = sortDirection;
    sortToggleEl.textContent =
      sortDirection === "desc" ? "Latest ⬇" : "Oldest ⬆";
    renderIncidents();
  });
}

function initKeyboard() {
  document.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();

    if (key === "u") {
      document.body.classList.toggle("upside-down");
      const enabled = document.body.classList.contains("upside-down");
      modeLabelEl.textContent = enabled
        ? "Upside Down Mode \u00b7 Visual Distortion Active"
        : "Standard Operations Grid";
    } else if (key === "n") {
      titleInput.focus();
    } else if (key === "s") {
      sortToggleEl.click();
    }
  });
}

function init() {
  loadIncidents();
  initFilters();
  initKeyboard();
  renderIncidents();
  renderDetail(null);
  updateClock();
  setInterval(updateClock, 1000);

  incidentForm.addEventListener("submit", handleFormSubmit);
}

init();


