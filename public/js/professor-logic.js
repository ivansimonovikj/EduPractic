/**
 * Функција за отворање на модалот со претходно пополнети вредности
 * @param {string} appId - ID на апликацијата од базата
 * @param {number} currentDays - Моменталниот број на денови
 */
function openSettings(appId, currentDays) {
  const modal = document.getElementById("settingsModal");
  const appIdInput = document.getElementById("modalAppId");
  const daysInput = document.getElementById("modalDays");

  if (modal && appIdInput && daysInput) {
    appIdInput.value = appId;
    daysInput.value = currentDays;

    modal.style.display = "flex";
    // Анимација со Anime.js ако го користиш
    if (typeof anime !== "undefined") {
      anime({
        targets: "#settingsModal > div",
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 300,
        easing: "easeOutExpo",
      });
    }
  }
}

/**
 * Затворање на модалот
 */
function closeModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Затвори го модалот ако се кликне надвор од него
window.onclick = function (event) {
  const modal = document.getElementById("settingsModal");
  if (event.target == modal) {
    closeModal();
  }
};

// Едноставно пребарување во табелата
document
  .querySelector(".search-box input")
  ?.addEventListener("keyup", function (e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll(".hub-table tbody tr");

    rows.forEach((row) => {
      const studentName = row
        .querySelector("strong")
        ?.textContent.toLowerCase();
      if (studentName && studentName.includes(term)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
