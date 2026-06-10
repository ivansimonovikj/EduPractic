/**
 * Функција за покажување/криење на полето за училиште
 * во зависност од избраната улога.
 */
function toggleSchoolField() {
  const roleSelect = document.getElementById("roleSelect");
  const schoolGroup = document.getElementById("schoolGroup");
  const schoolInput = document.getElementById("schoolInput");
  const schoolLabel = document.getElementById("schoolLabel");

  const selectedRole = roleSelect.value;

  if (selectedRole === "student" || selectedRole === "professor") {
    // Покажи го полето за ученици и професори
    schoolGroup.style.display = "block";
    schoolInput.required = true;

    // Мала промена на текстот во зависност од улогата
    if (selectedRole === "professor") {
      schoolLabel.innerText = "Училиште во кое предавате";
    } else {
      schoolLabel.innerText = "Училиште / Образовен центар";
    }
  } else {
    // Сокриј го за компании
    schoolGroup.style.display = "none";
    schoolInput.required = false;
    schoolInput.value = ""; // Чистиме вредност
  }
}

/**
 * Функција за менување на видливоста на лозинката (Eye icon)
 */
function togglePass(id) {
  const input = document.getElementById(id);
  const icon = event.target;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Иницијално извршување за да се постави точната состојба при вчитување
document.addEventListener("DOMContentLoaded", toggleSchoolField);
