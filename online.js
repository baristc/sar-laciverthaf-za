const online = {
  peer: null,
  connection: null,
  enabled: false,
  isHost: false,
  localPlayer: null,
  roomCode: "",
};

const onlineElements = {
  name: document.getElementById("onlineNameInput"),
  rounds: document.getElementById("onlineRoundCount"),
  code: document.getElementById("roomCodeInput"),
  create: document.getElementById("createRoomButton"),
  join: document.getElementById("joinRoomButton"),
  status: document.getElementById("onlineStatus"),
  codeDisplay: document.getElementById("roomCodeDisplay"),
  codeValue: document.getElementById("roomCodeValue"),
};

function setOnlineStatus(message, isError = false) {
  onlineElements.status.textContent = message;
  onlineElements.status.classList.toggle("error", isError);
}

function generateRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getActiveScreenName() {
  return Object.entries(screens).find(([, element]) => element.classList.contains("active"))?.[0] || "setup";
}

function serialisableState() {
  return {
    deck: state.deck,
    names: state.names,
    scores: state.scores,
    currentPlayer: state.currentPlayer,
    completedTurns: state.completedTurns,
    roundsPerPlayer: state.roundsPerPlayer,
    currentFootballer: state.currentFootballer,
    seasonAttempts: state.seasonAttempts,
    arrivalAttempts: state.arrivalAttempts,
    departureAttempts: state.departureAttempts,
    currentStage: state.currentStage,
    turnStartScore: state.turnStartScore,
    history: state.history,
  };
}

function sendSnapshot() {
  if (!online.enabled || !online.connection?.open) return;
  online.connection.send({
    type: "snapshot",
    screen: getActiveScreenName(),
    state: serialisableState(),
  });
}

function applyQuestionStage() {
  resetQuestionCard(elements.seasonQuestion, elements.seasonFeedback);
  resetQuestionCard(elements.arrivalQuestion, elements.arrivalFeedback);
  resetQuestionCard(elements.departureQuestion, elements.departureFeedback);
  lockCard(elements.arrivalQuestion);
  lockCard(elements.departureQuestion);

  if (state.currentStage === "season") {
    activateCard(elements.seasonQuestion);
  } else {
    completeCard(elements.seasonQuestion);
    if (state.currentStage === "arrival") {
      activateCard(elements.arrivalQuestion);
    } else {
      completeCard(elements.arrivalQuestion);
      if (state.currentStage === "departure") {
        activateCard(elements.departureQuestion);
      } else {
        completeCard(elements.departureQuestion);
      }
    }
  }

  elements.turnSummary.classList.toggle("hidden", state.currentStage !== "done");
  elements.nextTurnButton.classList.toggle("hidden", state.currentStage !== "done");
  if (state.currentStage === "done") showTurnSummary();
}

function updateOnlineTurnAccess() {
  if (!online.enabled) return;
  const isMyTurn = state.currentPlayer === online.localPlayer;
  const isDone = state.currentStage === "done";

  elements.revealButton.disabled = !isMyTurn;
  elements.revealButton.textContent = isMyTurn
    ? "Hazırım, futbolcuyu göster"
    : `${state.names[state.currentPlayer]} oynuyor`;
  elements.seasonSubmit.disabled = !isMyTurn || state.currentStage !== "season";
  elements.arrivalSubmit.disabled = !isMyTurn || state.currentStage !== "arrival";
  elements.departureSubmit.disabled = !isMyTurn || state.currentStage !== "departure";
  elements.arrivalInput.disabled = !isMyTurn || state.currentStage !== "arrival";
  elements.departureInput.disabled = !isMyTurn || state.currentStage !== "departure";
  elements.nextTurnButton.disabled = !isMyTurn || !isDone;
}

function renderSnapshot(screenName) {
  updateScoreboard();
  elements.handoffPlayerName.textContent = state.names[state.currentPlayer];

  if (state.currentFootballer) {
    elements.footballerImage.src = state.currentFootballer.image;
    elements.footballerImage.alt = `${state.currentFootballer.name} görseli`;
    elements.footballerName.textContent = state.currentFootballer.name;
    updateAttemptLabels();
    applyQuestionStage();
  }

  if (screenName === "result") {
    finishGame();
  } else {
    showScreen(screenName);
  }
  updateOnlineTurnAccess();
}

function applySnapshot(message) {
  Object.assign(state, message.state);
  renderSnapshot(message.screen);
}

function bindConnection(connection) {
  online.connection = connection;

  connection.on("open", () => {
    setOnlineStatus("Bağlantı kuruldu. Oyun hazırlanıyor…");
    if (!online.isHost) {
      connection.send({
        type: "join",
        name: onlineElements.name.value.trim() || "Oyuncu 2",
      });
    }
  });

  connection.on("data", (message) => {
    if (message.type === "join" && online.isHost) {
      state.names = [
        onlineElements.name.value.trim() || "Oyuncu 1",
        message.name || "Oyuncu 2",
      ];
      state.roundsPerPlayer = Number(onlineElements.rounds.value);
      startGame();
      setOnlineStatus(`${state.names[1]} odaya katıldı.`);
      sendSnapshot();
      updateOnlineTurnAccess();
    } else if (message.type === "snapshot") {
      applySnapshot(message);
    }
  });

  connection.on("close", () => {
    setOnlineStatus("Rakibin bağlantısı kapandı.", true);
  });

  connection.on("error", () => {
    setOnlineStatus("Bağlantıda bir hata oluştu.", true);
  });
}

function createRoom() {
  if (typeof Peer === "undefined") {
    setOnlineStatus("Çevrimiçi bağlantı kütüphanesi yüklenemedi.", true);
    return;
  }
  const playerName = onlineElements.name.value.trim();
  if (!playerName) {
    setOnlineStatus("Önce oyuncu adını yaz.", true);
    onlineElements.name.focus();
    return;
  }

  online.roomCode = generateRoomCode();
  online.enabled = true;
  online.isHost = true;
  online.localPlayer = 0;
  online.peer = new Peer(`fener-transfer-${online.roomCode}`);
  setOnlineStatus("Oda oluşturuluyor…");

  online.peer.on("open", () => {
    onlineElements.codeValue.textContent = online.roomCode;
    onlineElements.codeDisplay.classList.remove("hidden");
    setOnlineStatus("Rakibin oda koduyla katılması bekleniyor.");
  });
  online.peer.on("connection", bindConnection);
  online.peer.on("error", (error) => {
    setOnlineStatus(error.type === "unavailable-id" ? "Oda kodu çakıştı, tekrar dene." : "Oda oluşturulamadı.", true);
  });
}

function joinRoom() {
  if (typeof Peer === "undefined") {
    setOnlineStatus("Çevrimiçi bağlantı kütüphanesi yüklenemedi.", true);
    return;
  }
  const playerName = onlineElements.name.value.trim();
  const code = onlineElements.code.value.replace(/\D/g, "");
  if (!playerName || code.length !== 6) {
    setOnlineStatus("Oyuncu adını ve altı haneli oda kodunu gir.", true);
    return;
  }

  online.roomCode = code;
  online.enabled = true;
  online.isHost = false;
  online.localPlayer = 1;
  online.peer = new Peer();
  setOnlineStatus("Odaya bağlanılıyor…");

  online.peer.on("open", () => {
    bindConnection(online.peer.connect(`fener-transfer-${code}`, { reliable: true }));
  });
  online.peer.on("error", () => setOnlineStatus("Oda bulunamadı veya bağlantı kurulamadı.", true));
}

onlineElements.create.addEventListener("click", createRoom);
onlineElements.join.addEventListener("click", joinRoom);
onlineElements.code.addEventListener("input", () => {
  onlineElements.code.value = onlineElements.code.value.replace(/\D/g, "").slice(0, 6);
});

// Mevcut oyun işleyicileri çalıştıktan sonra yeni durumu rakibe gönderir.
document.addEventListener("click", (event) => {
  if (!online.enabled || !event.target.closest("#revealButton, #seasonSubmit, #arrivalSubmit, #departureSubmit, #nextTurnButton, #playAgainButton")) return;
  window.setTimeout(() => {
    updateOnlineTurnAccess();
    sendSnapshot();
  }, 0);
});

document.addEventListener("keydown", (event) => {
  if (!online.enabled || event.key !== "Enter" || !event.target.matches("#arrivalInput, #departureInput")) return;
  window.setTimeout(sendSnapshot, 0);
});

window.addEventListener("beforeunload", () => online.peer?.destroy());
