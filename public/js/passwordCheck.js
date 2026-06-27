document.addEventListener("DOMContentLoaded", () => {
  // Селектирање на сите потребни елементи
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");
  const strengthWrapper = document.getElementById("password-strength-wrapper");
  const matchText = document.getElementById("match-text");
  const registerBtn = document.querySelector('button[type="submit"]');

  // --- 1. ЛОГИКА ЗА ПОКАЖУВАЊЕ/КРИЕЊЕ ЛОЗИНКА (ОКОТО) ---
  window.togglePass = (id) => {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling; // Иконата е веднаш по инпутот

    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  };

  // --- 2. ЛОГИКА ЗА ЈАЧИНА НА ЛОЗИНКА ---
  const updateStrength = () => {
    if (!strengthWrapper || !strengthBar || !strengthText) return;

    const val = passwordInput.value;
    strengthWrapper.style.display = val.length > 0 ? "block" : "none";

    let strength = 0;
    if (val.length >= 8) strength++; // Зголемено на 8 за подобра безбедност
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) strength++;
    if (/\d/.test(val) || /[^a-zA-Z\d]/.test(val)) strength++;

    strengthBar.className = ""; // Ресетирај класи

    if (val.length === 0) {
      strengthText.innerText = "";
    } else if (strength === 1) {
      strengthBar.classList.add("strength-weak");
      strengthText.innerText = "Слаба лозинка ❌";
      strengthText.style.color = "#ef4444";
    } else if (strength === 2) {
      strengthBar.classList.add("strength-medium");
      strengthText.innerText = "Средна лозинка ⚠️";
      strengthText.style.color = "#f59e0b";
    } else if (strength === 3) {
      strengthBar.classList.add("strength-strong");
      strengthText.innerText = "Силна лозинка ✅";
      strengthText.style.color = "#22c55e";
    }
  };

  // --- 3. ЛОГИКА ЗА ПОВРЗУВАЊЕ (MATCH) НА ДВЕТЕ ЛОЗИНКИ ---
  const checkMatch = () => {
    const p1 = passwordInput.value;
    const p2 = confirmInput.value;

    if (p2.length === 0) {
      matchText.innerText = "";
      return;
    }

    if (p1 === p2) {
      matchText.innerText = "✅ Лозинките се совпаѓаат";
      matchText.style.color = "#22c55e";
      registerBtn.disabled = false;
      registerBtn.style.opacity = "1";
    } else {
      matchText.innerText = "❌ Лозинките не се совпаѓаат";
      matchText.style.color = "#ef4444";
      registerBtn.disabled = true;
      registerBtn.style.opacity = "0.6";
    }
  };

  // Постави "слушалки" за настани
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      updateStrength();
      checkMatch();
    });
  }

  if (confirmInput) {
    confirmInput.addEventListener("input", checkMatch);
  }
});
