const notifBtn = document.getElementById("notifBtn");
const notifMenu = document.getElementById("notifMenu");

if (notifBtn) {
  notifBtn.addEventListener("click", (e) => {
    e.preventDefault();
    notifMenu.classList.toggle("show");
  });

  // Затвори го менито ако се кликне надвор од него
  window.addEventListener("click", (e) => {
    if (!notifBtn.contains(e.target) && !notifMenu.contains(e.target)) {
      notifMenu.classList.remove("show");
    }
  });
}
