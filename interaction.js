// backend.js
console.log('Javascript Loaded');

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
window.addEventListener('DOMContentLoaded', (event) => {
    createCharts();

    function updateLiveData() {
        const temperature = (Math.random() * 10 + 20).toFixed(2);  // Simulatie van temperatuur
        const humidity = (Math.random() * 20 + 980).toFixed(2);    // Simulatie van luchtvochtigheid
        const rain = (Math.random() * 40 + 30).toFixed(2);         // Simulatie van regen
        const soil = (Math.random() * 40 + 30).toFixed(2);         // Simulatie van bodemvochtigheid

        const liveData = `Temperature: ${temperature} °C, Rain: ${rain} %, Soil: ${soil} %, Humidity: ${humidity} %`;

        // Werk de textbox bij met de nieuwe data
        document.getElementById('liveData').value = liveData;
    }

    setInterval(() => {
        const time = new Date().toLocaleTimeString();
        const temperature = (Math.random() * 10 + 20).toFixed(2);
        const humidity = (Math.random() * 20 + 980).toFixed(2);
        const rain = (Math.random() * 40 + 30).toFixed(2);
        const soil = (Math.random() * 40 + 30).toFixed(2);
    
        // Update the graphs
        updateChart(temperatureChart, time, temperature);
        updateChart(humidityChart, time, humidity);
        updateChart(rainChart, time, rain);
        updateChart(soilChart, time, soil);
    
        // Update the single textbox with all data in one line
        document.getElementById("realTimeData").value = 
            `Temp: ${temperature}°C | Rain: ${rain}% | Soil: ${soil}% | Humidity: ${humidity}%`;
    }, 3000);
});