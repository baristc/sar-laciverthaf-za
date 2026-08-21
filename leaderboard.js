(() => {
  "use strict";

  const API_URL = "api/leaderboard.php";
  const list = document.getElementById("dailyLeaderboardList");
  const status = document.getElementById("leaderboardStatus");
  const recordName = document.getElementById("allTimeRecordName");
  const recordScore = document.getElementById("allTimeRecordScore");
  const soloNameInput = document.getElementById("soloNameInput");
  let submitTimer = null;
  let lastSubmitted = { name: "", score: -1 };

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("error", isError);
  }

  function render(data) {
    list.replaceChildren();
    const daily = Array.isArray(data.daily) ? data.daily : [];

    if (daily.length === 0) {
      const empty = document.createElement("li");
      empty.className = "leaderboard-empty";
      empty.textContent = "Bugünün ilk skorunu sen yap!";
      list.appendChild(empty);
    } else {
      daily.forEach((entry, index) => {
        const item = document.createElement("li");
        const rank = document.createElement("span");
        const name = document.createElement("strong");
        const score = document.createElement("b");
        rank.className = "leaderboard-rank";
        rank.textContent = String(index + 1);
        name.textContent = entry.name;
        score.textContent = `${entry.score} puan`;
        item.append(rank, name, score);
        list.appendChild(item);
      });
    }

    if (data.allTime) {
      recordName.textContent = data.allTime.name;
      recordScore.textContent = data.allTime.score;
    } else {
      recordName.textContent = "Henüz skor yok";
      recordScore.textContent = "—";
    }
  }

  async function loadLeaderboard() {
    try {
      const response = await fetch(API_URL, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error("Skor tablosu alınamadı");
      render(data);
      setStatus("");
    } catch (error) {
      list.replaceChildren();
      const empty = document.createElement("li");
      empty.className = "leaderboard-empty";
      empty.textContent = "Skor tablosu şu anda yüklenemiyor.";
      list.appendChild(empty);
      setStatus("Sunucu ayarı tamamlanınca skorlar burada görünecek.", true);
    }
  }

  async function submitScore(name, score) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error("Skor kaydedilemedi");
      render(data);
      setStatus("Skorun kaydedildi.");
    } catch (error) {
      setStatus("Skor kaydedilemedi; internet bağlantını kontrol et.", true);
    }
  }

  window.addEventListener("soloScoreUpdated", (event) => {
    const name = String(event.detail?.name || soloNameInput?.value || "").trim();
    const score = Number(event.detail?.score);
    if (!name || name.toLocaleLowerCase("tr-TR") === "oyuncu" || !Number.isInteger(score) || score < 0) return;
    if (lastSubmitted.name === name && score <= lastSubmitted.score) return;
    lastSubmitted = { name, score };
    window.clearTimeout(submitTimer);
    submitTimer = window.setTimeout(() => submitScore(name, score), 500);
  });

  loadLeaderboard();
})();