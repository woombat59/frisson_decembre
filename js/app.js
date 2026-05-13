const STORAGE_KEY = "avent-performance-data-v1";
const CELEBRATED_KEY = "avent-performance-celebrated";
const ADMIN_PATH = "admin.html";
const APP_VERSION = "v2026.05.13-1";
const DATA_SOURCE_URL = "data/shared.json";
const CALENDAR_GRID_ROWS = 10;
const CALENDAR_GRID_COLS = 9;

const treePattern = [1, 2, 3, 4, 5, 4, 3, 2];
const layoutColumnsByCount = {
  1: [5],
  2: [4, 6],
  3: [4, 5, 6],
  4: [3, 4, 6, 7],
  5: [3, 4, 5, 6, 7]
};

const elements = {
  countdown: document.querySelector("#countdown"),
  todayLabel: document.querySelector("#today-label"),
  globalState: document.querySelector("#global-state"),
  dailyGoalLine: document.querySelector("#daily-goal-line"),
  dailyProgressTrack: document.querySelector("#daily-progress-track"),
  dailyProgressFill: document.querySelector("#daily-progress-fill"),
  dailyProgressSpark: document.querySelector("#daily-progress-spark"),
  dailyProgressText: document.querySelector("#daily-progress-text"),
  dailyProgressMessage: document.querySelector("#daily-progress-message"),
  calendarTree: document.querySelector("#calendar-tree"),
  openedCount: document.querySelector("#opened-count"),
  monthProgressFill: document.querySelector("#month-progress-fill"),
  monthProgressText: document.querySelector("#month-progress-text"),
  bestDay: document.querySelector("#best-day"),
  daysLeft: document.querySelector("#days-left"),
  directionMessageText: document.querySelector("#direction-message-text"),
  rankingModeLabel: document.querySelector("#ranking-mode-label"),
  rankingList: document.querySelector("#ranking-list"),
  flashAnnouncement: document.querySelector("#flash-announcement"),
  modal: document.querySelector("#surprise-modal"),
  closeModal: document.querySelector("#close-modal"),
  modalDay: document.querySelector("#modal-day"),
  modalTitle: document.querySelector("#modal-title"),
  modalIcon: document.querySelector("#modal-icon"),
  modalDescription: document.querySelector("#modal-description"),
  modalUnlocked: document.querySelector("#modal-unlocked"),
  modalCongrats: document.querySelector("#modal-congrats"),
  modalLink: document.querySelector("#modal-link"),
  statusToast: document.querySelector("#status-toast"),
  appVersion: document.querySelector("#app-version"),
  musicToggle: document.querySelector("#music-toggle"),
  adminLink: document.querySelector("#admin-link"),
  snowCanvas: document.querySelector("#snow-canvas")
};

let appState = null;
let chimeInterval = null;
let audioCtx = null;
let hashSnapshot = "";
let toastTimer = null;
let activeParticles = [];

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

function seededData() {
  const surprises = [
    ["Pause cafe offerte", "Un moment cafe et gourmandises offert a toute l'equipe.", "☕"],
    ["Playlist boost", "La playlist de noel lo-fi de la team est diffusee 2 heures.", "🎵"],
    ["Petit-dejeuner maison", "Viennoiseries et boissons chaudes pour tout le plateau.", "🥐"],
    ["Dress code festif", "Journee pull de noel et photo d'equipe.", "🧣"],
    ["Bonus points", "Double points sur la performance interne du jour.", "✨"],
    ["Lunch equipe", "Dejeuner convivial pris en charge.", "🍽️"],
    ["Roue de la chance", "Chaque collaborateur tire une surprise express.", "🎡"],
    ["Pause chocolat chaud", "Service special chocolat chaud en salle commune.", "🍫"],
    ["Happy hour sans alcool", "Moment convivial de fin de journee.", "🥂"],
    ["Mur des victoires", "Mise en avant des plus belles performances de la semaine.", "🏆"],
    ["Atelier express", "Mini atelier motivation et techniques de closing.", "🚀"],
    ["Team challenge", "Defi cooperatif avec recompense collective.", "🤝"],
    ["Carte cadeau", "Tirage d'une carte cadeau parmi les participants.", "🎁"],
    ["Live shoutout", "Mention speciale de l'equipe en reunion generale.", "📣"],
    ["Pause bien-etre", "Session respiration et detente de 15 minutes.", "🕯️"],
    ["Session blind test", "Quiz musical de noel entre equipes.", "🎤"],
    ["Dessert surprise", "Dessert du jour offert a tous.", "🍰"],
    ["Sprint flash", "Objectif bonus sur 90 minutes chrono.", "⚡"],
    ["Carte merci", "Message personnalise de la direction.", "💌"],
    ["Medailles internes", "Remise symbolique des medailles de progression.", "🥇"],
    ["Animation surprise", "Intervention festive en open space.", "🎭"],
    ["Photo souvenir", "Photo officielle edition Avent 2026.", "📸"],
    ["Mega tirage", "Grand tirage final des recompenses.", "🎟️"],
    ["Celebration finale", "Moment de celebration collectif de cloture.", "🎄"]
  ];

  const objectives = [50, 50, 55, 56, 58, 60, 60, 62, 63, 64, 66, 66, 68, 70, 72, 74, 74, 76, 78, 80, 82, 84, 86, 90];
  const sales = [53, 47, 59, 62, 63, 58, 64, 88, 61, 66, 71, 74, 44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const days = Array.from({ length: 24 }, (_, index) => {
    const day = index + 1;
    const [title, description, icon] = surprises[index];
    const objective = objectives[index];
    const done = sales[index];
    const unlocked = done >= objective;

    return {
      day,
      date: `2026-12-${String(day).padStart(2, "0")}`,
      objective,
      sales: done,
      surpriseTitle: title,
      surpriseDescription: description,
      surpriseIcon: icon,
      congratsMessage: `Bravo equipe, la case ${day} est debloquee grace a votre energie.`,
      surpriseLinkLabel: "",
      surpriseLinkUrl: "",
      unlockedAt: unlocked ? `2026-12-${String(day).padStart(2, "0")}` : null,
      forceClosed: false,
      forceOpen: false
    };
  });

  const rankings = [
    { id: "r1", name: "Camille Martin", anonymousLabel: "Collaborateur 1", points: 128, sales: 56, icon: "🌟", avatarUrl: "" },
    { id: "r2", name: "Nicolas Leroy", anonymousLabel: "Collaborateur 2", points: 121, sales: 52, icon: "🏅", avatarUrl: "" },
    { id: "r3", name: "Sarah Dubois", anonymousLabel: "Collaborateur 3", points: 117, sales: 49, icon: "🎁", avatarUrl: "" },
    { id: "r4", name: "Antoine Petit", anonymousLabel: "Collaborateur 4", points: 111, sales: 45, icon: "🚀", avatarUrl: "" },
    { id: "r5", name: "Lea Bernard", anonymousLabel: "Collaborateur 5", points: 107, sales: 44, icon: "✨", avatarUrl: "" },
    { id: "r6", name: "Julien Moreau", anonymousLabel: "Collaborateur 6", points: 98, sales: 39, icon: "🎄", avatarUrl: "" }
  ];

  return {
    config: {
      eventName: "L'Avent de la Performance",
      subtitle: "Eduneo - Decembre 2026",
      calendarLayout: getDefaultCalendarLayout(),
      rankingMode: "anonymous",
      countdownTarget: "2026-12-24T00:00:00",
      fontTitle: "Mountains of Christmas",
      fontBody: "Poppins",
      showRankingAvatars: false,
      theme: getDefaultThemeConfig(),
      directionMessage:
        "Votre engagement quotidien est remarquable. Restons unis, ambitieux et bienveillants jusqu'au 24 decembre.",
      flashAnnouncement: "🔥 Sprint final de la semaine ! On vise 120% aujourd'hui."
    },
    days,
    rankings
  };
}

function getDefaultCalendarLayout() {
  const rows = buildTreeOrder();

  return rows.flatMap((rowDays, rowIndex) => {
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

function getDefaultRankings() {
  return seededData().rankings;
}

function normalizeData(data) {
  const normalized = data || {};
  normalized.config = normalized.config || {};
  normalized.config.rankingMode = normalized.config.rankingMode === "named" ? "named" : "anonymous";
  normalized.config.countdownTarget = normalized.config.countdownTarget || "2026-12-24T00:00:00";
  normalized.config.fontTitle = normalized.config.fontTitle || "Mountains of Christmas";
  normalized.config.fontBody = normalized.config.fontBody || "Poppins";
  normalized.config.showRankingAvatars = Boolean(normalized.config.showRankingAvatars);
  normalized.config.theme = { ...getDefaultThemeConfig(), ...(normalized.config.theme || {}) };
  normalized.config.calendarLayout = normalizeCalendarLayout(normalized.config.calendarLayout);
  normalized.days = Array.isArray(normalized.days) ? normalized.days.map(normalizeDay) : seededData().days;

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

async function loadData() {
  try {
    const response = await fetch(`${DATA_SOURCE_URL}?v=${encodeURIComponent(APP_VERSION)}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const parsed = await response.json();
    const normalized = normalizeData(parsed?.data || parsed);
    if (!normalized.days || normalized.days.length !== 24) {
      throw new Error("invalid shared data");
    }

    return normalized;
  } catch {
    // Fallback de secours si le fichier partagé est indisponible.
    return normalizeData(seededData());
  }
}

function getTodayInEvent() {
  const now = new Date();
  const year = 2026;
  const month = 11;

  if (now.getFullYear() === year && now.getMonth() === month) {
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

function percent(value, total) {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function progressMessage(pct) {
  if (pct <= 30) return "L'equipe se rechauffe... 🧤";
  if (pct <= 60) return "La machine est lancee ! 🚀";
  if (pct < 100) return "On y est presque... encore un effort ! 🔥";
  return "OBJECTIF ATTEINT ! La case s'ouvre ! 🎉🎄";
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function applyThemeConfig(config) {
  const root = document.documentElement;
  const theme = { ...getDefaultThemeConfig(), ...(config.theme || {}) };
  root.style.setProperty("--gold", theme.gold);
  root.style.setProperty("--green", theme.green);
  root.style.setProperty("--red", theme.red);
  root.style.setProperty("--night", theme.night);
  root.style.setProperty("--snow", theme.snow);
  root.style.setProperty("--font-display", `'${config.fontTitle || "Mountains of Christmas"}', serif`);
  root.style.setProperty("--font-body", `'${config.fontBody || "Poppins"}', sans-serif`);
}

function getCountdownTarget(config) {
  const target = new Date(config?.countdownTarget || "2026-12-24T00:00:00");
  if (Number.isNaN(target.getTime())) {
    return new Date("2026-12-24T00:00:00");
  }
  return target;
}

function renderRankingIdentity(entry, showAvatar, className, label) {
  if (showAvatar && entry.avatarUrl) {
    return `<img class="${className}" src="${entry.avatarUrl}" alt="${label}" />`;
  }
  return `<div class="${className} emoji">${entry.icon || "🎄"}</div>`;
}

function isValidHttpUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function updateCountdown() {
  const now = new Date();
  const target = getCountdownTarget(appState?.data?.config || seededData().config);
  const delta = target.getTime() - now.getTime();
  const days = Math.max(0, Math.ceil(delta / (1000 * 60 * 60 * 24)));

  elements.countdown.textContent = `${days} jours`;
  elements.daysLeft.textContent = `${days} jours`;
}

function renderDailyProgress(activeDayData) {
  const pct = percent(activeDayData.sales, activeDayData.objective);
  elements.dailyGoalLine.textContent = `🎯 Objectif du jour : ${activeDayData.objective} ventes`;
  elements.dailyProgressFill.style.width = `${pct}%`;
  if (elements.dailyProgressTrack) {
    elements.dailyProgressTrack.style.setProperty("--progress-pct", `${pct}%`);
    elements.dailyProgressTrack.setAttribute("aria-valuenow", String(pct));
  }
  elements.dailyProgressText.textContent = `${pct}% - ${activeDayData.sales} ventes sur ${activeDayData.objective}`;
  elements.dailyProgressMessage.textContent = progressMessage(pct);

  if (pct >= 100) {
    triggerCelebration(activeDayData.day);
  }
}

function buildTreeOrder() {
  let next = 24;
  const rows = [];

  treePattern.forEach((count) => {
    const row = [];
    for (let i = 0; i < count; i += 1) {
      row.push(next);
      next -= 1;
    }
    rows.push(row);
  });

  return rows;
}

function cardInnerHTML(dayData, state) {
  const pct = percent(dayData.sales, dayData.objective);
  const lock = state === "locked" ? "🔒" : state === "in-progress" ? "⏳" : "🎁";

  return `
    <span class="day-number">${dayData.day}</span>
    <span class="day-state">${lock}</span>
    ${
      state === "in-progress"
        ? `<div class="day-mini-track"><div class="day-mini-fill" style="width:${pct}%"></div></div><span class="day-percent">${pct}%</span>`
        : ""
    }
  `;
}

function openModal(dayData) {
  if (!elements.modal || typeof elements.modal.showModal !== "function") return;
  if (!elements.modalDay || !elements.modalTitle || !elements.modalIcon || !elements.modalDescription || !elements.modalUnlocked || !elements.modalCongrats) {
    return;
  }

  elements.modalDay.textContent = `Jour ${dayData.day}`;
  elements.modalTitle.textContent = dayData.surpriseTitle;
  elements.modalIcon.textContent = dayData.surpriseIcon || "🎁";
  elements.modalDescription.textContent = dayData.surpriseDescription;
  elements.modalUnlocked.textContent = `Debloquee le ${formatDate(dayData.unlockedAt || dayData.date)}`;
  elements.modalCongrats.textContent = dayData.congratsMessage;
  if (elements.modalLink) {
    elements.modalLink.hidden = true;
    elements.modalLink.removeAttribute("href");
    const link = (dayData.surpriseLinkUrl || "").trim();
    if (isValidHttpUrl(link)) {
      elements.modalLink.href = link;
      elements.modalLink.textContent = dayData.surpriseLinkLabel || "Ouvrir le lien";
      elements.modalLink.hidden = false;
    }
  }
  elements.modal.showModal();
  modalSideConfettiBurst();
  playVictoryFanfare();
}

function launchCardFireworks(card) {
  if (!card) return;
  const canvas = elements.snowCanvas;
  const rect = card.getBoundingClientRect();
  const origin = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };

  for (let i = 0; i < 65; i += 1) {
    const angle = (Math.PI * 2 * i) / 65;
    const speed = 1.5 + Math.random() * 4;
    activeParticles.push({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.4,
      g: 0.05 + Math.random() * 0.05,
      size: 2 + Math.random() * 4,
      life: 42 + Math.random() * 20,
      maxLife: 42 + Math.random() * 20,
      color: ["#FFD700", "#F8F8FF", "#B22222", "#1B4D2E"][Math.floor(Math.random() * 4)]
    });
  }
}

function showStatusMessage(message) {
  if (!elements.statusToast) return;

  elements.statusToast.textContent = message;
  elements.statusToast.classList.add("show");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    elements.statusToast.classList.remove("show");
  }, 2600);
}

function getLockedReason(dayData, activeDay) {
  if (dayData.forceClosed) {
    return "Cette case est verrouillee manuellement par le gestionnaire.";
  }

  if (dayData.day > activeDay) {
    return "Ce n'est pas encore le bon jour pour ouvrir cette case.";
  }

  return `Pas assez de ventes pour cette case (${dayData.sales}/${dayData.objective}).`;
}

function renderCalendar(data, activeDay) {
  elements.calendarTree.innerHTML = "";
  elements.calendarTree.classList.add("layout-grid");

  const layout = normalizeCalendarLayout(data.config.calendarLayout);
  layout.forEach((placement) => {
    const dayData = data.days.find((d) => d.day === placement.day);
    if (!dayData) return;

    const state = getCaseState(dayData, activeDay);
    const card = document.createElement("button");
    card.className = `day-card ${state}`;
    card.type = "button";
    card.style.gridRow = String(placement.row);
    card.style.gridColumn = String(placement.col);
    card.innerHTML = cardInnerHTML(dayData, state);

    card.addEventListener("click", () => {
      if (state === "open") {
        launchCardFireworks(card);
        openModal(dayData);
        return;
      }

      if (state === "in-progress") {
        const pct = percent(dayData.sales, dayData.objective);
        if (pct >= 100) {
          launchCardFireworks(card);
          openModal(dayData);
          return;
        }

        showStatusMessage(`Pas assez de ventes pour ouvrir la case (${dayData.sales}/${dayData.objective}).`);
        return;
      }

      showStatusMessage(getLockedReason(dayData, activeDay));
    });

    elements.calendarTree.appendChild(card);
  });
}

function renderDashboard(data, activeDay) {
  const states = data.days.map((d) => getCaseState(d, activeDay));
  const opened = states.filter((s) => s === "open").length;

  const totalObjective = data.days.reduce((sum, d) => sum + d.objective, 0);
  const totalSales = data.days.reduce((sum, d) => sum + d.sales, 0);
  const monthPct = percent(totalSales, totalObjective);

  const best = data.days
    .filter((d) => d.sales > 0 && d.objective > 0)
    .sort((a, b) => b.sales / b.objective - a.sales / a.objective)[0];

  elements.openedCount.textContent = `${opened} / 24 🎁`;
  elements.monthProgressFill.style.width = `${monthPct}%`;
  elements.monthProgressText.textContent = `${monthPct}% - ${totalSales} / ${totalObjective} ventes`;
  elements.bestDay.textContent = best
    ? `Le ${formatDate(best.date)} - ${percent(best.sales, best.objective)}% de l'objectif 🌟`
    : "--";

  elements.directionMessageText.textContent =
    data.config.directionMessage ||
    "Votre energie collective fait la difference. Continuons ce superbe elan !";

  if (data.config.flashAnnouncement) {
    elements.flashAnnouncement.classList.remove("hidden");
    elements.flashAnnouncement.textContent = data.config.flashAnnouncement;
  } else {
    elements.flashAnnouncement.classList.add("hidden");
  }

  elements.globalState.textContent = opened >= 24 ? "Calendrier complete" : `${opened} cases ouvertes`;

  renderRanking(data);
}

function displayRankingName(entry, mode) {
  if (mode === "named") return entry.name;
  return entry.anonymousLabel || entry.name;
}

function renderPodium(data) {
  const podiumEl = document.getElementById("podium-section");
  if (!podiumEl) return;
  const mode = data.config.rankingMode === "named" ? "named" : "anonymous";
  const showAvatars = Boolean(data.config.showRankingAvatars);
  const top3 = [...(data.rankings || [])]
    .sort((a, b) => b.points - a.points || b.sales - a.sales)
    .slice(0, 3);

  if (top3.length < 1) { podiumEl.hidden = true; return; }
  podiumEl.hidden = false;

  // order: 2nd, 1st, 3rd for visual podium
  const order = [top3[1], top3[0], top3[2]];
  const heights = ["120px", "160px", "90px"];
  const medals = ["🥈", "🥇", "🥉"];
  const labels = ["2ème", "1er", "3ème"];

  podiumEl.querySelector(".podium-stage").innerHTML = order.map((entry, i) => {
    if (!entry) return `<div class="podium-col empty"></div>`;
    const name = displayRankingName(entry, mode);
    return `
      <div class="podium-col rank-${i === 1 ? 1 : i === 0 ? 2 : 3}">
        ${renderRankingIdentity(entry, showAvatars, "podium-avatar", name)}
        <div class="podium-name">${name}</div>
        <div class="podium-pts">${entry.points} pts</div>
        <div class="podium-block" style="height:${heights[i]}">
          <span class="podium-medal">${medals[i]}</span>
          <span class="podium-label">${labels[i]}</span>
        </div>
      </div>`;
  }).join("");
}

const RANKING_PAGE_SIZE = 5;
let rankingCurrentPage = 0;
let rankingAllEntries = [];
let rankingMode = "anonymous";
let rankingShowAvatars = false;

function renderRanking(data) {
  if (!elements.rankingList) return;

  rankingMode = data.config.rankingMode === "named" ? "named" : "anonymous";
  rankingShowAvatars = Boolean(data.config.showRankingAvatars);
  rankingAllEntries = [...(data.rankings || [])]
    .sort((a, b) => b.points - a.points || b.sales - a.sales);
  rankingCurrentPage = 0;

  if (elements.rankingModeLabel) {
    elements.rankingModeLabel.textContent =
      rankingMode === "named" ? "Affichage nominatif" : "Affichage anonyme";
  }

  // wire pagination buttons once
  const prevBtn = document.getElementById("ranking-prev");
  const nextBtn = document.getElementById("ranking-next");
  if (prevBtn && !prevBtn._wired) {
    prevBtn._wired = true;
    prevBtn.addEventListener("click", () => { rankingCurrentPage--; renderRankingPage(); });
    nextBtn.addEventListener("click", () => { rankingCurrentPage++; renderRankingPage(); });
  }

  renderRankingPage();
}

function renderRankingPage() {
  const paginationEl = document.getElementById("ranking-pagination");
  const prevBtn = document.getElementById("ranking-prev");
  const nextBtn = document.getElementById("ranking-next");
  const pageInfo = document.getElementById("ranking-page-info");

  if (!rankingAllEntries.length) {
    elements.rankingList.innerHTML = '<p class="ranking-empty">Aucune entree dans le classement.</p>';
    if (paginationEl) paginationEl.hidden = true;
    return;
  }

  const totalPages = Math.ceil(rankingAllEntries.length / RANKING_PAGE_SIZE);
  rankingCurrentPage = Math.max(0, Math.min(rankingCurrentPage, totalPages - 1));

  const start = rankingCurrentPage * RANKING_PAGE_SIZE;
  const pageEntries = rankingAllEntries.slice(start, start + RANKING_PAGE_SIZE);
  const maxPoints = Math.max(1, ...rankingAllEntries.map((e) => Number(e.points) || 0));

  elements.rankingList.innerHTML = pageEntries
    .map((entry, i) => {
      const globalIndex = start + i;
      const width = Math.max(18, Math.round(((Number(entry.points) || 0) / maxPoints) * 100));
      const medal = globalIndex === 0 ? "🥇" : globalIndex === 1 ? "🥈" : globalIndex === 2 ? "🥉" : `#${globalIndex + 1}`;
      const rankClass = globalIndex === 0 ? "first" : globalIndex === 1 ? "second" : globalIndex === 2 ? "third" : "";
      return `
        <article class="ranking-item rank-${globalIndex + 1}">
          <div class="ranking-position ${rankClass}">${medal}</div>
          ${renderRankingIdentity(entry, rankingShowAvatars, "ranking-icon", displayRankingName(entry, rankingMode))}
          <div class="ranking-meta">
            <h3>${displayRankingName(entry, rankingMode)}</h3>
            <p>${entry.points} pts · ${entry.sales} ventes</p>
          </div>
          <div class="ranking-bar"><span style="width:${width}%"></span></div>
        </article>
      `;
    })
    .join("");

  if (paginationEl) {
    paginationEl.hidden = totalPages <= 1;
    if (pageInfo) pageInfo.textContent = `Page ${rankingCurrentPage + 1} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = rankingCurrentPage === 0;
    if (nextBtn) nextBtn.disabled = rankingCurrentPage === totalPages - 1;
  }
}

function ensureUnlockedDate(data, activeDay) {
  let changed = false;

  data.days.forEach((d) => {
    const isOpen = getCaseState(d, activeDay) === "open";
    if (isOpen && !d.unlockedAt) {
      d.unlockedAt = new Date().toISOString().slice(0, 10);
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function getCelebratedDays() {
  try {
    return JSON.parse(localStorage.getItem(CELEBRATED_KEY) || "[]");
  } catch {
    return [];
  }
}

function setCelebrated(day) {
  const list = getCelebratedDays();
  if (!list.includes(day)) {
    list.push(day);
    localStorage.setItem(CELEBRATED_KEY, JSON.stringify(list));
  }
}

function triggerCelebration(day) {
  const already = getCelebratedDays();
  if (already.includes(day)) return;

  setCelebrated(day);
  confettiBurst();
  playChime();
}

function confettiBurst() {
  const canvas = elements.snowCanvas;
  const ctx = canvas.getContext("2d");
  const pieces = Array.from({ length: 90 }, () => ({
    x: canvas.width * (0.25 + Math.random() * 0.5),
    y: canvas.height * (0.15 + Math.random() * 0.2),
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * 2 + 2,
    g: 0.12 + Math.random() * 0.08,
    size: 2 + Math.random() * 5,
    life: 80 + Math.random() * 40,
    color: ["#FFD700", "#F8F8FF", "#B22222", "#1B4D2E"][Math.floor(Math.random() * 4)]
  }));

  let frame = 0;
  function animateConfetti() {
    frame += 1;
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.life -= 1;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / 120);
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.7);
      ctx.globalAlpha = 1;
    });

    if (frame < 90) requestAnimationFrame(animateConfetti);
  }

  animateConfetti();
}

function modalSideConfettiBurst() {
  if (!elements.modal || !elements.modal.open) return;

  const canvas = elements.snowCanvas;
  const rect = elements.modal.getBoundingClientRect();
  const leftOrigin = {
    x: Math.max(20, rect.left - 12),
    y: rect.top + rect.height * 0.55
  };
  const rightOrigin = {
    x: Math.min(canvas.width - 20, rect.right + 12),
    y: rect.top + rect.height * 0.55
  };

  function createPiece(origin, direction) {
    return {
      x: origin.x,
      y: origin.y,
      vx: direction * (2 + Math.random() * 4.5),
      vy: -2.5 - Math.random() * 3,
      g: 0.12 + Math.random() * 0.08,
      size: 2 + Math.random() * 4,
      life: 72 + Math.random() * 26,
      maxLife: 72 + Math.random() * 26,
      color: ["#FFD700", "#F8F8FF", "#B22222", "#1B4D2E"][Math.floor(Math.random() * 4)]
    };
  }

  for (let i = 0; i < 70; i += 1) {
    activeParticles.push(createPiece(leftOrigin, 1));
    activeParticles.push(createPiece(rightOrigin, -1));
  }
}

function startBackgroundFX() {
  const canvas = elements.snowCanvas;
  const ctx = canvas.getContext("2d");

  let w = 0;
  let h = 0;

  const flakes = [];
  const glints = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function seed() {
    flakes.length = 0;
    glints.length = 0;

    const density = Math.max(45, Math.floor(w / 18));
    for (let i = 0; i < density; i += 1) {
      flakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.8 + 0.7,
        vy: Math.random() * 0.9 + 0.3,
        vx: Math.random() * 0.7 - 0.35,
        drift: Math.random() * Math.PI * 2
      });
    }

    const stars = Math.max(16, Math.floor(w / 95));
    for (let i = 0; i < stars; i += 1) {
      glints.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.8,
        alpha: Math.random(),
        pulse: Math.random() * 0.02 + 0.004
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    flakes.forEach((f) => {
      f.y += f.vy;
      f.x += Math.sin(f.drift) * 0.5 + f.vx;
      f.drift += 0.02;

      if (f.y > h + 12) {
        f.y = -10;
        f.x = Math.random() * w;
      }
      if (f.x > w + 10) f.x = -10;
      if (f.x < -10) f.x = w + 10;

      ctx.beginPath();
      ctx.fillStyle = "rgba(248,248,255,0.82)";
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    });

    glints.forEach((g) => {
      g.alpha += g.pulse;
      if (g.alpha > 1 || g.alpha < 0.2) g.pulse *= -1;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,215,0,${g.alpha * 0.42})`;
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fill();
    });

    activeParticles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.life -= 1;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.72);
      ctx.globalAlpha = 1;

      if (p.life <= 0) {
        activeParticles.splice(idx, 1);
      }
    });

    requestAnimationFrame(draw);
  }

  resize();
  seed();
  draw();

  window.addEventListener("resize", () => {
    resize();
    seed();
  });
}

function playChime() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const time = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.0001, time + index * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.07, time + index * 0.11 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + index * 0.11 + 0.32);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(time + index * 0.11);
      osc.stop(time + index * 0.11 + 0.34);
    });
  } catch {
    // Navigateur sans Web Audio disponible.
  }
}

function playVictoryFanfare() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const now = audioCtx.currentTime;
    const notes = [659.25, 783.99, 987.77, 1046.5];

    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const start = now + index * 0.08;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.26);
    });
  } catch {
    // Navigateur sans Web Audio disponible.
  }
}

function startAmbiance() {
  if (chimeInterval) return;

  playChime();
  chimeInterval = setInterval(playChime, 24000);
  elements.musicToggle.setAttribute("aria-pressed", "true");
  elements.musicToggle.textContent = "🔉";
}

function stopAmbiance() {
  if (chimeInterval) {
    clearInterval(chimeInterval);
    chimeInterval = null;
  }
  elements.musicToggle.setAttribute("aria-pressed", "false");
  elements.musicToggle.textContent = "🔇";
}

function render(data) {
  applyThemeConfig(data.config);
  const cfgDay = data.config && data.config.activeDay;
  const activeDay = (cfgDay >= 1 && cfgDay <= 24) ? cfgDay : getTodayInEvent();
  const activeDayData = data.days.find((d) => d.day === activeDay) || data.days[0];

  // Logo
  const siteLogoEl = document.getElementById("site-logo");
  if (siteLogoEl) {
    if (data.config && data.config.logoDataUrl) {
      siteLogoEl.src = data.config.logoDataUrl;
      siteLogoEl.hidden = false;
    } else {
      siteLogoEl.hidden = true;
    }
  }

  appState = { data, activeDay };
  elements.todayLabel.textContent = `Jour ${activeDay}`;
  renderDailyProgress(activeDayData);
  renderCalendar(data, activeDay);
  renderDashboard(data, activeDay);
  renderPodium(data);
  updateCountdown();
}

async function maybeRefresh() {
  try {
    const latestData = await loadData();
    const latestHash = JSON.stringify(latestData);
    if (latestHash !== hashSnapshot) {
      hashSnapshot = latestHash;
      render(latestData);
      return;
    }

    updateCountdown();
  } catch (error) {
    console.error("Erreur maybeRefresh:", error);
  }
}

function initEvents() {
  if (elements.closeModal && elements.modal) {
    elements.closeModal.addEventListener("click", () => elements.modal.close());
  }

  if (elements.modal) {
    elements.modal.addEventListener("click", (event) => {
      const rect = elements.modal.getBoundingClientRect();
      const inDialog =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inDialog) elements.modal.close();
    });
  }

  if (elements.musicToggle) {
    elements.musicToggle.addEventListener("click", () => {
      const active = elements.musicToggle.getAttribute("aria-pressed") === "true";
      if (active) {
        stopAmbiance();
      } else {
        startAmbiance();
      }
    });
  }

  if (elements.adminLink) {
    elements.adminLink.addEventListener("click", () => {
      const popup = window.open(ADMIN_PATH, "_blank", "noopener");
      if (!popup) {
        window.location.href = ADMIN_PATH;
      }
    });
  }
}

async function init() {
  if (elements.appVersion) {
    elements.appVersion.textContent = `Version ${APP_VERSION}`;
  }

  const shared = await loadData();
  hashSnapshot = JSON.stringify(shared);
  initEvents();
  startBackgroundFX();

  try {
    render(shared);
  } catch (error) {
    console.error("Erreur render initial:", error);
  }

  setInterval(maybeRefresh, 30000);
  setInterval(updateCountdown, 1000);
}

init();
