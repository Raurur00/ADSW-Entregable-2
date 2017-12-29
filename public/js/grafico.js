
var GRAFICO = GRAFICO || (function(){
    var _idx = 0;
    var _args = []; // private
    var _names = [];
    var _listdivs = [];
    var _text = "";
    return {
        init : function(idx,Args,list_names,list_divs,text) {
            _idx = idx;
            _names = list_names;
            _args = Args;
            _listdivs = list_divs;
            _text = text;
        },
        draw: function() {
            document.getElementById("title").innerHTML = "<h2>"+ _text + _idx + " "+"<h2>";
            // Build the chart
            for (var i = 0; i < _listdivs.length; i++)
            {
                Highcharts.chart(_listdivs[i], {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: _names[i]
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    series: [{
                        name: 'Porcentaje',
                        colorByPoint: true,
                        data: _args[i]
                    }]
                });
            }
        }
    };
}());