HISTORIC.JS


// ============================== SIDEBAR ==============================
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

function parseDataString(dataString) {
    const fields = ["landingsplaats", "servoSturen", "temperature", "pressure", "altitude",
        "longitude", "latitude", "accelX", "accelY", "accelZ",
        "gyroX", "gyroY", "gyroZ"];
    const values = dataString.split(";");

    return Object.fromEntries(fields.map((key, index) => [key, values[index]]));
}

// ============================== Graphs real-time data ==============================

let temperatureChart, humidityChart, rainChart, soilChart; // Declare variables

function createCharts() { // Function to create charts
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

function updateChart(chart, label, value) {
    if (chart.data.labels.length > 10) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value);
    chart.update();
}

// ============================== Simulatie van Data ==============================
window.addEventListener('DOMContentLoaded', () => {
    createCharts();
    generateMonthlyData();
});

function generateMonthlyData() {
    const temperatureData = [];
    const humidityData = [];
    const rainData = [];
    const soilMoistureData = [];
    const labels = [];

    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() + 7)); // Start on the first day of the previous week

    // Loop to simulate 4 weeks (28 days total)
    for (let i = 0; i < 4; i++) {
        labels.push(`Week ${i + 1}`);

        // Simulated values with random variations
        temperatureData.push((Math.random() * 10 + 15).toFixed(2)); // 15-25°C
        humidityData.push((Math.random() * 20 + 60).toFixed(2));    // 60-80%
        rainData.push((Math.random() * 40 + 30).toFixed(2));        // 30-70%
        soilMoistureData.push((Math.random() * 30 + 20).toFixed(2));// 20-50%

        currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
    }

    updateChart(temperatureChart, labels, temperatureData);
    updateChart(humidityChart, labels, humidityData);
    updateChart(rainChart, labels, rainData);
    updateChart(soilChart, labels, soilMoistureData);
}

function updateChart(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}



//============================= DATABASE CONNECTION ==============================
async function fetchHistoricalData(timeframe) {
    try {
        const response = await fetch(`http://localhost:3000/historical/${timeframe}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fout bij ophalen historische data:", error);
    }
}

async function updateGraph(timeframe, chart) {
    const data = await fetchHistoricalData(timeframe);

    const timestamps = data.map(entry => new Date(entry.timestamp).toLocaleString());
    const values = data.map(entry => entry.temperature);  // Pas aan voor andere sensoren

    chart.data.labels = timestamps;
    chart.data.datasets[0].data = values;
    chart.update();
}
