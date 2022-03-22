// -------------------------- Extract of utils.js from Charts.js
// https://github.com/chartjs/Chart.js/blob/master/docs/scripts/utils.js

const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

// --------------------------- End of extract

const dummy_labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const dummy_data = {
    labels: dummy_labels,
    datasets: [
        {
            label: 'Temperature',
            data: [9, 11, 3, 5, 2, 3, 6],
            borderColor: CHART_COLORS.red,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            yAxisID: 'yT',
            cubicInterpolationMode: 'monotone',     // looks nice but may not make sense
            tension: 0.4
        },
        {
            label: 'Humidity',
            data: [26, 30, 34, 18, 23, 21, 39],
            borderColor: CHART_COLORS.blue,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            yAxisID: 'yH',
            cubicInterpolationMode: 'monotone',     // looks nice but may not make sense
            tension: 0.4
        }
    ]
};

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
        },
        yH: {
            type: 'linear',
            display: true,
            position: 'right',
            
            // grid line settings
            grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
        },
    }
};

// TODO: color/differentiate both axis

const dummy_config = {
    type: 'line',
    data: dummy_data,
    options: options,
};


// --------------------------- Methods

async function getChartData() {
    let url = 'http://127.0.0.1:5000/chart_data';
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function setupChart() {
    const ctx = document.getElementById('chart');
    // const main_chart = new Chart(ctx, dummy_config);     // example

    let res = await getChartData();
    console.log(res);

    let data = {
        labels: res.labels,
        datasets: [
            {
                label: 'Temperature',
                data: res.temperature,
                borderColor: CHART_COLORS.red,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'yT',
                cubicInterpolationMode: 'monotone',     // looks nice but may not make sense
                tension: 0.4
            },
            {
                label: 'Humidity',
                data: res.humidity,
                borderColor: CHART_COLORS.blue,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                yAxisID: 'yH',
                cubicInterpolationMode: 'monotone',     // looks nice but may not make sense
                tension: 0.4
            }
        ]
    };

    let config = {
        type: 'line',
        data: data,
        options: options,
    };

    const main_chart = new Chart(ctx, config);
}
