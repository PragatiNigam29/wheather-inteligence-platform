const apiKey = "6c8c8d8442cbe530a05df595dd60c77d";

let chart;
let map;

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Enter city");

  // CURRENT WEATHER
  const res = await fetch(
    fetch(`/api/weather?city=${city}`)
  );
  const data = await res.json();

  if (data.cod !== 200) {
    alert("City not found");
    return;
  }

  // fill main
  cityName.innerText = data.name;
  temp.innerText = data.main.temp + "°C";
  desc.innerText = data.weather[0].description;
  humidity.innerText = data.main.humidity;
  wind.innerText = data.wind.speed;
  pressure.innerText = data.main.pressure;

  // TODAY SUMMARY (NEW)
  const summary = document.getElementById("todaySummary");
  if (summary) {
    summary.innerHTML = `
      Feels like ${data.main.feels_like}°C.
      Min ${data.main.temp_min}°C / Max ${data.main.temp_max}°C.
    `;
  }

  // FORECAST
  const res2 = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
  );
  const forecast = await res2.json();

  // 5 day cards
  const fDiv = document.getElementById("forecast");
  fDiv.innerHTML = "";

  const temps = [];
  const labels = [];

  for (let i = 0; i < forecast.list.length; i += 8) {
    const item = forecast.list[i];

    temps.push(item.main.temp);
    labels.push(new Date(item.dt_txt).toLocaleDateString());

    fDiv.innerHTML += `
      <div class="small">
        <p>${item.main.temp}°C</p>
        <p>${item.weather[0].main}</p>
      </div>
    `;
  }

  // HOURLY STYLE PANEL (NEW)
  const hourly = document.getElementById("hourly");
  if (hourly) {
    hourly.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const h = forecast.list[i];
      hourly.innerHTML += `
        <div class="small">
          <p>${new Date(h.dt_txt).getHours()}:00</p>
          <p>${h.main.temp}°C</p>
        </div>
      `;
    }
  }

  // GRAPH
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperature",
          data: temps
        }
      ]
    }
  });

  // MAP
  if (map) map.remove();
  map = L.map("map").setView([data.coord.lat, data.coord.lon], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  L.marker([data.coord.lat, data.coord.lon]).addTo(map);

  // ALERTS (NEW)
  const alertBox = document.getElementById("alerts");
  if (alertBox) {
    alertBox.innerHTML = "No active warnings";
  }

}
