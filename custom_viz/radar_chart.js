(function (looker, Chart) {

    looker.plugins.visualizations.add({
        id: 'custom_spider_chart_chartjs',
        label: 'Custom Spider Chart (Chart.js)',
        options: {
            color: {
                type: 'string',
                label: 'Color',
                // default: '#3498db'
            }
        },
        handleErrors: function (data, resp) {
            return true;
        },
        create: function (element, config) {
            // Create a canvas element for the chart
            var canvas = document.createElement('canvas');
            canvas.setAttribute('id', 'customSpiderChartCanvas');
            element.appendChild(canvas);

            // Initialize the Chart.js instance
            this.chart = new Chart(canvas, {
                type: 'radar',
            });
        },
        update: function (data, element, config, queryResponse) {
            // Extract the data from Looker response
            var values = data;
            // Generate the chart data
            var FinalData = [];
            var finalLabel = [];
            let sum = 0;
            values.forEach(function (currentValue, index) {
                var cell = currentValue[queryResponse.fields.measure_like[0].name];
                if (index < 19) {
                    var cellElement = '<p>' + cell.value + ' </p>';
                    htmlData = LookerCharts.Utils.htmlForCell(cell)
                    FinalData.push(cell.value);
                    finalLabel.push(currentValue[queryResponse.fields.dimensions[0].name].value);
                } else {
                    sum = sum + cell.value;
                }
            })
            console.log(sum)
            FinalData.push(sum); // Add the sum to the FinalData array
            finalLabel.push("Other")
            var finalChartData = {
                datasets: [{
                    data: FinalData,
                    borderColor: config.color || '#3498db',
                    backgroundColor: config.color || '#3498db',
                }],
                labels: finalLabel
            }
            console.log(finalChartData)
            // Update the chart with the data
            this.chart.data = finalChartData;
            this.chart.update();
        }
    });

}(looker, Chart));