// ===============================================
//  Climate Change Dashboard - script.js
//  Data comes from data.js (climateData array)
// ===============================================

// ---------- Helper functions (basic statistics) ----------

// Average of a list of numbers
function mean(arr) {
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

// Linear regression: finds slope and intercept of best-fit line y = m*x + c
function linearRegression(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = num / den;
  const intercept = my - slope * mx;
  return { slope, intercept };
}

// Correlation coefficient (r): -1 to +1, shows how strongly two things move together
function correlation(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx  += (xs[i] - mx) ** 2;
    dy  += (ys[i] - my) ** 2;
  }
  return num / Math.sqrt(dx * dy);
}

// ---------- Get page elements ----------
const startSelect = document.getElementById("startYear");
const endSelect   = document.getElementById("endYear");
const resetBtn    = document.getElementById("resetBtn");

const firstYear = climateData[0].year;
const lastYear  = climateData[climateData.length - 1].year;

// Fill dropdowns with years
for (let y = firstYear; y <= lastYear; y++) {
  startSelect.add(new Option(y, y));
  endSelect.add(new Option(y, y));
}
startSelect.value = firstYear;
endSelect.value   = lastYear;

// ---------- Chart variables (so we can update them later) ----------
let tempChart, co2Chart, decadeChart, scatterChart, iceChart;

// Returns only the rows between the selected years
function getFilteredData() {
  const start = Number(startSelect.value);
  const end   = Number(endSelect.value);
  return climateData.filter(d => d.year >= start && d.year <= end);
}

// ---------- Update summary cards ----------
function updateCards(data) {
  const first = data[0];
  const last  = data[data.length - 1];

  const tempDiff = last.temp - first.temp;
  const co2Diff  = last.co2 - first.co2;
  const iceDiff  = last.ice - first.ice;

  document.getElementById("cardTemp").textContent = (tempDiff >= 0 ? "+" : "") + tempDiff.toFixed(2);
  document.getElementById("cardCo2").textContent  = (co2Diff >= 0 ? "+" : "") + co2Diff.toFixed(1);
  document.getElementById("cardIce").textContent  = (iceDiff >= 0 ? "+" : "") + iceDiff.toFixed(2);

  if (data.length >= 3) {
    const r = correlation(data.map(d => d.co2), data.map(d => d.temp));
    document.getElementById("cardCorr").textContent = r.toFixed(2);
  } else {
    document.getElementById("cardCorr").textContent = "-";
  }
}

// ---------- Decade averages ----------
function decadeAverages(data) {
  const groups = {};
  data.forEach(d => {
    const decade = Math.floor(d.year / 10) * 10;
    if (!groups[decade]) groups[decade] = [];
    groups[decade].push(d.temp);
  });
  const labels = Object.keys(groups).map(dec => dec + "s");
  const values = Object.values(groups).map(list => Number(mean(list).toFixed(2)));
  return { labels, values };
}

// ---------- Key findings text ----------
function updateFindings(data) {
  const years = data.map(d => d.year);
  const temps = data.map(d => d.temp);
  const co2s  = data.map(d => d.co2);
  const ices  = data.map(d => d.ice);
  const list  = document.getElementById("findings");

  if (data.length < 3) {
    list.innerHTML = "<li>Please select at least 3 years to see findings.</li>";
    return;
  }

  const tempTrend = linearRegression(years, temps).slope * 10;  // per decade
  const co2Trend  = linearRegression(years, co2s).slope * 10;
  const iceTrend  = linearRegression(years, ices).slope * 10;
  const r         = correlation(co2s, temps);

  const hottest = data.reduce((a, b) => (b.temp > a.temp ? b : a));
  const coldest = data.reduce((a, b) => (b.temp < a.temp ? b : a));
  const lowIce  = data.reduce((a, b) => (b.ice < a.ice ? b : a));

  let strength = "weak";
  if (Math.abs(r) > 0.8) strength = "very strong";
  else if (Math.abs(r) > 0.5) strength = "moderate to strong";

  list.innerHTML = `
    <li>Global temperature is changing by about <b>${tempTrend.toFixed(2)} °C per decade</b> in the selected period.</li>
    <li>CO₂ is changing by about <b>${co2Trend.toFixed(1)} ppm per decade</b>.</li>
    <li>Arctic sea ice is changing by about <b>${iceTrend.toFixed(2)} million km² per decade</b>.</li>
    <li>Warmest year: <b>${hottest.year}</b> (${hottest.temp} °C). Coolest year: <b>${coldest.year}</b> (${coldest.temp} °C).</li>
    <li>Lowest Arctic sea ice: <b>${lowIce.year}</b> (${lowIce.ice} million km²).</li>
    <li>Correlation between CO₂ and temperature is <b>${r.toFixed(2)}</b> – a ${strength} relationship.
        (Correlation shows they move together; it alone does not prove cause. Scientific evidence links CO₂ rise to warming.)</li>
  `;
}

// ---------- Draw / redraw all charts ----------
function drawCharts() {
  const data  = getFilteredData();
  if (data.length < 2) {
    alert("Please choose a valid year range (start year must be before end year).");
    return;
  }

  const years = data.map(d => d.year);
  const temps = data.map(d => d.temp);
  const co2s  = data.map(d => d.co2);
  const ices  = data.map(d => d.ice);

  updateCards(data);
  updateFindings(data);

  // Remove old charts before drawing new ones
  [tempChart, co2Chart, decadeChart, scatterChart, iceChart].forEach(c => c && c.destroy());

  // 1) Temperature line chart + trend line
  const reg = linearRegression(years, temps);
  const trendLine = years.map(y => Number((reg.slope * y + reg.intercept).toFixed(3)));
  tempChart = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
      labels: years,
      datasets: [
        { label: "Temperature anomaly (°C)", data: temps, borderColor: "#dc2626", backgroundColor: "rgba(220,38,38,0.1)", fill: true, tension: 0.3, pointRadius: 2 },
        { label: "Trend line", data: trendLine, borderColor: "#111827", borderDash: [6, 6], pointRadius: 0 }
      ]
    },
    options: { responsive: true, scales: { y: { title: { display: true, text: "°C" } } } }
  });

  // 2) CO2 line chart
  co2Chart = new Chart(document.getElementById("co2Chart"), {
    type: "line",
    data: {
      labels: years,
      datasets: [{ label: "CO₂ (ppm)", data: co2s, borderColor: "#1d4ed8", backgroundColor: "rgba(29,78,216,0.1)", fill: true, tension: 0.3, pointRadius: 2 }]
    },
    options: { responsive: true, scales: { y: { title: { display: true, text: "ppm" } } } }
  });

  // 3) Decade bar chart
  const dec = decadeAverages(data);
  decadeChart = new Chart(document.getElementById("decadeChart"), {
    type: "bar",
    data: {
      labels: dec.labels,
      datasets: [{ label: "Average anomaly (°C)", data: dec.values, backgroundColor: ["#fca5a5", "#f87171", "#ef4444", "#dc2626", "#991b1b"] }]
    },
    options: { responsive: true, scales: { y: { title: { display: true, text: "°C" } } } }
  });

  // 4) Scatter plot: CO2 vs temperature
  scatterChart = new Chart(document.getElementById("scatterChart"), {
    type: "scatter",
    data: {
      datasets: [{ label: "Each dot = one year", data: data.map(d => ({ x: d.co2, y: d.temp })), backgroundColor: "#0f766e" }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "CO₂ (ppm)" } },
        y: { title: { display: true, text: "Temperature anomaly (°C)" } }
      }
    }
  });

  // 5) Arctic sea ice
  iceChart = new Chart(document.getElementById("iceChart"), {
    type: "line",
    data: {
      labels: years,
      datasets: [{ label: "Sea ice extent (million km²)", data: ices, borderColor: "#0891b2", backgroundColor: "rgba(8,145,178,0.15)", fill: true, tension: 0.3, pointRadius: 2 }]
    },
    options: { responsive: true, scales: { y: { title: { display: true, text: "million km²" } } } }
  });
}

// ---------- Events ----------
startSelect.addEventListener("change", drawCharts);
endSelect.addEventListener("change", drawCharts);
resetBtn.addEventListener("click", () => {
  startSelect.value = firstYear;
  endSelect.value   = lastYear;
  drawCharts();
});

// Draw everything when the page opens
drawCharts();
