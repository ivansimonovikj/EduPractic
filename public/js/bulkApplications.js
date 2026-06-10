document.addEventListener("DOMContentLoaded", function () {
  const selectAll = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll(".app-checkbox");
  const bulkForm = document.getElementById("bulkArchiveForm");
  const selectedIdsInput = document.getElementById("selectedIdsInput");
  const selectedCount = document.getElementById("selectedCount");

  function updateBulkUI() {
    const selected = Array.from(checkboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    if (selected.length > 0) {
      bulkForm.style.display = "block";
      selectedIdsInput.value = JSON.stringify(selected);
      selectedCount.textContent = selected.length;
    } else {
      bulkForm.style.display = "none";
    }
  }

  selectAll.addEventListener("change", function () {
    checkboxes.forEach((cb) => (cb.checked = selectAll.checked));
    updateBulkUI();
  });

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", updateBulkUI);
  });
});
