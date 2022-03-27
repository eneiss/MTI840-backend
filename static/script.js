// -------------------------- Colors taken from Charts.js' utils.js
// https://github.com/chartjs/Chart.js/blob/master/docs/scripts/utils.js

const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    blue: 'rgb(54, 162, 235)',
};

// --------------------------- End of extract

const options =  {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    let unit = (context.dataset.yAxisID === 'yH' ? "%" : "°C")
                    
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += context.parsed.y + unit;
                    }
                    return label;
                }
            },
        },
    },
    scales: {
        yT: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
                color: CHART_COLORS.red,
            },
            title: {
                display: true,
                text: 'Temperature (°C)',
                color: CHART_COLORS.red,
                font: {
                  size: 20,
                },
            }
        },
        yH: {
            type: 'linear',
            display: true,
            position: 'right',
            
            // grid line settings
            grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
            ticks: {
                color: CHART_COLORS.blue,
            },
            title: {
                display: true,
                text: 'Humidity (%)',
                color: CHART_COLORS.blue,
                font: {
                  size: 20,
                },
            }
        },
        x: {
            ticks: {
                // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                callback: function(val, index) {
                    // Hide every 2nd tick label -> TODO: customize
                    return index % 2 === 0 ? this.getLabelForValue(val) : '';
                },
            }
        }
    },
    layout: {
        padding: 20
    }
};

var main_chart;

// --------------------------- Methods

// returns a callback for the x-axis ticks for skipping labels
function getChartTicksCallbackForInterval(interval) {
    return function(val, index) {
        return index % interval === 0 ? this.getLabelForValue(val) : '';
    }
}

async function getChartDataForPeriod(period) {
    let url = root_url + 'chart_data/' + period;
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
        return {"size": 0, "labels": [], "temperature": [], "humidity": []};
    }
}

// called when the page is loaded
async function setupChart() {    
    let res = await getChartDataForPeriod("all")
    console.log(res);
    setupChartWithData(res.temperature, res.humidity, res.labels, 3)
}

// load dashboard info (state & last data)
async function loadDashboardInfo() {
    let url = root_url + 'dashboard_info';
    try {
        let last_data = await (await fetch(url + '/last_data')).json();
        let state = await (await fetch(url + '/status')).json();
        console.log(last_data, state);
        document.getElementById("status").innerHTML = state.status;

        // TODO: split last data and use it to update dashboard
        // if (last_data === null) {
        //     last_data = 
        // }
        document.getElementById("last_data").innerHTML = last_data.last_data;
    } catch (error) {
        console.log(error);
    }
}

// called when a button is clicked
async function updateChartForPeriod(period) {
    let res = await getChartDataForPeriod(period);
    if (res.temperature !== null) {
        // TODO: labels skip?
        updateChartWithData(res.temperature, res.humidity, res.labels, 2);
    }
}

function setupChartWithData(temperature, humidity, labels, labels_skip) {
    const ctx = document.getElementById('chart');
    let chart_data = {
        labels: labels,
        datasets: [
            {
                label: 'Temperature',
                data: temperature,
                borderColor: CHART_COLORS.red,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'yT',
                cubicInterpolationMode: 'monotone',     // looks nice but may not make sense
                tension: 0.4
            },
            {
                label: 'Humidity',
                data: humidity,
                borderColor: CHART_COLORS.blue,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                yAxisID: 'yH',
                cubicInterpolationMode: 'monotone',     // looks nice but may not make sense
                tension: 0.4
            }
        ]
    };

    // update x ticks callback
    options.scales.x.ticks.callback = getChartTicksCallbackForInterval(labels_skip);

    let config = {
        type: 'line',
        data: chart_data,
        options: options,
    };

    main_chart = new Chart(ctx, config);
}

// actually updates the chart
function updateChartWithData(temperature, humidity, labels, labels_skip) {

    // update chart data
    main_chart.data.labels = labels;
    main_chart.data.datasets[0].data = temperature;
    main_chart.data.datasets[1].data = humidity;
    
    // update x ticks callback
    main_chart.options.scales.x.ticks.callback = getChartTicksCallbackForInterval(labels_skip);

    // update chart
    main_chart.update();
}