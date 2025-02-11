
// ============================== SIDEBAR ==============================
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    }
    
    function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    }

// ============================== Connection Websocket Server ==============================
const socket = io('http://localhost:3000');  // Replace with your Raspberry Pi's IP if needed

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

 // ============================== Temp graph ==============================
 //https://canvasjs.com/javascript-charts/multi-series-area-chart/
 window.onload = function () {

    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        title: {
            text: ""
        },
        axisX: {
            valueFormatString: "DDD",
            minimum: new Date(2025, 0, 1), //1 Jan 2025
            maximum: new Date(2026, 0, 1), //1 Jan 2026
            interval: 1
        },
        axisY: {
            title: "Temperature (°C)",
        },
        legend: {
            verticalAlign: "top",
            horizontalAlign: "right",
            dockInsidePlotArea: true
        },
        toolTip: {
            shared: true
        },
        data: [{ // Pas data aan (websockets)
            name: "Maximum",
            showInLegend: true,
            legendMarkerType: "square",
            type: "area",
            color: "rgba(40,175,101,0.6)",
            markerSize: 0,
            dataPoints: [
                { x: new Date(2025, 0, 6), y: 45 },
                { x: new Date(2025, 0, 7), y: 45 },
                { x: new Date(2025, 0, 8), y: 45 },
                { x: new Date(2025, 0, 9), y: 45 },
                { x: new Date(2025, 0, 10), y: 45 },
                { x: new Date(2025, 0, 11), y: 45 },
                { x: new Date(2025, 0, 12), y: 45 }
            ]
        },
        {
            name: "Minimum",
            showInLegend: true,
            legendMarkerType: "square",
            type: "area",
            color: "rgba(0,75,141,0.7)",
            markerSize: 0,
            dataPoints: [
                { x: new Date(2025, 0, 6), y: 42 },
                { x: new Date(2025, 0, 7), y: 34 },
                { x: new Date(2025, 0, 8), y: 29 },
                { x: new Date(2025, 0, 9), y: 42 },
                { x: new Date(2025, 0, 10), y: 53},
                { x: new Date(2025, 0, 11), y: 15 },
                { x: new Date(2025, 0, 12), y: 12 }
            ]
        }]
    });
    chart.render();
    
    }



 // ============================== Humidity graph ==============================
 //https://canvasjs.com/html5-javascript-spline-area-chart/




 // ============================== Rain graph ==============================
 // https://canvasjs.com/html5-javascript-column-chart/



 //============================= Soil graph ==============================
 //https://canvasjs.com/javascript-charts/line-chart-zoom-pan/