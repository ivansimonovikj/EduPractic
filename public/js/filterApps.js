/**
 * Филтрирање на апликации на фронтенд
 * @param {string} filter - 'all', 'active', 'completed'
 * @param {HTMLElement} btn - Копчето кое е кликнато
 */
function filterApps(filter, btn) {
  // 1. Ажурирај го изгледот на копчињата
  const allButtons = document.querySelectorAll(".btn-filter");
  allButtons.forEach((b) => {
    b.classList.remove("active");
    b.style.background = "#f1f5f9"; // reset боја
    b.style.color = "#64748b";
  });

  btn.classList.add("active");
  btn.style.background = "#4f46e5"; // активна боја (индиго)
  btn.style.color = "white";

  const rows = document.querySelectorAll(".app-row");

  rows.forEach((row) => {
    const status = row.getAttribute("data-status") || "";

    switch (filter) {
      case "all":
        row.style.display = "table-row";
        break;

      case "completed":
        // ПРИКАЖИ: Само завршени И архивирани
        if (status === "completed" || status === "archived") {
          row.style.display = "table-row";
        } else {
          row.style.display = "none";
        }
        break;

      case "active":
        // ПРИКАЖИ: Сè што НЕ е завршено, НЕ е архивирано и НЕ е одбиено
        if (
          status !== "completed" &&
          status !== "archived" &&
          status !== "одбиено"
        ) {
          row.style.display = "table-row";
        } else {
          row.style.display = "none";
        }
        break;

      default:
        row.style.display = "table-row";
    }
  });
}
