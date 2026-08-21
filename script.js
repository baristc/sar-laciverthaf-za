
const screens = {
  setup: document.getElementById("setupScreen"),
  handoff: document.getElementById("handoffScreen"),
  game: document.getElementById("gameScreen"),
  result: document.getElementById("resultScreen"),
};

const state = {
  allPlayers: [],
  clubCatalog: [],
  deck: [],
  names: ["Oyuncu 1", "Oyuncu 2"],
  scores: [0, 0],
  currentPlayer: 0,
  completedTurns: 0,
  roundsPerPlayer: 5,
  currentFootballer: null,
  seasonAttempts: 0,
  arrivalAttempts: 0,
  departureAttempts: 0,
  currentStage: "season",
  turnStartScore: 0,
  history: [],
  playerCount: 2,
  mode: "local",
  soloCheckpointStartScore: 0,
  soloEliminated: false,
};

const seasonPoints = [15, 12, 9, 6, 3];
const teamPoints = [10, 7, 5];
const popularClubCatalog = [
  { name: "Bayern Munich", aliases: ["Bayern", "Bayern Münih", "Bayern München", "FC Bayern München"] },
  { name: "Borussia Dortmund", aliases: ["Dortmund", "BVB"] },
  { name: "Bayer Leverkusen", aliases: ["Leverkusen"] },
  { name: "RB Leipzig", aliases: ["Leipzig"] },
  { name: "Eintracht Frankfurt", aliases: ["Frankfurt"] },
  { name: "1899 Hoffenheim", aliases: ["Hoffenheim"] },
  { name: "VfB Stuttgart", aliases: ["Stuttgart"] },
  { name: "VfL Wolfsburg", aliases: ["Wolfsburg"] },
  { name: "FC Schalke 04", aliases: ["Schalke", "Schalke 04"] },
  { name: "Borussia Monchengladbach", aliases: ["Mönchengladbach", "Monchengladbach", "Gladbach"] },
  { name: "Real Madrid", aliases: ["Real", "Madrid"] },
  { name: "Atletico Madrid", aliases: ["Atlético Madrid", "Atletico"] },
  { name: "FC Barcelona", aliases: ["Barcelona", "Barça", "Barca"] },
  { name: "Athletic Club", aliases: ["Athletic Bilbao", "Bilbao"] },
  { name: "Real Sociedad", aliases: ["Sociedad"] },
  { name: "Real Betis", aliases: ["Betis"] },
  { name: "Celta Vigo", aliases: ["Celta"] },
  { name: "Deportivo Alaves", aliases: ["Alaves", "Alavés"] },
  { name: "RCD Espanyol", aliases: ["Espanyol"] },
  { name: "RCD Mallorca", aliases: ["Mallorca"] },
  { name: "Sevilla FC", aliases: ["Sevilla"] },
  { name: "Villarreal CF", aliases: ["Villarreal"] },
  { name: "Valencia CF", aliases: ["Valencia"] },
  { name: "Girona FC", aliases: ["Girona"] },
  { name: "Getafe CF", aliases: ["Getafe"] },
  { name: "UD Las Palmas", aliases: ["Las Palmas"] },
  { name: "CA Osasuna", aliases: ["Osasuna"] },
  { name: "Rayo Vallecano", aliases: ["Rayo"] },
];

const elements = {
  reportDataButton:
  document.getElementById("reportDataButton"),

reportDataMessage:
  document.getElementById("reportDataMessage"),

downloadReportsButton:
  document.getElementById("downloadReportsButton"),
  historyButton:
  document.getElementById("historyButton"),

historyModal:
  document.getElementById("historyModal"),

historyBackdrop:
  document.getElementById("historyBackdrop"),

closeHistoryButton:
  document.getElementById("closeHistoryButton"),

historyList:
  document.getElementById("historyList"),
  setupForm: document.getElementById("setupForm"),
  modeTabs: [...document.querySelectorAll("[data-mode-tab]")],
  modePanels: [...document.querySelectorAll("[data-mode-panel]")],
  soloNameInput: document.getElementById("soloNameInput"),
  soloRoundCount: document.getElementById("soloRoundCount"),
  soloBestScore: document.getElementById("soloBestScore"),
  startSoloButton: document.getElementById("startSoloButton"),
  playerOneInput: document.getElementById("playerOneInput"),
  playerTwoInput: document.getElementById("playerTwoInput"),
  roundCountInput: document.getElementById("roundCountInput"),
  restartButton: document.getElementById("restartButton"),
  revealButton: document.getElementById("revealButton"),
  handoffPlayerName: document.getElementById("handoffPlayerName"),

  scoreboard: document.querySelector(".scoreboard"),
  soloMissionHud: document.getElementById("soloMissionHud"),
  soloCheckpointLabel: document.getElementById("soloCheckpointLabel"),
  soloTargetLabel: document.getElementById("soloTargetLabel"),
  soloProgressLabel: document.getElementById("soloProgressLabel"),
  soloQuestionsLeftLabel: document.getElementById("soloQuestionsLeftLabel"),
  scoreNameOne: document.getElementById("scoreNameOne"),
  scoreNameTwo: document.getElementById("scoreNameTwo"),
  scoreOne: document.getElementById("scoreOne"),
  scoreTwo: document.getElementById("scoreTwo"),
  scoreCardOne: document.getElementById("scoreCardOne"),
  scoreCardTwo: document.getElementById("scoreCardTwo"),
  roundIndicator: document.getElementById("roundIndicator"),
  currentPlayerLabel: document.getElementById("currentPlayerLabel"),

  footballerImage: document.getElementById("footballerImage"),
  footballerName: document.getElementById("footballerName"),

  seasonQuestion: document.getElementById("seasonQuestion"),
  arrivalQuestion: document.getElementById("arrivalQuestion"),
  departureQuestion: document.getElementById("departureQuestion"),

  seasonInput: document.getElementById("seasonInput"),
  arrivalInput: document.getElementById("arrivalInput"),
  departureInput: document.getElementById("departureInput"),
  arrivalSuggestions: document.getElementById("arrivalSuggestions"),
  departureSuggestions: document.getElementById("departureSuggestions"),

  seasonSubmit: document.getElementById("seasonSubmit"),
  arrivalSubmit: document.getElementById("arrivalSubmit"),
  departureSubmit: document.getElementById("departureSubmit"),

  seasonFeedback: document.getElementById("seasonFeedback"),
  arrivalFeedback: document.getElementById("arrivalFeedback"),
  departureFeedback: document.getElementById("departureFeedback"),

  seasonAttemptsText: document.getElementById("seasonAttemptsText"),
  arrivalAttemptsText: document.getElementById("arrivalAttemptsText"),
  departureAttemptsText: document.getElementById("departureAttemptsText"),

  seasonScorePreview: document.getElementById("seasonScorePreview"),
  arrivalScorePreview: document.getElementById("arrivalScorePreview"),
  departureScorePreview: document.getElementById("departureScorePreview"),

  nextTurnButton: document.getElementById("nextTurnButton"),
  playAgainButton: document.getElementById("playAgainButton"),
  turnSummary: document.getElementById("turnSummary"),

summaryPlayerImage:
  document.getElementById("summaryPlayerImage"),

summaryPlayerName:
  document.getElementById("summaryPlayerName"),

summarySeason:
  document.getElementById("summarySeason"),

summaryArrivalLogo:
  document.getElementById("summaryArrivalLogo"),

summaryArrivalClub:
  document.getElementById("summaryArrivalClub"),

summaryDepartureLogo:
  document.getElementById("summaryDepartureLogo"),

summaryDepartureClub:
  document.getElementById("summaryDepartureClub"),

summaryTurnScore:
  document.getElementById("summaryTurnScore"),

  winnerText: document.getElementById("winnerText"),
  finalNameOne: document.getElementById("finalNameOne"),
  finalNameTwo: document.getElementById("finalNameTwo"),
  finalScoreOne: document.getElementById("finalScoreOne"),
  finalScoreTwo: document.getElementById("finalScoreTwo"),
  finalScoreTwoCard: document.getElementById("finalScoreTwoCard"),
  soloRecordText: document.getElementById("soloRecordText"),
};

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[screenName].classList.add("active");
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalise(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
function getAllClubs() {
  const clubs = new Map();

  function addClub(name, logo, aliases = [], sprite = null) {
    if (!name) return;
    const key = normalise(name);
    const existing = clubs.get(key);
    if (existing) {
      existing.logo ||= logo || null;
      existing.sprite ||= sprite || null;
      existing.aliases = [...new Set([...existing.aliases, ...aliases])];
      return;
    }
    clubs.set(key, { name, logo: logo || null, aliases: [...aliases], sprite });
  }

  state.allPlayers.forEach((player) => {
    addClub(player.arrivalClub, player.arrivalClubLogo, player.arrivalAliases || []);
    addClub(player.departureClub, player.departureClubLogo, player.departureAliases || []);
  });

  addClub("Fenerbahçe", "images/fenerbahce-logo.png?v=2", [
    "FB", "Fener", "Fenerbahçe'de", "Hâlâ Fenerbahçe'de"
  ]);

  popularClubCatalog.forEach((club) => addClub(club.name, null, club.aliases));
  state.clubCatalog.forEach((club) =>
    addClub(club.name, club.logo, club.aliases || [], club.sprite || null)
  );

  return [...clubs.values()].sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

function showClubSuggestions(input, suggestionsBox) {
  const searchText = normalise(input.value.trim());

  if (!searchText) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.add("hidden");
    return;
  }

  const matches = getAllClubs()
    .filter((club) => {
      const searchableNames = [club.name, ...club.aliases];
      return searchableNames.some((name) => normalise(name).includes(searchText));
    })
    .slice(0, 8);

  if (matches.length === 0) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.add("hidden");
    return;
  }

  suggestionsBox.innerHTML = matches
    .map((club) => {
      const logoHtml = club.logo
        ? `
          <img
            src="${club.logo}"
            alt=""
            class="suggestion-logo"
          />
        `
        : club.sprite
          ? `
            <span
              class="suggestion-logo suggestion-logo-sprite"
              style="--sprite-x: -${club.sprite.x}px; --sprite-y: -${club.sprite.y}px"
              aria-hidden="true"
            ></span>
          `
          : `
            <span class="suggestion-logo-fallback">
              ${club.name.charAt(0)}
            </span>
          `;

      return `
        <button
          type="button"
          class="suggestion-item"
          data-club-name="${club.name}"
        >
          ${logoHtml}

          <span>${club.name}</span>
        </button>
      `;
    })
    .join("");

  suggestionsBox.classList.remove("hidden");

  suggestionsBox.querySelectorAll(".suggestion-logo").forEach((image) => {
    image.addEventListener("error", () => {
      const fallback = document.createElement("span");
      fallback.className = "suggestion-logo-fallback";
      fallback.textContent = image.closest(".suggestion-item").dataset.clubName.charAt(0);
      image.replaceWith(fallback);
    }, { once: true });
  });

  suggestionsBox
    .querySelectorAll(".suggestion-item")
    .forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.clubName;

        suggestionsBox.innerHTML = "";
        suggestionsBox.classList.add("hidden");

        input.focus();
      });
    });
}

function isAcceptedAnswer(input, mainAnswer, aliases = []) {
  const catalogClub = getAllClubs().find((club) =>
    [club.name, ...club.aliases].some((name) => normalise(name) === normalise(mainAnswer))
  );
  const accepted = [mainAnswer, ...aliases, ...(catalogClub?.aliases || [])].map(normalise);
  return accepted.includes(normalise(input));
}

function parseSeasonStart(season) {
  return Number.parseInt(season.split("-")[0], 10);
}

function buildSeasonOptions() {
  const seasons = [];
  for (let year = 2015; year <= 2026; year += 1) {
    seasons.push(`${year}-${String(year + 1).slice(-2)}`);
  }

  elements.seasonInput.innerHTML = seasons
    .map((season) => `<option value="${season}">${season}</option>`)
    .join("");
}

async function loadPlayers() {
  const [playersResponse, catalogResponse] = await Promise.all([
    fetch("players.json?v=8"),
    fetch("club_catalog.json?v=1"),
  ]);
  if (!playersResponse.ok) {
    throw new Error("Oyuncu verileri yüklenemedi.");
  }
  state.allPlayers = await playersResponse.json();
  state.clubCatalog = catalogResponse.ok ? await catalogResponse.json() : [];
}

function resetQuestionCard(card, feedback) {
  card.classList.remove("completed", "active-question", "locked");
  feedback.textContent = "";
  feedback.className = "feedback";
}

function lockCard(card) {
  card.classList.add("locked");
  card.classList.remove("active-question");
}

function activateCard(card) {
  card.classList.remove("locked");
  card.classList.add("active-question");
}

function completeCard(card) {
  card.classList.remove("active-question");
  card.classList.add("completed");
}

function getSoloTarget(checkpointNumber) {
  return Math.min(100, 50 + (checkpointNumber - 1) * 10);
}

function ensureDeckHas(index) {
  while (state.deck.length <= index) {
    state.deck = state.deck.concat(shuffle(state.allPlayers));
  }
}

function updateSoloMissionHud() {
  const isSolo = state.mode === "solo";
  elements.soloMissionHud.classList.toggle("hidden", !isSolo);
  if (!isSolo) return;

  const checkpoint = Math.floor(state.completedTurns / 5) + 1;
  const questionsLeft = 5 - (state.completedTurns % 5);
  const progress = state.scores[0] - state.soloCheckpointStartScore;
  elements.soloCheckpointLabel.textContent = checkpoint;
  elements.soloTargetLabel.textContent = getSoloTarget(checkpoint);
  elements.soloProgressLabel.textContent = progress;
  elements.soloQuestionsLeftLabel.textContent = questionsLeft;
}
function prepareTurn() {
  ensureDeckHas(state.completedTurns);
  state.currentFootballer = state.deck[state.completedTurns];
  state.seasonAttempts = 0;
  state.arrivalAttempts = 0;
  state.departureAttempts = 0;
  state.currentStage = "season";
  state.turnStartScore = state.scores[state.currentPlayer];

  elements.footballerImage.src = state.currentFootballer.image;
  elements.footballerImage.alt = `${state.currentFootballer.name} görseli`;
  elements.footballerName.textContent = state.currentFootballer.name;

  resetQuestionCard(elements.seasonQuestion, elements.seasonFeedback);
  resetQuestionCard(elements.arrivalQuestion, elements.arrivalFeedback);
  resetQuestionCard(elements.departureQuestion, elements.departureFeedback);

  activateCard(elements.seasonQuestion);
  lockCard(elements.arrivalQuestion);
  lockCard(elements.departureQuestion);

  elements.seasonSubmit.disabled = false;
  elements.arrivalSubmit.disabled = false;
  elements.departureSubmit.disabled = false;

  elements.arrivalInput.value = "";
  elements.departureInput.value = "";
  elements.arrivalInput.disabled = false;
  elements.departureInput.disabled = false;
  elements.nextTurnButton.classList.add("hidden");
  elements.turnSummary.classList.add("hidden");

  updateAttemptLabels();
  updateScoreboard();
}

function updateAttemptLabels() {
  const seasonLeft = Math.max(0, seasonPoints.length - state.seasonAttempts);
  const arrivalLeft = Math.max(0, teamPoints.length - state.arrivalAttempts);
  const departureLeft = Math.max(0, teamPoints.length - state.departureAttempts);

  elements.seasonAttemptsText.textContent = `Kalan hak: ${seasonLeft}`;
  elements.arrivalAttemptsText.textContent = `Kalan hak: ${arrivalLeft}`;
  elements.departureAttemptsText.textContent = `Kalan hak: ${departureLeft}`;

  elements.seasonScorePreview.textContent =
    state.seasonAttempts < seasonPoints.length ? `+${seasonPoints[state.seasonAttempts]}` : "+0";
  elements.arrivalScorePreview.textContent =
    state.arrivalAttempts < teamPoints.length ? `+${teamPoints[state.arrivalAttempts]}` : "+0";
  elements.departureScorePreview.textContent =
    state.departureAttempts < teamPoints.length ? `+${teamPoints[state.departureAttempts]}` : "+0";
}

function addScore(points) {
  state.scores[state.currentPlayer] += points;
  updateScoreboard();
}

function updateScoreboard() {
  const isSolo = state.playerCount === 1;
  elements.scoreNameOne.textContent = state.names[0];
  elements.scoreNameTwo.textContent = state.names[1];
  elements.scoreOne.textContent = state.scores[0];
  elements.scoreTwo.textContent = state.scores[1];
  elements.currentPlayerLabel.textContent = state.names[state.currentPlayer];

  elements.scoreboard.classList.toggle("solo-mode", isSolo);
  elements.scoreCardTwo.classList.toggle("hidden", isSolo);
  elements.scoreCardOne.classList.toggle("active-player", state.currentPlayer === 0);
  elements.scoreCardTwo.classList.toggle("active-player", !isSolo && state.currentPlayer === 1);

  if (isSolo) {
    elements.roundIndicator.textContent = `Soru ${state.completedTurns + 1}`;
  } else {
    const displayedRound = Math.floor(state.completedTurns / state.playerCount) + 1;
    elements.roundIndicator.textContent = `${Math.min(displayedRound, state.roundsPerPlayer)} / ${state.roundsPerPlayer}`;
  }
  updateSoloMissionHud();
}

function startGame() {
  const totalNeeded = state.mode === "solo"
    ? state.allPlayers.length
    : state.roundsPerPlayer * state.playerCount;
  let deck = shuffle(state.allPlayers);
  while (deck.length < totalNeeded) deck = deck.concat(shuffle(state.allPlayers));

  state.deck = state.mode === "solo" ? deck : deck.slice(0, totalNeeded);
  state.scores = [0, 0];
  state.currentPlayer = 0;
  state.completedTurns = 0;
  state.history = [];
  state.soloCheckpointStartScore = 0;
  state.soloEliminated = false;

  elements.restartButton.classList.remove("hidden");
  elements.historyButton.classList.remove("hidden");
  elements.handoffPlayerName.textContent = state.names[state.currentPlayer];
  if (state.playerCount === 1) {
    prepareTurn();
    showScreen("game");
  } else {
    showScreen("handoff");
  }
}

function handleSeasonGuess() {
  if (state.currentStage !== "season") return;

  const guessedSeason = elements.seasonInput.value;
  const correctSeason = state.currentFootballer.arrivalSeason;
  const currentPoints = seasonPoints[state.seasonAttempts] ?? 0;

  state.seasonAttempts += 1;

  if (guessedSeason === correctSeason) {
    addScore(currentPoints);
    elements.seasonFeedback.textContent = `Doğru! +${currentPoints} puan`;
    elements.seasonFeedback.className = "feedback success";
    elements.seasonSubmit.disabled = true;
    completeCard(elements.seasonQuestion);
    state.currentStage = "arrival";
    activateCard(elements.arrivalQuestion);
    elements.arrivalInput.focus();
  } else if (state.seasonAttempts >= seasonPoints.length) {
    elements.seasonFeedback.textContent = `Hak bitti. Doğru cevap: ${correctSeason}`;
    elements.seasonFeedback.className = "feedback error";
    elements.seasonSubmit.disabled = true;
    completeCard(elements.seasonQuestion);
    state.currentStage = "arrival";
    activateCard(elements.arrivalQuestion);
  } else {
    const guessedYear = parseSeasonStart(guessedSeason);
    const correctYear = parseSeasonStart(correctSeason);
    const hint = guessedYear < correctYear ? "⬆️ Daha geç bir sezon" : "⬇️ Daha erken bir sezon";
    elements.seasonFeedback.textContent = hint;
    elements.seasonFeedback.className = "feedback error";
  }

  updateAttemptLabels();
}

function handleTeamGuess(type) {
  const isArrival = type === "arrival";
  const stageName = isArrival ? "arrival" : "departure";
  if (state.currentStage !== stageName) return;

  const input = isArrival ? elements.arrivalInput : elements.departureInput;
  const feedback = isArrival ? elements.arrivalFeedback : elements.departureFeedback;
  const submit = isArrival ? elements.arrivalSubmit : elements.departureSubmit;
  const card = isArrival ? elements.arrivalQuestion : elements.departureQuestion;

  const answer = isArrival
    ? state.currentFootballer.arrivalClub
    : state.currentFootballer.departureClub || "Fenerbahçe";

  const aliases = isArrival
    ? state.currentFootballer.arrivalAliases
    : state.currentFootballer.departureClub
      ? state.currentFootballer.departureAliases
      : ["Fenerbahçe'de", "Hâlâ Fenerbahçe'de", "Fenerbahçede", "Hala Fenerbahçede", "FB"];

  if (!input.value.trim()) {
    feedback.textContent = "Önce bir takım adı yaz.";
    feedback.className = "feedback error";
    return;
  }

  const attemptKey = isArrival ? "arrivalAttempts" : "departureAttempts";
  const currentPoints = teamPoints[state[attemptKey]] ?? 0;
  state[attemptKey] += 1;

  if (isAcceptedAnswer(input.value, answer, aliases)) {
    addScore(currentPoints);
    feedback.textContent = `Doğru! +${currentPoints} puan`;
    feedback.className = "feedback success";
    submit.disabled = true;
    completeCard(card);
    moveToNextStage(isArrival);
  } else if (state[attemptKey] >= teamPoints.length) {
    feedback.textContent = `Hak bitti. Doğru cevap: ${answer}`;
    feedback.className = "feedback error";
    submit.disabled = true;
    completeCard(card);
    moveToNextStage(isArrival);
  } else {
    feedback.textContent = "Yanlış cevap, tekrar dene.";
    feedback.className = "feedback error";
    input.select();
  }

  updateAttemptLabels();
}
function saveTurnHistory() {
  const turnScore =
    state.scores[state.currentPlayer] -
    state.turnStartScore;

  const alreadySaved = state.history.some(
    (item) => item.turnIndex === state.completedTurns
  );

  if (alreadySaved) {
    return;
  }

  state.history.push({
    turnIndex: state.completedTurns,
    roundNumber:
      Math.floor(state.completedTurns / state.playerCount) + 1,
    playerName:
      state.names[state.currentPlayer],
    playerIndex:
      state.currentPlayer,
    footballerName:
      state.currentFootballer.name,
    footballerImage:
      state.currentFootballer.image,
    arrivalSeason:
      state.currentFootballer.arrivalSeason,
    arrivalClub:
      state.currentFootballer.arrivalClub,
    departureClub:
      state.currentFootballer.departureClub,
    score:
      turnScore,
  });
}
function getDataReports() {
  try {
    return JSON.parse(
      localStorage.getItem("fenerDataReports")
    ) || [];
  } catch (error) {
    console.error("Hata kayıtları okunamadı:", error);
    return [];
  }
}

function saveDataReports(reports) {
  localStorage.setItem(
    "fenerDataReports",
    JSON.stringify(reports)
  );

  updateReportButton();
}

function updateReportButton() {
  const reports = getDataReports();

  elements.downloadReportsButton.classList.toggle(
    "hidden",
    reports.length === 0
  );
}

function isCurrentFootballerReported() {
  const reports = getDataReports();

  return reports.some(
    (report) =>
      String(report.playerId) ===
      String(state.currentFootballer.id)
  );
}

function updateCurrentReportState() {
  if (!state.currentFootballer) {
    return;
  }

  if (isCurrentFootballerReported()) {
    elements.reportDataButton.textContent =
      "✓ Hata bildirildi";

    elements.reportDataButton.disabled = true;

    elements.reportDataMessage.textContent =
      "Bu oyuncu kontrol listesine eklendi.";
  } else {
    elements.reportDataButton.textContent =
      "⚠ Veri hatası bildir";

    elements.reportDataButton.disabled = false;

    elements.reportDataMessage.textContent = "";
  }
}

function reportCurrentFootballer() {
  if (!state.currentFootballer) {
    return;
  }

  const reports = getDataReports();

  const alreadyReported = reports.some(
    (report) =>
      String(report.playerId) ===
      String(state.currentFootballer.id)
  );

  if (alreadyReported) {
    updateCurrentReportState();
    return;
  }

  const reason = window.prompt(
    "Hangi bilgi hatalı? Örneğin: geldiği takım yanlış, gittiği takım yanlış veya sezon yanlış."
  );

  if (reason === null) {
    return;
  }

  reports.push({
    playerId: state.currentFootballer.id,
    playerName: state.currentFootballer.name,

    arrivalSeason:
      state.currentFootballer.arrivalSeason,

    arrivalClub:
      state.currentFootballer.arrivalClub,

    departureClub:
      state.currentFootballer.departureClub,

    reason:
      reason.trim() || "Sebep belirtilmedi",

    reportedBy:
      state.names[state.currentPlayer],

    reportedAt:
      new Date().toISOString(),
  });

  saveDataReports(reports);
  updateCurrentReportState();
}

function downloadDataReports() {
  const reports = getDataReports();

  if (reports.length === 0) {
    alert("Henüz hata bildirimi bulunmuyor.");
    return;
  }

  const jsonContent = JSON.stringify(
    reports,
    null,
    2
  );

  const blob = new Blob(
    [jsonContent],
    { type: "application/json" }
  );

  const downloadUrl =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = downloadUrl;
  link.download = "veri-hata-kayitlari.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(downloadUrl);
}
function showTurnSummary() {
  saveTurnHistory();

  const footballer = state.currentFootballer;

  const turnScore =
    state.scores[state.currentPlayer] -
    state.turnStartScore;

  elements.summaryPlayerImage.src =
    footballer.image;

  elements.summaryPlayerName.textContent =
    footballer.name;

  elements.summarySeason.textContent =
    `${footballer.arrivalSeason} sezonunda geldi`;

  elements.summaryArrivalClub.textContent =
    footballer.arrivalClub || "Bilinmiyor";

  elements.summaryDepartureClub.textContent =
    footballer.departureClub ||
    "Ayrılış kaydı yok";

  elements.summaryTurnScore.textContent =
    turnScore;

  setSummaryLogo(
    elements.summaryArrivalLogo,
    footballer.arrivalClubLogo
  );

  setSummaryLogo(
    elements.summaryDepartureLogo,
    footballer.departureClubLogo
  );

  elements.turnSummary.classList.remove("hidden");
  elements.nextTurnButton.textContent =
    state.mode === "solo" ? "Sıradaki futbolcu" : "Sırayı değiştir";
  elements.nextTurnButton.classList.remove("hidden");
  updateCurrentReportState();

  if (state.mode === "solo") {
    window.dispatchEvent(new CustomEvent("soloScoreUpdated", {
      detail: { name: state.names[0], score: state.scores[0] },
    }));
  }
}
function renderHistory() {
  if (state.history.length === 0) {
    elements.historyList.innerHTML = `
      <div class="empty-history">
        Henüz tamamlanan bir tur yok.
      </div>
    `;

    return;
  }

  elements.historyList.innerHTML = state.history
    .map((item) => {
      const departureText =
        item.departureClub ||
        "Ayrılış kaydı yok";

      return `
        <article class="history-item">

          <img
            src="${item.footballerImage}"
            alt="${item.footballerName}"
          />

          <div class="history-info">

            <div class="history-title">
              <strong>${item.playerName}</strong>

              <span>
                ${item.score} puan
              </span>
            </div>

            <h3>${item.footballerName}</h3>

            <p>
              ${item.roundNumber}. tur •
              ${item.arrivalSeason}
            </p>

            <small>
              ${item.arrivalClub || "Bilinmiyor"}
              → Fenerbahçe →
              ${departureText}
            </small>

          </div>

        </article>
      `;
    })
    .join("");
}

function openHistory() {
  renderHistory();
  elements.historyModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeHistory() {
  elements.historyModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}
function moveToNextStage(wasArrival) {
  if (wasArrival) {


    state.currentStage = "departure";

    elements.departureInput.disabled = false;

    activateCard(
      elements.departureQuestion
    );

    elements.departureInput.focus();

  } else {

    state.currentStage = "done";
    showTurnSummary();

  }

}
function setSummaryLogo(imageElement, logoUrl) {
  if (!logoUrl) {
    imageElement.style.display = "none";
    return;
  }

  imageElement.style.display = "block";
  imageElement.src = logoUrl;

  imageElement.onerror = () => {
    imageElement.style.display = "none";
  };
}
function goToNextTurn() {
  state.completedTurns += 1;

  if (state.mode === "solo" && state.completedTurns % 5 === 0) {
    const completedCheckpoint = state.completedTurns / 5;
    const checkpointScore = state.scores[0] - state.soloCheckpointStartScore;
    if (checkpointScore < getSoloTarget(completedCheckpoint)) {
      state.soloEliminated = true;
      finishGame();
      return;
    }
    state.soloCheckpointStartScore = state.scores[0];
  }

  if (state.mode !== "solo" && state.completedTurns >= state.roundsPerPlayer * state.playerCount) {
    finishGame();
    return;
  }

  state.currentPlayer = state.completedTurns % state.playerCount;
  elements.handoffPlayerName.textContent = state.names[state.currentPlayer];
  if (state.playerCount === 1) {
    prepareTurn();
    showScreen("game");
  } else {
    showScreen("handoff");
  }
}

function finishGame() {
  const isSolo = state.playerCount === 1;
  elements.finalNameOne.textContent = state.names[0];
  elements.finalNameTwo.textContent = state.names[1];
  elements.finalScoreOne.textContent = state.scores[0];
  elements.finalScoreTwo.textContent = state.scores[1];
  elements.finalScoreTwoCard.classList.toggle("hidden", isSolo);
  elements.soloRecordText.classList.toggle("hidden", !isSolo);

  if (isSolo) {
    const previousBest = Number(localStorage.getItem("fenerSoloBestScore") || 0);
    const isNewRecord = state.scores[0] > previousBest;
    const bestScore = Math.max(previousBest, state.scores[0]);
    localStorage.setItem("fenerSoloBestScore", String(bestScore));
    elements.soloBestScore.textContent = bestScore;
    elements.winnerText.textContent = state.soloEliminated
      ? `${state.completedTurns}. soruda elendin`
      : `${state.scores[0]} puan topladın!`;
    elements.soloRecordText.textContent = `${state.scores[0]} puan • ${state.completedTurns} soru` +
      (isNewRecord ? ` • Yeni rekor!` : ` • Rekor: ${bestScore}`);
  } else if (state.scores[0] === state.scores[1]) {
    elements.winnerText.textContent = "Berabere!";
  } else {
    const winnerIndex = state.scores[0] > state.scores[1] ? 0 : 1;
    elements.winnerText.textContent = `${state.names[winnerIndex]} kazandı!`;
  }

  showScreen("result");
}

function resetToSetup() {
  showScreen("setup");

  elements.restartButton.classList.add("hidden");
  elements.historyButton.classList.add("hidden");

  closeHistory();
}

elements.modeTabs.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedMode = button.dataset.modeTab;
    elements.modeTabs.forEach((tab) => tab.classList.toggle("active", tab === button));
    elements.modePanels.forEach((panel) => {
      const active = panel.dataset.modePanel === selectedMode;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  });
});
elements.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  state.playerCount = 2;
  state.mode = "local";
  state.names = [
    elements.playerOneInput.value.trim() || "Oyuncu 1",
    elements.playerTwoInput.value.trim() || "Oyuncu 2",
  ];
  state.roundsPerPlayer = Number(elements.roundCountInput.value);
  startGame();
});


elements.startSoloButton.addEventListener("click", () => {
  state.playerCount = 1;
  state.mode = "solo";
  state.names = [elements.soloNameInput.value.trim() || "Oyuncu", ""];
  startGame();
});
elements.revealButton.addEventListener("click", () => {
  prepareTurn();
  showScreen("game");
});

elements.seasonSubmit.addEventListener("click", handleSeasonGuess);
elements.arrivalSubmit.addEventListener("click", () => handleTeamGuess("arrival"));
elements.departureSubmit.addEventListener("click", () => handleTeamGuess("departure"));
elements.nextTurnButton.addEventListener("click", goToNextTurn);
elements.playAgainButton.addEventListener("click", startGame);
elements.restartButton.addEventListener("click", resetToSetup);

function handleTeamInputEnter(event, type, suggestionsBox) {
  if (event.key !== "Enter") return;
  event.preventDefault();

  const firstSuggestion = suggestionsBox.querySelector(".suggestion-item");
  if (!suggestionsBox.classList.contains("hidden") && firstSuggestion) {
    firstSuggestion.click();
    return;
  }

  handleTeamGuess(type);
}

elements.arrivalInput.addEventListener("keydown", (event) => {
  handleTeamInputEnter(event, "arrival", elements.arrivalSuggestions);
});

elements.departureInput.addEventListener("keydown", (event) => {
  handleTeamInputEnter(event, "departure", elements.departureSuggestions);
});

async function initialise() {
  buildSeasonOptions();
  elements.soloBestScore.textContent = localStorage.getItem("fenerSoloBestScore") || "0";
  updateReportButton();

  try {
    await loadPlayers();
  } catch (error) {
    alert("Oyuncu verileri yüklenemedi. Siteyi Live Server ile açtığından emin ol.");
    console.error(error);
  }
}
elements.arrivalInput.addEventListener("input", () => {
  showClubSuggestions(
    elements.arrivalInput,
    elements.arrivalSuggestions
  );
});

elements.departureInput.addEventListener("input", () => {
  showClubSuggestions(
    elements.departureInput,
    elements.departureSuggestions
  );
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".autocomplete")) {
    elements.arrivalSuggestions.classList.add("hidden");
    elements.departureSuggestions.classList.add("hidden");
  }
});
elements.historyButton.addEventListener(
  "click",
  openHistory
);

elements.closeHistoryButton.addEventListener(
  "click",
  closeHistory
);

elements.historyBackdrop.addEventListener(
  "click",
  closeHistory
);

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !elements.historyModal.classList.contains("hidden")
  ) {
    closeHistory();
  }
});
elements.reportDataButton.addEventListener(
  "click",
  reportCurrentFootballer
);

elements.downloadReportsButton.addEventListener(
  "click",
  downloadDataReports
);
initialise();

