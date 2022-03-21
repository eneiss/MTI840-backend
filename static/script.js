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

const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const data = {
    labels: labels,
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

const config = {
    type: 'line',
    data: data,
    options: options,
};
