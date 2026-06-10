let map;
let marker;
let searchBox;

function initMap() {
  const latInput = document.getElementById("compLat");
  const lngInput = document.getElementById("compLng");
  const searchInput = document.getElementById("pac-input");

  if (!latInput || !lngInput) return;

  // 1. ПРЕЦИЗНО ЧИТАЊЕ НА КОРДИНАТИТЕ
  // Го користиме parseFloat за да бидеме сигурни дека се броеви
  const savedLat = parseFloat(latInput.value);
  const savedLng = parseFloat(lngInput.value);

  // Проверка: Ако во базата нема вредност (NaN), користи дефолт Скопје
  const initialLat = !isNaN(savedLat) ? savedLat : 41.9981;
  const initialLng = !isNaN(savedLng) ? savedLng : 21.4254;

  const myLatLng = { lat: initialLat, lng: initialLng };

  // 2. ИНИЦИЈАЛИЗАЦИЈА НА МАПАТА
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: myLatLng,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: "greedy", // Подобро искуство за скролање на мобилен
  });

  // 3. ИНИЦИЈАЛИЗАЦИЈА НА МАРКЕРОТ (ИГЛАТА)
  marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    title: "Повлечи ме за точна локација",
  });

  // 4. ПОВРЗУВАЊЕ НА AUTOCOMPLETE ПРЕБАРУВАЧОТ
  if (searchInput) {
    searchBox = new google.maps.places.SearchBox(searchInput);

    // Мапата да ги следи границите на пребарувањето
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });

    // ЛОГИКА ПРИ ИЗБОР ОД ПРЕБАРУВАЊЕ
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();

      if (places.length == 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      // Помести ја мапата
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }

      // Помести ја иглата
      marker.setPosition(place.geometry.location);

      // ВАЖНО: Ажурирај ги вредностите во input полињата
      updateInputs(
        place.geometry.location.lat(),
        place.geometry.location.lng(),
      );
    });
  }

  // 5. ЛОГИКА ПРИ РАЧНО ВЛЕЧЕЊЕ НА ИГЛАТА
  google.maps.event.addListener(marker, "dragend", function (event) {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();

    updateInputs(newLat, newLng);
    map.panTo(event.latLng);
  });

  // Помошна функција за ажурирање на вредностите
  function updateInputs(lat, lng) {
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);

    // Мал визуелен ефект за да знае корисникот дека вредноста е сменета
    latInput.style.backgroundColor = "#e8f0fe";
    lngInput.style.backgroundColor = "#e8f0fe";
    setTimeout(() => {
      latInput.style.backgroundColor = "#f8fafc";
      lngInput.style.backgroundColor = "#f8fafc";
    }, 500);
  }
}
