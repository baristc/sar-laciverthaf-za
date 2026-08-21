const installAppButton = document.getElementById("installAppButton");
let deferredInstallPrompt = null;

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

if (isIos && !isStandalone) {
  installAppButton.classList.remove("hidden");
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installAppButton.classList.remove("hidden");
});

installAppButton.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installAppButton.classList.add("hidden");
    return;
  }

  if (isIos) {
    alert("Safari'de Paylaş düğmesine dokunup ‘Ana Ekrana Ekle’ seçeneğini kullan.");
    return;
  }

  alert("Tarayıcı menüsünden ‘Uygulamayı yükle’ veya ‘Ana ekrana ekle’ seçeneğini kullan.");
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installAppButton.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Uygulama çevrimdışı desteği başlatılamadı:", error);
    });
  });
}