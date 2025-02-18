SCRIPT.JS

// ============================== WebSocket ==============================
const socket = new WebSocket('ws://192.168.0.101:8080'); // Connect to the WebSocket server

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);

    console.log('Received data:', data);
    updateGraphs(data);
};

socket.onopen = function () {
    console.log('Connected to WebSocket server');
};

socket.onerror = function (error) {
    console.log('WebSocket error:', error);
};

socket.onclose = function () {
    console.log('WebSocket disconnected!');
};

// ============================== MQTT berichten inlezen ==============================

const broker = "ws://localhost:9001";
const topic = "test/topic";
const client = mqtt.connect(broker);

client.on("connect", () => {
    console.log("Verbonden met MQTT broker");
    document.getElementById("status").innerText = "Verbonden";

    // Abonneer op een topic
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`Geabonneerd op topic: ${topic}`);
        }
    });
});

// Bericht ontvangen
client.on("message", (receivedTopic, message) => {
    console.log(`Ontvangen van ${receivedTopic}: ${message.toString()}`);
    const msgList = document.getElementById("messages");
    const listItem = document.createElement("li");
    listItem.textContent = `📩 ${message.toString()}`;
    msgList.appendChild(listItem);
});

// Bericht verzenden
function sendMessage() {
    const message = document.getElementById("messageInput").value;
    if (message.trim() !== "") {
        client.publish(topic, message);
        console.log(`Verzonden: ${message}`);
    }
}

// Foutafhandeling
client.on("error", (err) => {
    console.error("MQTT Fout:", err);
});

client.on("close", () => {
    document.getElementById("status").innerText = "Verbinding verbroken";
});

// ============================== SIDEBAR ==============================
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

// ============================== Graphs real-time data ==============================

let temperatureChart, humidityChart, rainChart, soilChart; // Declare variables

window.addEventListener('DOMContentLoaded', (event) => {
    createCharts();
});

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

function updateGraphs(data) {
    if (data.temperature && data.humidity && data.rain && data.soil) {
        const time = new Date().toLocaleTimeString();
        updateChart(temperatureChart, time, data.temperature);
        updateChart(humidityChart, time, data.humidity);
        updateChart(rainChart, time, data.rain);
        updateChart(soilChart, time, data.soil);
    } else {
        console.error("Invalid data received:", data);
    }
}