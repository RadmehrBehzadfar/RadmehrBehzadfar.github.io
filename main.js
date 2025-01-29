const API_KEY = "bd8ab7dcb2bf49673795cf609c27a5a1"; // this is my personal API key that I've got from the openweathermap.org

// HTML references
// here are the html refrences that are being fetched from the index.html file.
// they have different usage and different functionalities.
// most of them are being used to populate the data into the elements (giving back the data to the user).
const searchInput = document.getElementById("searchInput"); // this is the function that receive the input from the html which is
//  previously entered by the user and give to searchHandler function to handle the search.
const searchBtn = document.getElementById("searchBtn"); // this is the function that is being used to trigger the searchHandler function and bunch of other
// functions that are being used to apply the changes to the pageniation and the other elements.
const errorMessage = document.getElementById("errorMessage"); // this is the function that is being used to both handle the error messages and also
// to display the error messages to the user.
const resultsContainer = document.getElementById("resultsContainer"); // this function is used to calculate the number of pages needed to display
//  the results
const unitSelect = document.getElementById("unitSelect"); // this function is used to select the unit of the temperature that is being displayed
// wheather it is celcius or farenheit.
const dataModeSelect = document.getElementById("dataModeSelect"); // this function is used to select the mode of the data that is being displayed
// weather it is JSON or XML

// pagination, these are all here to handle the pagination of the results that are being displayed to the user.
const paginationControls = document.getElementById("paginationControls"); // this function is used to display the pagination controls to the user
const prevPageBtn = document.getElementById("prevPageBtn"); // this function is used to go to the previous page of the results
const nextPageBtn = document.getElementById("nextPageBtn"); // this function is used to go to the next page of the results
const currentPageNum = document.getElementById("currentPageNum"); //this function is used to display the current page number to the user
const totalPagesNum = document.getElementById("totalPagesNum"); // this function is used to display the total number of pages to the user

// current location weather
//these functions are very vital and important because they are the functions that receive the permission from the user to access the location
// and then fetch the data from the openweathermap.org and then display the data to the user.
const currentLocationWeather = document.getElementById("currentLocationWeather");
// here it is used to display the current location weather to the user.
const currentWeatherCardBody = document.getElementById("currentWeatherCardBody");

// day/night toggle button
const toggleModeBtn = document.getElementById("toggleModeBtn"); // this button is used to toggle the day and night mode of the page.

// map
// here there is a map section that is being used to display the map to the user.
// the instruction to implement this part is received from different sources from internet.
// But it is fully implemented by me.
let map;
let markersLayerGroup;
const mapSection = document.getElementById("mapSection");

// state
// here we are defining the state of the page. wehther if there are ,more than one page or not, or etc...
let currentResults = [];
let currentPage = 1;
const itemsPerPage = 3;

// Cache
const resultsCache = {};

document.addEventListener("DOMContentLoaded", () => { // as we already know from the addEventListener that it needs
//  a triger point whih here is the fully loaded DOM.
  initMap();

  if ("geolocation" in navigator) { // this checks if the browser supports geolocation or not.
    navigator.geolocation.getCurrentPosition(async (pos) => { // here async is there because we are using await inside it and await is used to wait for the promise to resolve.
      // navigator.geolocation this access the Geolocation API, which provides web applications with information about the user's geographic location.
      const { latitude, longitude } = pos.coords; // if the user alllowed the location then it will get the latitude and longitude of the user.
      try {
        const data = await fetchLocalWeather(latitude, longitude, unitSelect.value);
        displayLocalWeather(data);
      } catch (e) {
        console.error("Local weather error:", e);
      }
    }, (err) => {
      console.error("Geolocation error:", err);
    });
  }
});

// events
// here we are using the addEventListener to pull the tiger of using handleSearch function, In case that the user clicks on the search button,
// and the button is clicked when there is an input in the searchInput.
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") handleSearch();
});

// these two following functions are here for a reason and that is to give the handler the idea if they are going to get the data in JSON or XML,
// and if they are going to get the data in celcius or farenheit.
// it is a fact that we can use only one model and it must work perfectly fine
// it is also right that we can change the Celsius to Farenheit and vice versa in our local machine manually.
// but here we are going to call them from the API source
unitSelect.addEventListener("change", handleSearch);
dataModeSelect.addEventListener("change", handleSearch);

// pagination handlers
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderResults();
  }
});
nextPageBtn.addEventListener("click", () => {
  if (currentPage < Math.ceil(currentResults.length / itemsPerPage)) {
    currentPage++;
    renderResults();
  }
});

// toggle day/night
// here it used to be tricky
// apprenlty we have to firsrt remove the previous class and then add the new class to the body
// otherwise it wont work.
toggleModeBtn.addEventListener("click", () => {
  if (document.body.classList.contains("day-mode")) {
    document.body.classList.remove("day-mode");
    document.body.classList.add("night-mode");
    toggleModeBtn.textContent = "Switch to Day Mode";
  } else {
    document.body.classList.remove("night-mode");
    document.body.classList.add("day-mode");
    toggleModeBtn.textContent = "Switch to Night Mode";
  }
});

// Initialize the Leaflet map and set a default views
function initMap() {
  map = L.map("map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  markersLayerGroup = L.layerGroup().addTo(map);
}

/**
 * fetch local weather
 */
async function fetchLocalWeather(lat, lon, unit) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Local weather fetch failed");
  return res.json();
}

//display local weather
function displayLocalWeather(data) {
  currentLocationWeather.style.display = "block";

  const cityName = data.name || "Unknown";
  const temp = data.main?.temp ? Math.round(data.main.temp) : "N/A";
  const weatherMain = data.weather?.[0]?.main || "";
  const weatherDesc = data.weather?.[0]?.description || "";
  const emoji = getWeatherEmoji(weatherMain);

  const html = `
    <h5>${cityName}</h5>
    <p><strong>Temperature:</strong> ${temp}°</p>
    <p><strong>Condition:</strong> ${weatherMain} ${emoji} (${weatherDesc})</p>
  `;
  currentWeatherCardBody.innerHTML = html;
}

 //main search logic
async function handleSearch() {
  const rawInput = searchInput.value.trim();
  errorMessage.textContent = "";
  resultsContainer.innerHTML = "";
  currentResults = [];
  currentPage = 1;
  mapSection.style.display = "none";

  if (!rawInput) {
    errorMessage.textContent = "Please enter a valid city or city,country.";
    return;
  }

  const { city, country } = parseCityInput(rawInput);
  if (!city) {
    errorMessage.textContent = "Please enter a valid city name.";
    return;
  }

  const unit = unitSelect.value;
  const dataMode = dataModeSelect.value;
  // here wew are using the dataModeSelect.value to get the value of the selected option from the dropdown.
  // weather it is JSON or XML, wheater its celcius or farenheit.

  const cacheKey = `${city},${country || ""}_${unit}_${dataMode}`.toLowerCase();

  try {
    let list;
    if (resultsCache[cacheKey]) {
      console.log("Using cached results for:", cacheKey);
      list = resultsCache[cacheKey];
    } else {
      console.log("Fetching /find for:", cacheKey);
      list = await fetchCityList(city, country, unit, dataMode);
      
      // second fetch for each city to fill real data
      for (let i = 0; i < list.length; i++) {
        const cityObj = list[i];
        try {
          const detailed = await fetchWeatherData(cityObj.id, unit, dataMode);
          mergeCityData(cityObj, detailed);
        } catch (err) {
          console.warn("Could not fetch detail for city:", cityObj.name, err);
        }
      }
      
      // cache the enriched data
      resultsCache[cacheKey] = list;
    }

    if (!list || list.length === 0) {
      errorMessage.textContent = "No data found for that query.";
      paginationControls.style.display = "none";
      return;
    }

    currentResults = list;
    renderResults();
    renderMapMarkers(list);

  } catch (err) {
    console.error("Search Error:", err);
    errorMessage.textContent = "Something went wrong. Please try again.";
  }
}

 // parse "city,country" or just "city
function parseCityInput(val) {
  if (val.includes(",")) {
    const [c1, c2] = val.split(",");
    return { city: c1.trim(), country: c2.trim() };
  } else {
    return { city: val.trim(), country: null };
  }
}

//fetch from /find
async function fetchCityList(city, country, unit, dataMode) {
  let query = city;
  if (country) query += `,${country}`;
  let url = `https://api.openweathermap.org/data/2.5/find?q=${encodeURIComponent(query)}&units=${unit}&cnt=50&appid=${API_KEY}`;

  if (dataMode === "xml") {
    url += `&mode=xml`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("XML /find failed");
    const xmlText = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    return parseCityListXML(xmlDoc);
  } else {
    const res = await fetch(url);
    if (!res.ok) throw new Error("JSON /find failed");
    const jsonData = await res.json();
    return jsonData.list;
  }
}
// Fetching from JSON is mainly being considered for me to be easier than fetching from XML
// because it is easier to parse JSON than XML
//parse /find?mode=xml
function parseCityListXML(xmlDoc) {
  const items = Array.from(xmlDoc.querySelectorAll("list > item"));
  const results = [];

  items.forEach(item => {
    const cityEl = item.querySelector("city");
    const name = cityEl?.getAttribute("name") || "Unknown";
    
    let countryCode = cityEl?.getAttribute("country") || "";
    const countryEl = item.querySelector("sys country");
    if (!countryCode && countryEl) {
      countryCode = countryEl.textContent.trim();
    }
    if (!countryCode) countryCode = "Unknown";

    // create a default flagUrl
    let flagUrl = "";
    if (countryCode !== "Unknown") {
      flagUrl = `https://openweathermap.org/images/flags/${countryCode.toLowerCase()}.png`;
    }

    const coordEl = item.querySelector("coord");
    const lat = parseFloat(coordEl?.getAttribute("lat") || "0");
    const lon = parseFloat(coordEl?.getAttribute("lon") || "0");

    const mainEl = item.querySelector("main");
    const temp = parseFloat(mainEl?.getAttribute("temp") || "N/A");

    const weatherEl = item.querySelector("weather");
    const wMain = weatherEl?.getAttribute("main") || "Unknown";
    const wDesc = weatherEl?.getAttribute("description") || "Unknown";

    // optional wind/humidity/pressure from <item>
    // often missing, but we'll parse them anyway
    const windEl = item.querySelector("wind speed");
    let windSpeed = null;
    if (windEl) {
      windSpeed = parseFloat(windEl.getAttribute("value")) || null;
    }

    const humidityEl = item.querySelector("humidity");
    let humidity = null;
    if (humidityEl) {
      humidity = parseInt(humidityEl.getAttribute("value")) || null;
    }

    const pressureEl = item.querySelector("pressure");
    let pressure = null;
    if (pressureEl) {
      pressure = parseInt(pressureEl.getAttribute("value")) || null;
    }

    let cityId = cityEl?.getAttribute("id") || "";
    if (!cityId) cityId = "xml_" + Math.floor(Math.random() * 100000);

    // optional sunrise/sunset in <city><sun .../> (rare in /find)
    const sunEl = cityEl?.querySelector("sun");
    let sunrise = null, sunset = null;
    if (sunEl) {
      const sr = sunEl.getAttribute("rise");
      const ss = sunEl.getAttribute("set");
      if (sr) sunrise = Date.parse(sr) / 1000;
      if (ss) sunset = Date.parse(ss) / 1000;
    }

    const cityObj = {
      id: cityId,
      name,
      coord: { lat, lon },
      sys: {
        country: countryCode,
        sunrise,
        sunset
      },
      // store the precomputed flag URL
      flagUrl,
      main: {
        temp,
        temp_min: null,
        temp_max: null,
        pressure,
        humidity
      },
      weather: [
        { main: wMain, description: wDesc }
      ],
      wind: { speed: windSpeed }
    };

    results.push(cityObj);
  });

  return results;
}


//for each city in the /find list, fetch /weather?mode=xml or JSON
// Here is a very very important part of the code.
// here is shows how a data no matter what shape would be retrieved from the API and how it is going to handle it depending on different 
// situations and different decesionsasync
async function fetchWeatherData(cityId, unit, dataMode) {
  let url = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=${unit}&id=${cityId}`;
  if (dataMode === "xml") url += `&mode=xml`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Detailed /weather fetch failed");
  
  if (dataMode === "xml") {
    const xmlText = await res.text();
    return parseWeatherXML(xmlText);
  } else {
    return res.json();
  }
}


// merge the second fetch data into the city object from /find
// here the data is being merged into the city object from the /find
function mergeCityData(cityObj, detailed) {
  // Overwrite main data
  cityObj.main.temp = Math.round(detailed.main.temp);
  cityObj.main.temp_min = Math.round(detailed.main.temp_min);
  cityObj.main.temp_max = Math.round(detailed.main.temp_max);
  cityObj.main.pressure = detailed.main.pressure ?? 0;
  cityObj.main.humidity = detailed.main.humidity ?? 0;

  // overwrite weather & wind
  cityObj.weather = detailed.weather;
  cityObj.wind = detailed.wind || { speed: 0 };

  // overwrite sunrise/sunset
  cityObj.sys.sunrise = detailed.sys.sunrise;
  cityObj.sys.sunset = detailed.sys.sunset;

  // if the second fetch has a country code, build a new flagUrl
  // or use the old one if we have it
  if (detailed.sys.country && detailed.sys.country !== "Unknown") {
    cityObj.sys.country = detailed.sys.country;
    cityObj.flagUrl = `https://openweathermap.org/images/flags/${detailed.sys.country.toLowerCase()}.png`;
  }
}

//parse /weather?mode=xml
function parseWeatherXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const cityEl = xmlDoc.querySelector("current > city");
  const name = cityEl?.getAttribute("name") || "Unknown";

  let country = cityEl?.querySelector("country")?.textContent.trim() || "Unknown";

  let flagUrl = "";
  if (country !== "Unknown") {
    flagUrl = `https://openweathermap.org/images/flags/${country.toLowerCase()}.png`;
  }

  const sunEl = cityEl?.querySelector("sun");
  let sunrise = null, sunset = null;
  if (sunEl) {
    const sr = sunEl.getAttribute("rise");
    const ss = sunEl.getAttribute("set");
    if (sr) sunrise = Date.parse(sr) / 1000;
    if (ss) sunset = Date.parse(ss) / 1000;
  }

  const tempEl = xmlDoc.querySelector("current > temperature");
  const tVal = parseFloat(tempEl?.getAttribute("value") || "0");
  const tMin = parseFloat(tempEl?.getAttribute("min") || "0");
  const tMax = parseFloat(tempEl?.getAttribute("max") || "0");

  const windEl = xmlDoc.querySelector("current > wind > speed");
  let windSpeed = 0;
  if (windEl) {
    windSpeed = parseFloat(windEl.getAttribute("value")) || 0;
  }

  const humidityEl = xmlDoc.querySelector("current > humidity");
  let humidity = 0;
  if (humidityEl) {
    humidity = parseInt(humidityEl.getAttribute("value")) || 0;
  }

  const pressureEl = xmlDoc.querySelector("current > pressure");
  let pressure = 0;
  if (pressureEl) {
    pressure = parseInt(pressureEl.getAttribute("value")) || 0;
  }

  const weatherEl = xmlDoc.querySelector("current > weather");
  const wMain = weatherEl?.getAttribute("value") || "Unknown";

  return {
    name,
    sys: {
      country,
      sunrise,
      sunset
    },
    // store the computed flagUrl
    flagUrl,
    main: {
      temp: tVal,
      temp_min: tMin,
      temp_max: tMax,
      pressure,
      humidity
    },
    weather: [
      { main: wMain, description: wMain }
    ],
    wind: {
      speed: windSpeed
    }
  };
}

// render results with pagination
function renderResults() {
  resultsContainer.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageResults = currentResults.slice(startIndex, endIndex);

  pageResults.forEach(cityData => {
    const card = createCityCard(cityData);
    resultsContainer.appendChild(card);
  });

  const totalPages = Math.ceil(currentResults.length / itemsPerPage);
  if (totalPages > 1) {
    paginationControls.style.display = "flex";
    currentPageNum.textContent = currentPage;
    totalPagesNum.textContent = totalPages;
  } else {
    paginationControls.style.display = "none";
  }
}


//create city card
function createCityCard(cityData) {
  const col = document.createElement("div");
  col.className = "col-md-4 mb-4";

  const cityName = cityData.name;
  const temp = (cityData.main.temp !== undefined) ? cityData.main.temp : "N/A";
  const condition = cityData.weather[0].main;
  const description = cityData.weather[0].description;
  const emoji = getWeatherEmoji(condition);

  // final check if we have a flag
  const flagUrl = cityData.flagUrl || "";

  col.innerHTML = `
    <div class="card" style="cursor: pointer;">
      <div class="card-body">
        <div class="d-flex align-items-center">
          ${flagUrl ? `<img src="${flagUrl}" alt="Flag" width="30" class="me-2">` : ""}
          <h5 class="card-title mb-0">${cityName}</h5>
        </div>
        <p class="mt-2 mb-1">
          <strong>Temperature:</strong> ${temp}°
        </p>
        <p class="mb-2">
          <strong>Condition:</strong> ${condition} ${emoji} (${description})
        </p>
        <button class="btn btn-info btn-sm" type="button">More Info</button>
      </div>
    </div>
  `;

  col.querySelector(".card").addEventListener("click", () => {
    openCityModal(cityData);
  });

  return col;
}


//show modal with existing data (since we've merged everything)
function openCityModal(cityData) {
  const modal = new bootstrap.Modal(document.getElementById("cityDetailModal"));
  const modalLabel = document.getElementById("cityDetailModalLabel");
  const modalBody = document.getElementById("modalBodyContent");

  const cityName = cityData.name || "Unknown";
  const temp = cityData.main.temp || 0;
  const tempMin = cityData.main.temp_min || 0;
  const tempMax = cityData.main.temp_max || 0;
  const windSpeed = cityData.wind.speed || 0;
  const humidity = cityData.main.humidity || 0;
  const pressure = cityData.main.pressure || 0;

  let sunriseStr = "N/A";
  let sunsetStr = "N/A";
  if (cityData.sys.sunrise) {
    sunriseStr = new Date(cityData.sys.sunrise * 1000).toLocaleTimeString();
  }
  if (cityData.sys.sunset) {
    sunsetStr = new Date(cityData.sys.sunset * 1000).toLocaleTimeString();
  }

  modalLabel.textContent = `Details for ${cityName}`;
  modalBody.innerHTML = `
    <ul class="list-group">
      <li class="list-group-item">
        <strong>Temperature:</strong> ${temp}°
      </li>
      <li class="list-group-item">
        <strong>Min / Max:</strong> ${tempMin}° / ${tempMax}°
      </li>
      <li class="list-group-item">
        <strong>Wind Speed:</strong> ${windSpeed} m/s
      </li>
      <li class="list-group-item">
        <strong>Humidity:</strong> ${humidity}%
      </li>
      <li class="list-group-item">
        <strong>Pressure:</strong> ${pressure} hPa
      </li>
      <li class="list-group-item">
        <strong>Sunrise:</strong> ${sunriseStr}
      </li>
      <li class="list-group-item">
        <strong>Sunset:</strong> ${sunsetStr}
      </li>
    </ul>
  `;
  modal.show();
}


//render map markers
function renderMapMarkers(list) {
  mapSection.style.display = "block";
  markersLayerGroup.clearLayers();

  const bounds = [];
  list.forEach(city => {
    const { lat, lon } = city.coord;
    const marker = L.marker([lat, lon]);
    marker.addTo(markersLayerGroup);
    marker.bindPopup(`
      <div>
        <strong>${city.name}, ${city.sys.country}</strong><br/>
        <button onclick="chooseCity('${city.id}')">Select This City</button>
      </div>
    `);
    bounds.push([lat, lon]);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds);
  }
}

function chooseCity(cityId) {
  const chosenData = currentResults.find(c => c.id.toString() === cityId);
  if (chosenData) openCityModal(chosenData);
}


//return an appropriate emoji for condition
function getWeatherEmoji(condition) {
  const c = condition.toLowerCase();
  if (c.includes("cloud")) return "☁️";
  if (c.includes("rain")) return "🌧️";
  if (c.includes("drizzle")) return "🌦️";
  if (c.includes("thunder")) return "⛈️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("clear")) return "☀️";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze") || c.includes("smoke")) {
    return "🌫️";
  }
  return "🌈";
}