const STORAGE_KEY = "avent-performance-data-v1";
const READONLY_PASSWORD = "eduneo2026";
const EDIT_PASSWORD = "mdp";
const ADMIN_ROLE_KEY = "admin-role-mode";
const APP_VERSION = "v2026.05.13-1";
const CALENDAR_GRID_ROWS = 10;
const CALENDAR_GRID_COLS = 9;
const layoutColumnsByCount = {
  1: [5],
  2: [4, 6],
  3: [4, 5, 6],
  4: [3, 4, 6, 7],
  5: [3, 4, 5, 6, 7]
};

const elements = {
  adminShell: document.querySelector(".admin-shell"),
  adminAppVersion: document.querySelector("#admin-app-version"),
  adminRoleSelect: document.querySelector("#admin-role-select"),
  readonlyBanner: document.querySelector("#readonly-banner"),
  datePicker: document.querySelector("#date-picker"),
  dailyObjective: document.querySelector("#daily-objective"),
  dailySales: document.querySelector("#daily-sales"),
  updateDailyBtn: document.querySelector("#update-daily-btn"),
  updateMessage: document.querySelector("#update-message"),
  directionMessage: document.querySelector("#direction-message"),
  flashAnnouncement: document.querySelector("#flash-announcement"),
  activeDayInput: document.querySelector("#active-day-input"),
  logoUrlInput: document.querySelector("#logo-url-input"),
  logoFileInput: document.querySelector("#logo-file-input"),
  logoPreviewWrap: document.querySelector("#logo-preview-wrap"),
  logoPreview: document.querySelector("#logo-preview"),
  countdownTargetInput: document.querySelector("#countdown-target-input"),
  fontTitleSelect: document.querySelector("#font-title-select"),
  fontBodySelect: document.querySelector("#font-body-select"),
  showRankingAvatarsToggle: document.querySelector("#show-ranking-avatars-toggle"),
  themeGoldInput: document.querySelector("#theme-gold-input"),
  themeGreenInput: document.querySelector("#theme-green-input"),
  themeRedInput: document.querySelector("#theme-red-input"),
  themeNightInput: document.querySelector("#theme-night-input"),
  themeSnowInput: document.querySelector("#theme-snow-input"),
  saveMessagesBtn: document.querySelector("#save-messages-btn"),
  rankingModeToggle: document.querySelector("#ranking-mode-toggle"),
  rankingSortMode: document.querySelector("#ranking-sort-mode"),
  rankingPreview: document.querySelector("#ranking-preview"),
  addRankingEntryBtn: document.querySelector("#add-ranking-entry-btn"),
  rankingImportBtn: document.querySelector("#ranking-import-btn"),
  rankingImportFile: document.querySelector("#ranking-import-file"),
  saveRankingConfigBtn: document.querySelector("#save-ranking-config-btn"),
  rankingJumpSelect: document.querySelector("#ranking-jump-select"),
  rankingExportBtn: document.querySelector("#ranking-export-btn"),
  rankingExportXlsBtn: document.querySelector("#ranking-export-xls-btn"),
  rankingSearchInput: document.querySelector("#ranking-search-input"),
  rankingPointsFilter: document.querySelector("#ranking-points-filter"),
  rankingPageSize: document.querySelector("#ranking-page-size"),
  rankingPrevPageBtn: document.querySelector("#ranking-prev-page-btn"),
  rankingNextPageBtn: document.querySelector("#ranking-next-page-btn"),
  rankingPageLabel: document.querySelector("#ranking-page-label"),
  rankingTbody: document.querySelector("#ranking-tbody"),
  adminCalendarPreview: document.querySelector("#admin-calendar-preview"),
  layoutResetBtn: document.querySelector("#layout-reset-btn"),
  layoutSaveBtn: document.querySelector("#layout-save-btn"),
  fullscreenBtn: document.querySelector("#fullscreen-btn"),
  clearAuditBtn: document.querySelector("#clear-audit-btn"),
  auditLogList: document.querySelector("#audit-log-list"),
  rankToast: document.querySelector("#rank-toast"),
  casesTbody: document.querySelector("#cases-tbody"),
  statOpened: document.querySelector("#stat-opened"),
  statObjective: document.querySelector("#stat-objective"),
  statSales: document.querySelector("#stat-sales"),
  statRate: document.querySelector("#stat-rate"),
  statsChart: document.querySelector("#stats-chart"),
  logoutBtn: document.querySelector("#logout-btn"),
  editModal: document.querySelector("#edit-case-modal"),
  closeModalBtn: document.querySelector(".close-modal"),
  editCaseDay: document.querySelector("#edit-case-day"),
  editObjective: document.querySelector("#edit-objective"),
  editSales: document.querySelector("#edit-sales"),
  editTitle: document.querySelector("#edit-title"),
  editDescription: document.querySelector("#edit-description"),
  editCongrats: document.querySelector("#edit-congrats"),
  editIcon: document.querySelector("#edit-icon"),
  editLinkLabel: document.querySelector("#edit-link-label"),
  editLinkUrl: document.querySelector("#edit-link-url"),
  editForceOpen: document.querySelector("#edit-force-open"),
  editForceClosed: document.querySelector("#edit-force-closed"),
  saveCaseBtn: document.querySelector("#save-case-btn"),
  closeModalXBtn: document.querySelector("#close-case-modal")
};

let appData = null;
let editingDayNumber = null;
let previousRanks = new Map();
let rankToastTimer = null;
let currentRankingPage = 1;
let selectedRankingId = "";
let draggedLayoutDay = null;

function getDefaultRankings() {
  return [
    { id: "r1", name: "Camille Martin", anonymousLabel: "Collaborateur 1", points: 128, sales: 56, icon: "🌟", avatarUrl: "" },
    { id: "r2", name: "Nicolas Leroy", anonymousLabel: "Collaborateur 2", points: 121, sales: 52, icon: "🏅", avatarUrl: "" },
    { id: "r3", name: "Sarah Dubois", anonymousLabel: "Collaborateur 3", points: 117, sales: 49, icon: "🎁", avatarUrl: "" },
    { id: "r4", name: "Antoine Petit", anonymousLabel: "Collaborateur 4", points: 111, sales: 45, icon: "🚀", avatarUrl: "" },
    { id: "r5", name: "Lea Bernard", anonymousLabel: "Collaborateur 5", points: 107, sales: 44, icon: "✨", avatarUrl: "" },
    { id: "r6", name: "Julien Moreau", anonymousLabel: "Collaborateur 6", points: 98, sales: 39, icon: "🎄", avatarUrl: "" }
  ];
}

function getDefaultThemeConfig() {
  return {
    gold: "#ffd700",
    green: "#1b4d2e",
    red: "#b22222",
    night: "#0d1b2a",
    snow: "#f8f8ff"
  };
}

function normalizeDay(day, index) {
  const nextDay = index + 1;
  return {
    ...day,
    day: Number(day?.day) || nextDay,
    date: day?.date || `2026-12-${String(nextDay).padStart(2, "0")}`,
    objective: Number(day?.objective) || 0,
    sales: Number(day?.sales) || 0,
    surpriseTitle: day?.surpriseTitle || `Surprise ${nextDay}`,
    surpriseDescription: day?.surpriseDescription || "",
    surpriseIcon: day?.surpriseIcon || "🎁",
    congratsMessage: day?.congratsMessage || `Bravo equipe, la case ${nextDay} est debloquee grace a votre energie.`,
    surpriseLinkLabel: day?.surpriseLinkLabel || "",
    surpriseLinkUrl: day?.surpriseLinkUrl || "",
    unlockedAt: day?.unlockedAt || null,
    forceClosed: Boolean(day?.forceClosed),
    forceOpen: Boolean(day?.forceOpen)
  };
}

function buildTreeOrder() {
  let next = 24;
  const rows = [];

  [1, 2, 3, 4, 5, 4, 3, 2].forEach((count) => {
    const row = [];
    for (let index = 0; index < count; index += 1) {
      row.push(next);
      next -= 1;
    }
    rows.push(row);
  });

  return rows;
}

function getDefaultCalendarLayout() {
  return buildTreeOrder().flatMap((rowDays, rowIndex) => {
    const cols = layoutColumnsByCount[rowDays.length] || [1, 2, 3, 4, 5];
    return rowDays.map((day, index) => ({
      day,
      row: rowIndex + 1,
      col: cols[index] || index + 1
    }));
  });
}

function normalizeCalendarLayout(layout) {
  const defaults = getDefaultCalendarLayout();
  const validPositions = new Map();
  const usedSlots = new Set();

  if (Array.isArray(layout)) {
    layout.forEach((item) => {
      const day = Number(item?.day);
      const row = Number(item?.row);
      const col = Number(item?.col);
      const slotKey = `${row}-${col}`;

      if (!Number.isInteger(day) || day < 1 || day > 24) return;
      if (!Number.isInteger(row) || row < 1 || row > CALENDAR_GRID_ROWS) return;
      if (!Number.isInteger(col) || col < 1 || col > CALENDAR_GRID_COLS) return;
      if (validPositions.has(day) || usedSlots.has(slotKey)) return;

      validPositions.set(day, { day, row, col });
      usedSlots.add(slotKey);
    });
  }

  defaults.forEach((item) => {
    const slotKey = `${item.row}-${item.col}`;
    if (!validPositions.has(item.day) && !usedSlots.has(slotKey)) {
      validPositions.set(item.day, item);
      usedSlots.add(slotKey);
    }
  });

  return Array.from(validPositions.values()).sort((a, b) => a.day - b.day);
}

function getTodayInEvent() {
  const now = new Date();
  if (now.getFullYear() === 2026 && now.getMonth() === 11) {
    return Math.min(24, Math.max(1, now.getDate()));
  }
  return 13;
}

function getCaseState(dayData, activeDay) {
  if (dayData.forceClosed) return "locked";
  if (dayData.forceOpen || dayData.sales >= dayData.objective) return "open";
  if (dayData.day === activeDay) return "in-progress";
  return "locked";
}

function normalizeData(data) {
  const normalized = data || {};
  normalized.config = normalized.config || {};
  normalized.config.calendarLayout = normalizeCalendarLayout(normalized.config.calendarLayout);
  normalized.config.rankingMode = normalized.config.rankingMode === "named" ? "named" : "anonymous";
  normalized.config.rankingSortMode = normalized.config.rankingSortMode === "manual" ? "manual" : "auto";
  normalized.config.countdownTarget = normalized.config.countdownTarget || "2026-12-24T00:00:00";
  normalized.config.fontTitle = normalized.config.fontTitle || "Mountains of Christmas";
  normalized.config.fontBody = normalized.config.fontBody || "Poppins";
  normalized.config.showRankingAvatars = Boolean(normalized.config.showRankingAvatars);
  normalized.config.theme = { ...getDefaultThemeConfig(), ...(normalized.config.theme || {}) };
  normalized.days = Array.isArray(normalized.days) && normalized.days.length === 24 ? normalized.days.map(normalizeDay) : [];
  normalized.auditLog = Array.isArray(normalized.auditLog) ? normalized.auditLog : [];

  if (!Array.isArray(normalized.rankings) || normalized.rankings.length === 0) {
    normalized.rankings = getDefaultRankings();
  } else {
    normalized.rankings = normalized.rankings.map((entry, index) => ({
      id: entry.id || `r${index + 1}`,
      name: entry.name || `Collaborateur ${index + 1}`,
      anonymousLabel: entry.anonymousLabel || `Collaborateur ${index + 1}`,
      points: Number(entry.points) || 0,
      sales: Number(entry.sales) || 0,
      icon: entry.icon || "🎄",
      avatarUrl: entry.avatarUrl || ""
    }));
  }

  return normalized;
}

function checkAuth() {
  const isAuth = sessionStorage.getItem("admin-auth");
  if (!isAuth) {
    const password = prompt("Mot de passe gestionnaire :");
    if (password === EDIT_PASSWORD) {
      sessionStorage.setItem(ADMIN_ROLE_KEY, "admin");
    } else if (password === READONLY_PASSWORD) {
      sessionStorage.setItem(ADMIN_ROLE_KEY, "readonly");
    } else {
      alert("Mot de passe incorrect.");
      window.location.href = "index.html";
      return false;
    }
    sessionStorage.setItem("admin-auth", "true");
  }
  return true;
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    alert("Pas de donnees disponibles.");
    window.location.href = "index.html";
    return null;
  }

  try {
    appData = normalizeData(JSON.parse(raw));
    if (!appData.days || appData.days.length !== 24) {
      throw new Error("invalid data");
    }
    saveData();
    return appData;
  } catch {
    alert("Erreur de chargement des donnees.");
    window.location.href = "index.html";
    return null;
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function isReadOnlyMode() {
  return sessionStorage.getItem(ADMIN_ROLE_KEY) === "readonly";
}

function getPageSize() {
  return Math.max(1, parseInt(elements.rankingPageSize?.value || "10", 10) || 10);
}

function parseDelimitedLine(line, delimiter) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseDelimitedRows(text) {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const delimiter = lines[0].includes(";") ? ";" : lines[0].includes("\t") ? "\t" : ",";
  return lines.map((line) => parseDelimitedLine(line, delimiter));
}

function parseHtmlTableRows(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  return [...doc.querySelectorAll("tr")].map((row) =>
    [...row.querySelectorAll("th,td")].map((cell) => cell.textContent.trim())
  ).filter((row) => row.length);
}

function buildRankingFromRows(rows) {
  if (!rows.length) return [];

  const normalizedHeaders = rows[0].map((header) => header.toLowerCase());
  const hasHeader = normalizedHeaders.some((header) =>
    ["nom", "alias", "points", "ventes", "icone", "icône"].some((token) => header.includes(token))
  );
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const headerIndex = (matcher, fallback) => {
    const idx = normalizedHeaders.findIndex((header) => matcher.some((token) => header.includes(token)));
    return idx >= 0 ? idx : fallback;
  };

  const nameIndex = headerIndex(["nom"], 1);
  const aliasIndex = headerIndex(["alias", "anonyme"], 2);
  const pointsIndex = headerIndex(["point"], 3);
  const salesIndex = headerIndex(["vente"], 4);
  const iconIndex = headerIndex(["icone", "icône", "emoji"], 5);
  const avatarIndex = headerIndex(["avatar", "photo", "image"], 6);

  return dataRows
    .filter((row) => row.some((cell) => cell && cell.trim()))
    .map((row, index) => ({
      id: `r${Date.now()}-${index}`,
      name: row[nameIndex] || `Collaborateur ${index + 1}`,
      anonymousLabel: row[aliasIndex] || `Collaborateur ${index + 1}`,
      points: Math.max(0, parseInt(row[pointsIndex] || "0", 10) || 0),
      sales: Math.max(0, parseInt(row[salesIndex] || "0", 10) || 0),
      icon: (row[iconIndex] || "🎄").slice(0, 2),
      avatarUrl: row[avatarIndex] || ""
    }));
}

function getImportedRowsFromFile(fileName, text) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".xls") || text.includes("<table")) {
    return parseHtmlTableRows(text);
  }

  if (lowerName.endsWith(".xlsx")) {
    throw new Error("Le format .xlsx n'est pas pris en charge en local. Exporte le fichier Excel en CSV ou XLS puis reimporte-le.");
  }

  return parseDelimitedRows(text);
}

function getFilteredRankingEntries(rankings) {
  const search = (elements.rankingSearchInput.value || "").trim().toLowerCase();
  const minPoints = Math.max(0, parseInt(elements.rankingPointsFilter.value, 10) || 0);

  return rankings.filter((entry) => {
    const haystack = `${entry.name} ${entry.anonymousLabel} ${entry.icon}`.toLowerCase();
    return (!search || haystack.includes(search)) && (Number(entry.points) || 0) >= minPoints;
  });
}

function updateRankingPagination(totalItems) {
  const pageSize = getPageSize();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  currentRankingPage = Math.min(Math.max(1, currentRankingPage), totalPages);

  elements.rankingPageLabel.textContent = `Page ${currentRankingPage} / ${totalPages}`;
  elements.rankingPrevPageBtn.disabled = currentRankingPage <= 1;
  elements.rankingNextPageBtn.disabled = currentRankingPage >= totalPages;
}

function applyRoleMode() {
  const readonly = isReadOnlyMode();
  elements.adminShell.classList.toggle("readonly", readonly);
  elements.readonlyBanner.hidden = !readonly;
  elements.adminRoleSelect.value = readonly ? "readonly" : "admin";

  const disabledTargets = [
    elements.dailySales,
    elements.updateDailyBtn,
    elements.directionMessage,
    elements.flashAnnouncement,
    elements.activeDayInput,
    elements.logoUrlInput,
    elements.logoFileInput,
    elements.countdownTargetInput,
    elements.fontTitleSelect,
    elements.fontBodySelect,
    elements.showRankingAvatarsToggle,
    elements.themeGoldInput,
    elements.themeGreenInput,
    elements.themeRedInput,
    elements.themeNightInput,
    elements.themeSnowInput,
    elements.saveMessagesBtn,
    elements.rankingModeToggle,
    elements.rankingSortMode,
    elements.addRankingEntryBtn,
    elements.rankingImportBtn,
    elements.saveRankingConfigBtn,
    elements.layoutResetBtn,
    elements.layoutSaveBtn,
    elements.clearAuditBtn,
    elements.saveCaseBtn,
    elements.editObjective,
    elements.editSales,
    elements.editTitle,
    elements.editDescription,
    elements.editCongrats,
    elements.editIcon,
    elements.editLinkLabel,
    elements.editLinkUrl,
    elements.editForceOpen,
    elements.editForceClosed
  ];

  disabledTargets.forEach((element) => {
    if (element) element.disabled = readonly;
  });

  [
    ...elements.rankingTbody.querySelectorAll("input"),
    ...elements.rankingTbody.querySelectorAll("button"),
    ...elements.casesTbody.querySelectorAll("button"),
    ...elements.adminCalendarPreview.querySelectorAll("button")
  ].forEach((element) => {
    element.disabled = readonly;
  });
}

function guardReadOnlyAction() {
  if (!isReadOnlyMode()) return false;
  showMessage("Mode lecture seule actif : cette action est desactivee.", true);
  return true;
}

function addAudit(action, details) {
  const entry = {
    id: `a${Date.now()}${Math.floor(Math.random() * 1000)}`,
    action,
    details,
    at: new Date().toISOString()
  };

  appData.auditLog.unshift(entry);
  appData.auditLog = appData.auditLog.slice(0, 200);
  saveData();
  renderAuditLog();
}

function renderAuditLog() {
  if (!elements.auditLogList) return;

  if (!appData.auditLog.length) {
    elements.auditLogList.innerHTML = '<div class="audit-item"><h4>Aucune action enregistrée</h4><p>Le journal se remplira automatiquement.</p></div>';
    return;
  }

  elements.auditLogList.innerHTML = appData.auditLog
    .map((item) => {
      const when = new Date(item.at).toLocaleString("fr-FR");
      return `
        <article class="audit-item">
          <h4>${escapeHtml(item.action)}</h4>
          <p>${escapeHtml(item.details)} · ${when}</p>
        </article>
      `;
    })
    .join("");
}

function percent(value, total) {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function getStateLabel(dayData) {
  if (dayData.forceClosed) return "🔒 Forcée fermée";
  if (dayData.forceOpen || dayData.sales >= dayData.objective) return "🎁 Ouverte";
  return "🔒 Fermée";
}

function renderCasesTable() {
  elements.casesTbody.innerHTML = "";

  appData.days.forEach((day) => {
    const tr = document.createElement("tr");

    const state = getStateLabel(day);

    tr.innerHTML = `
      <td>${day.day}</td>
      <td>${day.date}</td>
      <td>${day.objective}</td>
      <td>${day.sales}</td>
      <td><span class="state ${state.includes("Ouverte") ? "open" : "locked"}">${state}</span></td>
      <td>${day.surpriseIcon} ${day.surpriseTitle}</td>
      <td><button class="btn btn-edit" data-day="${day.day}">✏️ Éditer</button></td>
    `;

    tr.querySelector("button").addEventListener("click", () => openEditModal(day.day));
    elements.casesTbody.appendChild(tr);
  });

  applyRoleMode();
}

function swapLayoutPositions(firstDay, secondDay) {
  const first = appData.config.calendarLayout.find((item) => item.day === firstDay);
  const second = appData.config.calendarLayout.find((item) => item.day === secondDay);
  if (!first || !second) return;

  const next = { row: first.row, col: first.col };
  first.row = second.row;
  first.col = second.col;
  second.row = next.row;
  second.col = next.col;
}

function moveLayoutToEmpty(day, row, col) {
  const item = appData.config.calendarLayout.find((entry) => entry.day === day);
  if (!item) return;
  item.row = row;
  item.col = col;
}

function renderCalendarPreview() {
  if (!elements.adminCalendarPreview) return;

  elements.adminCalendarPreview.innerHTML = "";
  const activeDay = getTodayInEvent();
  appData.config.calendarLayout = normalizeCalendarLayout(appData.config.calendarLayout);
  const slotMap = new Map(appData.config.calendarLayout.map((item) => [`${item.row}-${item.col}`, item.day]));

  for (let row = 1; row <= CALENDAR_GRID_ROWS; row += 1) {
    for (let col = 1; col <= CALENDAR_GRID_COLS; col += 1) {
      const slot = document.createElement("div");
      slot.className = "layout-slot";
      slot.style.gridRow = String(row);
      slot.style.gridColumn = String(col);

      const dayNumber = slotMap.get(`${row}-${col}`);
      if (dayNumber) {
        const dayData = appData.days.find((item) => item.day === dayNumber);
        const state = getCaseState(dayData, activeDay);
        const card = document.createElement("button");
        card.type = "button";
        card.className = `layout-card ${state}`;
        card.draggable = !isReadOnlyMode();
        card.dataset.day = String(dayNumber);
        card.innerHTML = `
          <span class="layout-day-number">${dayNumber}</span>
          <span class="layout-day-state">${state === "open" ? "🎁" : state === "in-progress" ? "⏳" : "🔒"}</span>
          <span class="layout-day-meta">${dayData.sales}/${dayData.objective}</span>
        `;

        card.addEventListener("dragstart", () => {
          draggedLayoutDay = dayNumber;
        });

        card.addEventListener("dragend", () => {
          draggedLayoutDay = null;
          elements.adminCalendarPreview.querySelectorAll(".layout-slot").forEach((item) => item.classList.remove("drag-over"));
        });

        slot.appendChild(card);
      }

      slot.addEventListener("dragover", (event) => {
        if (isReadOnlyMode()) return;
        event.preventDefault();
        slot.classList.add("drag-over");
      });

      slot.addEventListener("dragleave", () => {
        slot.classList.remove("drag-over");
      });

      slot.addEventListener("drop", (event) => {
        if (guardReadOnlyAction()) return;
        event.preventDefault();
        slot.classList.remove("drag-over");
        if (!draggedLayoutDay) return;

        const targetDay = slotMap.get(`${row}-${col}`);
        if (targetDay && targetDay !== draggedLayoutDay) {
          swapLayoutPositions(draggedLayoutDay, targetDay);
        } else if (!targetDay) {
          moveLayoutToEmpty(draggedLayoutDay, row, col);
        } else {
          return;
        }

        appData.config.calendarLayout = normalizeCalendarLayout(appData.config.calendarLayout);
        saveData();
        renderCalendarPreview();
      });

      elements.adminCalendarPreview.appendChild(slot);
    }
  }

  applyRoleMode();
}

function updateDailyFields() {
  const dateValue = elements.datePicker.value;
  if (!dateValue) {
    elements.dailyObjective.value = "";
    elements.dailySales.value = "";
    return;
  }

  const dayMatch = dateValue.match(/(\d{2})$/);
  const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : null;

  if (!dayNum || dayNum < 1 || dayNum > 24) {
    elements.dailyObjective.value = "";
    elements.dailySales.value = "";
    return;
  }

  const dayData = appData.days.find((d) => d.day === dayNum);
  if (dayData) {
    elements.dailyObjective.value = dayData.objective;
    elements.dailySales.value = dayData.sales;
  }
}

function renderStats() {
  const states = appData.days.map((d) => {
    if (d.forceClosed) return "locked";
    if (d.forceOpen || d.sales >= d.objective) return "open";
    return "locked";
  });
  const opened = states.filter((s) => s === "open").length;

  const totalObjective = appData.days.reduce((sum, d) => sum + d.objective, 0);
  const totalSales = appData.days.reduce((sum, d) => sum + d.sales, 0);
  const rate = percent(totalSales, totalObjective);

  elements.statOpened.textContent = `${opened} / 24`;
  elements.statObjective.textContent = `${totalObjective} ventes`;
  elements.statSales.textContent = `${totalSales} ventes`;
  elements.statRate.textContent = `${rate}%`;

  renderChart();
}

function displayRankingName(entry) {
  return appData.config.rankingMode === "named" ? entry.name : entry.anonymousLabel;
}

function getRankingEntries() {
  if (appData.config.rankingSortMode === "manual") {
    return [...appData.rankings];
  }

  return [...appData.rankings].sort((a, b) => b.points - a.points || b.sales - a.sales);
}

function renderRankingPanel() {
  if (!elements.rankingTbody) return;

  const rankings = getRankingEntries();
  const filteredRankings = getFilteredRankingEntries(rankings);
  const pageSize = getPageSize();
  updateRankingPagination(filteredRankings.length);

  const start = (currentRankingPage - 1) * pageSize;
  const pageEntries = filteredRankings.slice(start, start + pageSize);
  const maxPoints = Math.max(1, ...filteredRankings.map((entry) => Number(entry.points) || 0), 0);

  elements.rankingModeToggle.checked = appData.config.rankingMode === "anonymous";
  elements.rankingSortMode.value = appData.config.rankingSortMode;
  elements.rankingPreview.textContent =
    appData.config.rankingMode === "anonymous"
      ? "Affichage anonyme côté collaborateurs."
      : "Affichage nominatif côté collaborateurs.";

  elements.rankingTbody.innerHTML = pageEntries.length
    ? pageEntries.map((entry, pageIndex) => {
      const absoluteIndex = start + pageIndex;
      const medal = absoluteIndex === 0 ? "🥇" : absoluteIndex === 1 ? "🥈" : absoluteIndex === 2 ? "🥉" : `#${absoluteIndex + 1}`;
      const badgeClass = absoluteIndex === 0 ? "first" : absoluteIndex === 1 ? "second" : absoluteIndex === 2 ? "third" : "";
      const width = Math.max(18, Math.round(((Number(entry.points) || 0) / maxPoints) * 100));
      return `
        <tr data-id="${entry.id}" class="${selectedRankingId === entry.id ? "is-selected" : ""}">
          <td><span class="badge-top3 ${badgeClass}">${medal}</span></td>
          <td><input class="name-field" data-field="name" type="text" value="${escapeHtml(entry.name)}" /></td>
          <td><input class="alias-field" data-field="anonymousLabel" type="text" value="${escapeHtml(entry.anonymousLabel)}" /></td>
          <td><input class="points-field" data-field="points" type="number" min="0" value="${entry.points}" /></td>
          <td><input class="sales-field" data-field="sales" type="number" min="0" value="${entry.sales}" /></td>
          <td><input class="icon-field" data-field="icon" type="text" maxlength="2" value="${escapeHtml(entry.icon)}" /></td>
          <td><input class="avatar-field" data-field="avatarUrl" type="text" value="${escapeHtml(entry.avatarUrl || "")}" placeholder="https://..." /></td>
          <td>
            <button class="btn btn-mini btn-move" data-action="up">↑</button>
            <button class="btn btn-mini btn-move" data-action="down">↓</button>
            <button class="btn btn-mini btn-remove" data-action="remove">Supprimer</button>
            <div class="ranking-mini-bar"><span style="width:${width}%"></span></div>
          </td>
        </tr>
      `;
    }).join("")
    : '<tr><td colspan="8">Aucun collaborateur ne correspond aux filtres actuels.</td></tr>';

  renderRankingJumpOptions(rankings);
  notifyRankChanges(rankings);
  applyRoleMode();
}

function showRankToast(message) {
  if (!elements.rankToast) return;

  elements.rankToast.textContent = message;
  elements.rankToast.classList.add("show");

  if (rankToastTimer) {
    clearTimeout(rankToastTimer);
  }

  rankToastTimer = setTimeout(() => {
    elements.rankToast.classList.remove("show");
  }, 2600);
}

function notifyRankChanges(rankings) {
  const current = new Map();
  rankings.forEach((entry, index) => {
    current.set(entry.id, index + 1);
  });

  if (previousRanks.size === 0) {
    previousRanks = current;
    return;
  }

  const changes = [];
  rankings.forEach((entry, index) => {
    const newPos = index + 1;
    const oldPos = previousRanks.get(entry.id);
    if (oldPos && oldPos !== newPos) {
      const direction = newPos < oldPos ? "↗" : "↘";
      changes.push(`${displayRankingName(entry)} ${direction} ${oldPos} -> ${newPos}`);
    }
  });

  if (changes.length) {
    showRankToast(changes.slice(0, 2).join(" | "));
  }

  previousRanks = current;
}

function renderRankingJumpOptions(rankings) {
  if (!elements.rankingJumpSelect) return;

  const currentValue = elements.rankingJumpSelect.value;
  elements.rankingJumpSelect.innerHTML = '<option value="">Tous les collaborateurs</option>';

  rankings.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = `${displayRankingName(entry)} · ${entry.points} pts`;
    elements.rankingJumpSelect.appendChild(option);
  });

  elements.rankingJumpSelect.value = currentValue;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function syncRankingFromInput(target) {
  const row = target.closest("tr[data-id]");
  if (!row) return;

  const entry = appData.rankings.find((item) => item.id === row.dataset.id);
  if (!entry) return;

  const field = target.dataset.field;
  if (!field) return;

  if (field === "points" || field === "sales") {
    entry[field] = Math.max(0, parseInt(target.value, 10) || 0);
  } else {
    entry[field] = target.value;
  }

  saveData();
  renderRankingPanel();
  renderStats();
}

function addRankingEntry() {
  const nextIndex = appData.rankings.length + 1;
  appData.rankings.push({
    id: `r${Date.now()}`,
    name: `Collaborateur ${nextIndex}`,
    anonymousLabel: `Collaborateur ${nextIndex}`,
    points: 0,
    sales: 0,
    icon: "🎄",
    avatarUrl: ""
  });

  saveData();
  renderRankingPanel();
  renderStats();
  addAudit("Classement", "Ajout d'un collaborateur");
}

function removeRankingEntry(entryId) {
  appData.rankings = appData.rankings.filter((entry) => entry.id !== entryId);
  saveData();
  renderRankingPanel();
  renderStats();
  addAudit("Classement", "Suppression d'un collaborateur");
}

function moveRankingEntry(entryId, direction) {
  const currentIndex = appData.rankings.findIndex((entry) => entry.id === entryId);
  const targetIndex = currentIndex + direction;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= appData.rankings.length) return;

  const [moved] = appData.rankings.splice(currentIndex, 1);
  appData.rankings.splice(targetIndex, 0, moved);
  saveData();
  renderRankingPanel();
  renderStats();
  addAudit("Classement", `Changement manuel de rang pour ${displayRankingName(moved)}`);
}

function exportRankingCsv() {
  const rows = [
    ["Rang", "Nom", "Alias anonyme", "Points", "Ventes", "Icône", "Avatar"],
    ...getRankingEntries().map((entry, index) => [
      String(index + 1),
      entry.name,
      entry.anonymousLabel,
      String(entry.points),
      String(entry.sales),
      entry.icon,
      entry.avatarUrl || ""
    ])
  ];

  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `classement-avent-performance.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  addAudit("Export", "Export CSV du classement");
}

function exportRankingXls() {
  const headers = ["Rang", "Nom", "Alias anonyme", "Points", "Ventes", "Icône", "Avatar"];
  const rows = getRankingEntries().map((entry, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(entry.name)}</td>
      <td>${escapeHtml(entry.anonymousLabel)}</td>
      <td>${entry.points}</td>
      <td>${entry.sales}</td>
      <td>${escapeHtml(entry.icon)}</td>
      <td>${escapeHtml(entry.avatarUrl || "")}</td>
    </tr>
  `);

  const table = `
    <table>
      <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>${table}</body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "classement-avent-performance.xls";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  addAudit("Export", "Export Excel du classement");
}

async function importRankingFile(file) {
  if (!file || guardReadOnlyAction()) return;

  const text = await file.text();
  const rows = getImportedRowsFromFile(file.name, text);
  const importedRankings = buildRankingFromRows(rows);

  if (!importedRankings.length) {
    throw new Error("Aucune ligne exploitable trouvee dans le fichier importe.");
  }

  appData.rankings = importedRankings;
  currentRankingPage = 1;
  selectedRankingId = "";
  saveData();
  renderRankingPanel();
  renderStats();
  addAudit("Import", `Import du classement depuis ${file.name}`);
}

function focusRankingEntry(entryId) {
  selectedRankingId = entryId || "";

  if (!entryId) {
    renderRankingPanel();
    return;
  }

  const rankings = getFilteredRankingEntries(getRankingEntries());
  const index = rankings.findIndex((entry) => entry.id === entryId);
  if (index >= 0) {
    currentRankingPage = Math.floor(index / getPageSize()) + 1;
  }

  renderRankingPanel();

  const targetRow = elements.rankingTbody.querySelector(`tr[data-id="${CSS.escape(entryId)}"]`);
  if (targetRow) {
    targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function refreshFullscreenLabel() {
  const full = Boolean(document.fullscreenElement);
  if (elements.fullscreenBtn) {
    elements.fullscreenBtn.textContent = full ? "🗗 Quitter plein écran" : "⛶ Plein écran";
  }
}

function renderChart() {
  const canvas = elements.statsChart;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = canvas.offsetWidth;
  canvas.height = 240;

  const padding = 40;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;

  ctx.fillStyle = "rgba(248,248,255,0.04)";
  ctx.fillRect(padding, padding, width, height);

  const maxVal = Math.max(...appData.days.map((d) => Math.max(d.objective, d.sales)));
  const barWidth = width / 24;

  appData.days.forEach((day, idx) => {
    const x = padding + idx * barWidth + barWidth * 0.1;
    const bw = barWidth * 0.4;

    const objHeight = (day.objective / maxVal) * height;
    const salesHeight = (day.sales / maxVal) * height;

    ctx.fillStyle = "rgba(255,215,0,0.3)";
    ctx.fillRect(x, padding + height - objHeight, bw, objHeight);

    ctx.fillStyle = "#26743f";
    ctx.fillRect(x + bw + 2, padding + height - salesHeight, bw, salesHeight);
  });

  ctx.fillStyle = "rgba(248,248,255,0.4)";
  ctx.font = "12px Poppins";
  ctx.textAlign = "center";
  ctx.fillText("Objectif (or) vs Ventes actuelles (vert)", canvas.width / 2, canvas.height - 10);
}

function openEditModal(dayNum) {
  if (guardReadOnlyAction()) return;

  const day = appData.days.find((d) => d.day === dayNum);
  if (!day) return;

  editingDayNumber = dayNum;

  elements.editCaseDay.textContent = `Jour ${dayNum}`;
  elements.editObjective.value = day.objective;
  elements.editSales.value = day.sales;
  elements.editTitle.value = day.surpriseTitle;
  elements.editDescription.value = day.surpriseDescription;
  elements.editCongrats.value = day.congratsMessage || "";
  elements.editIcon.value = day.surpriseIcon;
  elements.editLinkLabel.value = day.surpriseLinkLabel || "";
  elements.editLinkUrl.value = day.surpriseLinkUrl || "";
  elements.editForceOpen.checked = day.forceOpen;
  elements.editForceClosed.checked = day.forceClosed;

  elements.editModal.showModal();
}

function saveEditedCase() {
  if (guardReadOnlyAction()) return;
  if (editingDayNumber === null) return;

  const day = appData.days.find((d) => d.day === editingDayNumber);
  if (!day) return;

  day.objective = parseInt(elements.editObjective.value, 10) || day.objective;
  day.sales = parseInt(elements.editSales.value, 10) || day.sales;
  day.surpriseTitle = elements.editTitle.value || day.surpriseTitle;
  day.surpriseDescription = elements.editDescription.value || day.surpriseDescription;
  day.congratsMessage = elements.editCongrats.value || day.congratsMessage;
  day.surpriseIcon = elements.editIcon.value || day.surpriseIcon;
  day.surpriseLinkLabel = elements.editLinkLabel.value || "";
  day.surpriseLinkUrl = elements.editLinkUrl.value || "";
  day.forceOpen = elements.editForceOpen.checked;
  day.forceClosed = elements.editForceClosed.checked;

  saveData();
  renderCasesTable();
  renderStats();
  addAudit("Case", `Edition de la case ${day.day}`);
  elements.editModal.close();
  editingDayNumber = null;
}

function initEvents() {
  elements.datePicker.addEventListener("change", updateDailyFields);

  elements.adminRoleSelect.addEventListener("change", () => {
    if (elements.adminRoleSelect.value === "admin" && isReadOnlyMode()) {
      const password = prompt("Mot de passe modification :");
      if (password !== EDIT_PASSWORD) {
        showMessage("Mot de passe modification incorrect.", true);
        elements.adminRoleSelect.value = "readonly";
        return;
      }
    }

    sessionStorage.setItem(ADMIN_ROLE_KEY, elements.adminRoleSelect.value);
    applyRoleMode();
    addAudit("Mode", elements.adminRoleSelect.value === "readonly" ? "Passage en lecture seule" : "Retour en mode admin");
  });

  elements.updateDailyBtn.addEventListener("click", () => {
    if (guardReadOnlyAction()) return;
    const dateValue = elements.datePicker.value;
    const sales = parseInt(elements.dailySales.value, 10);

    if (!dateValue || isNaN(sales)) {
      showMessage("Veuillez remplir tous les champs.", true);
      return;
    }

    const dayNum = parseInt(dateValue.split("-")[2], 10);
    const day = appData.days.find((d) => d.day === dayNum);

    if (!day) {
      showMessage("Jour invalide.", true);
      return;
    }

    day.sales = sales;
    if (sales >= day.objective && !day.unlockedAt) {
      day.unlockedAt = new Date().toISOString().slice(0, 10);
    }

    saveData();
    addAudit("Ventes", `Mise a jour du jour ${day.day} a ${sales} ventes`);
    showMessage("✅ Ventes mises a jour avec succes.", false);
    renderCasesTable();
    renderStats();
  });

  elements.saveMessagesBtn.addEventListener("click", () => {
    if (guardReadOnlyAction()) return;
    appData.config.directionMessage = elements.directionMessage.value || "";
    appData.config.flashAnnouncement = elements.flashAnnouncement.value || "";

    const dayVal = parseInt(elements.activeDayInput.value, 10);
    appData.config.activeDay = (dayVal >= 1 && dayVal <= 24) ? dayVal : null;

    const logoVal = (elements.logoUrlInput.value || "").trim();
    appData.config.logoDataUrl = logoVal || null;
    appData.config.countdownTarget = elements.countdownTargetInput.value
      ? new Date(elements.countdownTargetInput.value).toISOString()
      : "2026-12-24T00:00:00";
    appData.config.fontTitle = elements.fontTitleSelect.value || "Mountains of Christmas";
    appData.config.fontBody = elements.fontBodySelect.value || "Poppins";
    appData.config.showRankingAvatars = Boolean(elements.showRankingAvatarsToggle.checked);
    appData.config.theme = {
      gold: elements.themeGoldInput.value,
      green: elements.themeGreenInput.value,
      red: elements.themeRedInput.value,
      night: elements.themeNightInput.value,
      snow: elements.themeSnowInput.value
    };

    saveData();
    addAudit("Messages", "Mise a jour du message direction, jour actif, logo et theme");
    showMessage("✅ Réglages visuels et messages enregistrés.", false);
  });

  // Logo file -> base64
  if (elements.logoFileInput) {
    elements.logoFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target.result;
        elements.logoUrlInput.value = b64;
        elements.logoPreview.src = b64;
        elements.logoPreviewWrap.hidden = false;
      };
      reader.readAsDataURL(file);
    });
  }
  if (elements.logoUrlInput) {
    elements.logoUrlInput.addEventListener("input", () => {
      const v = elements.logoUrlInput.value.trim();
      if (v) { elements.logoPreview.src = v; elements.logoPreviewWrap.hidden = false; }
      else { elements.logoPreviewWrap.hidden = true; }
    });
  }

  elements.rankingModeToggle.addEventListener("change", () => {
    if (guardReadOnlyAction()) {
      elements.rankingModeToggle.checked = appData.config.rankingMode === "anonymous";
      return;
    }
    appData.config.rankingMode = elements.rankingModeToggle.checked ? "anonymous" : "named";
    saveData();
    renderRankingPanel();
    renderStats();
    addAudit("Classement", `Mode d'affichage ${appData.config.rankingMode === "anonymous" ? "anonyme" : "nominatif"}`);
  });

  elements.rankingSortMode.addEventListener("change", () => {
    if (guardReadOnlyAction()) {
      elements.rankingSortMode.value = appData.config.rankingSortMode;
      return;
    }
    appData.config.rankingSortMode = elements.rankingSortMode.value === "manual" ? "manual" : "auto";
    currentRankingPage = 1;
    saveData();
    renderRankingPanel();
    renderStats();
    addAudit("Classement", `Mode de tri ${appData.config.rankingSortMode === "manual" ? "manuel" : "automatique"}`);
  });

  elements.rankingJumpSelect.addEventListener("change", () => {
    focusRankingEntry(elements.rankingJumpSelect.value);
  });

  elements.rankingExportBtn.addEventListener("click", exportRankingCsv);
  elements.rankingExportXlsBtn.addEventListener("click", exportRankingXls);

  elements.rankingImportBtn.addEventListener("click", () => {
    if (guardReadOnlyAction()) return;
    elements.rankingImportFile.click();
  });

  elements.rankingImportFile.addEventListener("change", async () => {
    const [file] = elements.rankingImportFile.files || [];
    if (!file) return;

    try {
      await importRankingFile(file);
      showMessage("✅ Classement importe avec succes.", false);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Import impossible.", true);
    } finally {
      elements.rankingImportFile.value = "";
    }
  });

  elements.rankingSearchInput.addEventListener("input", () => {
    currentRankingPage = 1;
    selectedRankingId = "";
    renderRankingPanel();
  });

  elements.rankingPointsFilter.addEventListener("input", () => {
    currentRankingPage = 1;
    selectedRankingId = "";
    renderRankingPanel();
  });

  elements.rankingPageSize.addEventListener("change", () => {
    currentRankingPage = 1;
    renderRankingPanel();
  });

  elements.rankingPrevPageBtn.addEventListener("click", () => {
    currentRankingPage = Math.max(1, currentRankingPage - 1);
    renderRankingPanel();
  });

  elements.rankingNextPageBtn.addEventListener("click", () => {
    currentRankingPage += 1;
    renderRankingPanel();
  });

  elements.layoutResetBtn.addEventListener("click", () => {
    if (guardReadOnlyAction()) return;
    appData.config.calendarLayout = getDefaultCalendarLayout();
    saveData();
    renderCalendarPreview();
    addAudit("Calendrier", "Reinitialisation de l'agencement du calendrier");
    showMessage("✅ Agencement du calendrier reinitialise.", false);
  });

  elements.layoutSaveBtn.addEventListener("click", () => {
    if (guardReadOnlyAction()) return;
    appData.config.calendarLayout = normalizeCalendarLayout(appData.config.calendarLayout);
    saveData();
    renderCalendarPreview();
    addAudit("Calendrier", "Sauvegarde de l'agencement du calendrier");
    showMessage("✅ Agencement du calendrier enregistre.", false);
  });

  elements.saveRankingConfigBtn.addEventListener("click", () => {
    if (guardReadOnlyAction()) return;
    saveData();
    addAudit("Classement", "Sauvegarde globale du classement");
    showMessage("✅ Classement enregistre avec succes.", false);
  });

  elements.addRankingEntryBtn.addEventListener("click", () => {
    if (guardReadOnlyAction()) return;
    addRankingEntry();
    showMessage("✅ Collaborateur ajoute au classement.", false);
  });

  elements.rankingTbody.addEventListener("change", (event) => {
    if (guardReadOnlyAction()) return;
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    syncRankingFromInput(target);
    addAudit("Classement", `Edition du champ ${target.dataset.field || "inconnu"}`);
  });

  elements.rankingTbody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const moveUpButton = target.closest("button[data-action='up']");
    if (moveUpButton) {
      if (guardReadOnlyAction()) return;
      const row = moveUpButton.closest("tr[data-id]");
      if (row) moveRankingEntry(row.dataset.id, -1);
      return;
    }

    const moveDownButton = target.closest("button[data-action='down']");
    if (moveDownButton) {
      if (guardReadOnlyAction()) return;
      const row = moveDownButton.closest("tr[data-id]");
      if (row) moveRankingEntry(row.dataset.id, 1);
      return;
    }

    const button = target.closest("button[data-action='remove']");
    if (!button) return;
    if (guardReadOnlyAction()) return;

    const row = button.closest("tr[data-id]");
    if (!row) return;

    removeRankingEntry(row.dataset.id);
    showMessage("✅ Collaborateur retire du classement.", false);
  });

  elements.saveCaseBtn.addEventListener("click", saveEditedCase);

  elements.closeModalXBtn.addEventListener("click", () => {
    elements.editModal.close();
    editingDayNumber = null;
  });

  elements.closeModalBtn.addEventListener("click", () => {
    elements.editModal.close();
    editingDayNumber = null;
  });

  elements.editModal.addEventListener("click", (event) => {
    const rect = elements.editModal.getBoundingClientRect();
    const inDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inDialog) {
      elements.editModal.close();
      editingDayNumber = null;
    }
  });

  elements.logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("admin-auth");
    window.location.href = "index.html";
  });

  elements.clearAuditBtn.addEventListener("click", () => {
    if (guardReadOnlyAction()) return;
    appData.auditLog = [];
    saveData();
    renderAuditLog();
    showMessage("✅ Historique vide.", false);
  });

  elements.fullscreenBtn.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", refreshFullscreenLabel);
}

function showMessage(msg, isError = false) {
  const msgEl = elements.updateMessage;
  msgEl.textContent = msg;
  msgEl.classList.remove("hidden");
  if (isError) {
    msgEl.classList.add("error");
  } else {
    msgEl.classList.remove("error");
  }

  setTimeout(() => {
    msgEl.classList.add("hidden");
  }, 3200);
}

function init() {
  if (!checkAuth()) return;

  if (elements.adminAppVersion) {
    elements.adminAppVersion.textContent = `Version ${APP_VERSION}`;
  }

  if (!loadData()) return;

  const today = new Date().toISOString().slice(0, 10);
  elements.datePicker.value = today;

  elements.directionMessage.value = appData.config.directionMessage || "";
  elements.flashAnnouncement.value = appData.config.flashAnnouncement || "";
  if (elements.activeDayInput) {
    elements.activeDayInput.value = appData.config.activeDay ? String(appData.config.activeDay) : "";
  }
  if (elements.logoUrlInput) {
    const logoUrl = appData.config.logoDataUrl || "";
    elements.logoUrlInput.value = logoUrl;
    if (logoUrl && elements.logoPreview) {
      elements.logoPreview.src = logoUrl;
      if (elements.logoPreviewWrap) elements.logoPreviewWrap.hidden = false;
    } else if (elements.logoPreviewWrap) {
      elements.logoPreviewWrap.hidden = true;
    }
  }
  if (elements.countdownTargetInput) {
    const target = appData.config.countdownTarget || "2026-12-24T00:00:00";
    elements.countdownTargetInput.value = target.slice(0, 16);
  }
  if (elements.fontTitleSelect) {
    elements.fontTitleSelect.value = appData.config.fontTitle || "Mountains of Christmas";
  }
  if (elements.fontBodySelect) {
    elements.fontBodySelect.value = appData.config.fontBody || "Poppins";
  }
  if (elements.showRankingAvatarsToggle) {
    elements.showRankingAvatarsToggle.checked = Boolean(appData.config.showRankingAvatars);
  }
  if (elements.themeGoldInput) elements.themeGoldInput.value = appData.config.theme?.gold || "#ffd700";
  if (elements.themeGreenInput) elements.themeGreenInput.value = appData.config.theme?.green || "#1b4d2e";
  if (elements.themeRedInput) elements.themeRedInput.value = appData.config.theme?.red || "#b22222";
  if (elements.themeNightInput) elements.themeNightInput.value = appData.config.theme?.night || "#0d1b2a";
  if (elements.themeSnowInput) elements.themeSnowInput.value = appData.config.theme?.snow || "#f8f8ff";
  elements.rankingPointsFilter.value = elements.rankingPointsFilter.value || "0";
  elements.adminRoleSelect.value = sessionStorage.getItem(ADMIN_ROLE_KEY) || "readonly";

  initEvents();
  renderCasesTable();
  renderCalendarPreview();
  renderRankingPanel();
  renderStats();
  renderAuditLog();
  refreshFullscreenLabel();
  applyRoleMode();
  updateDailyFields();
}

init();
