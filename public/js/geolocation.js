function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Радиус на Земјата во метри
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Резултат во метри
}

function verifyLocation() {
  const status = document.getElementById("locationStatus");
  const box = document.getElementById("locationBox");
  const btn = document.getElementById("locBtn");
  const submitBtn = document.getElementById("submitBtn");

  // Овие ID-а мора да се исти како во твојот EJS
  const studentLatInput = document.getElementById("studentLat");
  const studentLngInput = document.getElementById("studentLng");
  const targetLat = parseFloat(document.getElementById("targetLat").value);
  const targetLng = parseFloat(document.getElementById("targetLng").value);

  if (!targetLat || !targetLng) {
    alert("Компанијата нема поставено локација во својот профил.");
    return;
  }

  status.innerHTML =
    '<div class="spinner-border spinner-border-sm text-primary me-2"></div> Се проверува...';
  btn.disabled = true;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const studentLat = position.coords.latitude;
        const studentLng = position.coords.longitude;

        // Ги полниме скриените полиња за да се испратат во POST рутата
        studentLatInput.value = studentLat;
        studentLngInput.value = studentLng;

        const distance = calculateDistance(
          studentLat,
          studentLng,
          targetLat,
          targetLng,
        );
        const radius = 200; // Дозволени 200 метри од фирмата

        if (distance <= radius) {
          status.innerHTML = `<span class="text-success fw-bold"><i class="fas fa-check-circle"></i> Локацијата е потврдена! (${Math.round(distance)}m)</span>`;
          box.style.borderColor = "#10b981";
          box.style.background = "#f0fdf4";
          submitBtn.classList.remove("disabled");
          submitBtn.disabled = false;
        } else {
          status.innerHTML = `<span class="text-danger fw-bold"><i class="fas fa-times-circle"></i> Премногу сте далеку! (${Math.round(distance)}m)</span>`;
          box.style.borderColor = "#ef4444";
          box.style.background = "#fef2f2";
          btn.disabled = false; // Овозможи му да проба пак
        }
      },
      (error) => {
        status.innerHTML =
          '<span class="text-danger">❌ Мора да дозволите пристап до локација.</span>';
        btn.disabled = false;
      },
      { enableHighAccuracy: true },
    );
  } else {
    status.innerHTML = "Геолокацијата не е поддржана од вашиот прелистувач.";
  }
}
