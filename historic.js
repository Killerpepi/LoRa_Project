// ============================== SIDEBAR ==============================
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

// ============================== Graphs (Common Functions) ==============================

let temperatureChart, humidityChart, rainChart, soilChart;

function createCharts() {
    const ctxTemp = document.getElementById("temperatureChart").getContext("2d");
    const ctxHumidity = document.getElementById("humidityChart").getContext("2d");
    const ctxRain = document.getElementById("rainChart").getContext("2d");
    const ctxSoil = document.getElementById("soilChart").getContext("2d");

    temperatureChart = createChart(ctxTemp, "Temperature (°C)", "red", "Temperature (°C)");
    humidityChart = createChart(ctxHumidity, "Humidity (%)", "blue", "Humidity (%)");
    rainChart = createChart(ctxRain, "Rain (%)", "green", "Rain (%)");
    soilChart = createChart(ctxSoil, "Soil Moisture (%)", "yellow", "Soil Moisture (%)");
}

function createChart(ctx, label, color, yLabel) {
    return new Chart(ctx, {
        type: "line",
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: color, fill: false }] },
        options: {
            responsive: true,
            scales: {
                x: { ticks: { autoSkip: true, maxTicksLimit: 10, color: 'black', borderColor: 'black' } },
                y: { title: { display: true, text: yLabel, color: 'black', borderColor: 'black' } }
            }
        }
    });
}

function updateChart(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

// ============================== DATABASE CONNECTION & GRAPH UPDATES ==============================
async function fetchHistoricalData(timeframe, sensorType) {
    try {
        const response = await fetch(`http://192.168.0.101:3000/historical/${timeframe}`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(entry => ({
              time: new Date(entry.time).toLocaleString(),
              value: entry[sensorType]
          }));
        } else {
          console.warn(`No data received for ${timeframe} and ${sensorType}`);
          return [];
        }

    } catch (error) {
        console.error(`Fout bij ophalen historische data (${timeframe}, ${sensorType}):`, error);
        return [];
    }
}

async function updateGraphs(timeframe) {
    //For monthly data we use simulated data
    if(timeframe === 'month'){
        generateMonthlyData();
        return;
    }
    const temperatureData = await fetchHistoricalData(timeframe, 'temp');
    const humidityData = await fetchHistoricalData(timeframe, 'humidity');
    const rainData = await fetchHistoricalData(timeframe, 'rain');
    const soilData = await fetchHistoricalData(timeframe, 'soil');

    if (temperatureData.length > 0) {
        updateChart(temperatureChart, temperatureData.map(d => d.time), temperatureData.map(d => d.value));
    }
    if (humidityData.length > 0) {
        updateChart(humidityChart, humidityData.map(d => d.time), humidityData.map(d => d.value));
    }
    if (rainData.length > 0) {
        updateChart(rainChart, rainData.map(d => d.time), rainData.map(d => d.value));
    }
    if (soilData.length > 0) {
        updateChart(soilChart, soilData.map(d => d.time), soilData.map(d => d.value));
    }
}

// ============================== Monthly Data Simulation ==============================
function generateMonthlyData() {
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const temperatureData = [];
    const humidityData = [];
    const rainData = [];
    const soilMoistureData = [];

    for (let i = 0; i < 4; i++) {
        temperatureData.push((Math.random() * 10 + 15).toFixed(2)); // 15-25°C
        humidityData.push((Math.random() * 20 + 60).toFixed(2));    // 60-80%
        rainData.push((Math.random() * 40 + 30).toFixed(2));        // 30-70%
        soilMoistureData.push((Math.random() * 30 + 20).toFixed(2));// 20-50%
    }

    updateChart(temperatureChart, labels, temperatureData);
    updateChart(humidityChart, labels, humidityData);
    updateChart(rainChart, labels, rainData);
    updateChart(soilChart, labels, soilMoistureData);
}

// ========================= Initialization and Event Listener ==========================

window.addEventListener('DOMContentLoaded', () => {
    createCharts();

    // Get the current page URL
    const currentPage = window.location.pathname;

    // Update graphs based on current page
    if (currentPage.includes('dayData.html')) {
        updateGraphs('24hr');
        setInterval(() => updateGraphs('24hr'), 300000); // Refresh every 5 minutes
    } else if (currentPage.includes('weeklyData.html')) {
        updateGraphs('week');
        setInterval(() => updateGraphs('week'), 300000); // Refresh every 5 minutes
    } else if (currentPage.includes('monthlyData.html')) {
        generateMonthlyData(); // Only generate monthly data on the monthly page
    } else { //For example actueleData.html
        updateGraphs('24hr'); // Load 24-hour data initially
        updateGraphs('week');
        setInterval(() => updateGraphs('24hr'), 300000);
        setInterval(() => updateGraphs('week'), 300000);
    }
});