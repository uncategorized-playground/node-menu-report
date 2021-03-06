app.directive("touchGraph", function(){

  /**
  * Function getRandomColor()
  * @api {Public}
  * @return {String} - Random color.
  */
  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function generatePie(graph) {
     // Provide doughnut data.
    var data = [];
    var range = _.range(0, graph.values.length);

    range.forEach(function(r){
      data.push({
        color: getRandomColor(),
        value: graph.values[r]
      });
    });
    return data;
  }

  /**
  * Function doughnut()
  * @param {Object} graph - Input datas.
  * @param {Object} ctx - 2D context object.
  * @return {Object} - Chart object.
  */
  function doughnut(graph, ctx) {
    var data = generatePie(graph);

    //console.log(data);
    // Create doughnut chart.
    var chart = new Chart(ctx).Doughnut(data);
    return chart;
  }

  /**
  * Function pie().
  * Create pie chart.
  * @param {Object} graph - Input data.
  * @param {Object} ctx - 2D context object.
  * @return {Object}
  */
  function pie(graph, ctx) {
    var data = generatePie(graph);
    var chart = new Chart(ctx).Pie(data);
    return chart;
  }

  /**
  * Function bar().
  * Create bar chart.
  * @param {Object} graph - Input data.
  * @param {Object} ctx - 2D context object.
  * @return {Object} - Chart object.
  */
  function bar(graph, ctx) {

    var options = {
      scaleLabel : "<%=value%>",
      scaleOverlay : true,
      scaleShowLabels : true
    };
    // Provider bar data.
    var data = {
      labels: graph.columns,
      datasets: [
        {
          fillColor: "rgba(220,220,220,0.8)",
          strokeColor: "rgba(220,220,220,1)",
          data: graph.values
        }
      ]
    };
    // Create bar chart.
    var chart = new Chart(ctx).Bar(data, options);
    return chart;

  }

  /**
  * Function renderGraph().
  * @param {Object} graph - Input datas.
  * @api {Private}
  */
  function renderGraph(graph, chartType) {
    var ctype = chartType || "Bar";
    var ctx = $("#chart").get(0).getContext("2d");
    if(ctype === "bar") {
      var chart = bar(graph, ctx);
    }else if(ctype === "doughnut") {
      var graph = doughnut(graph, ctx);
    }else if(ctype === "pie") {
      var graph = pie(graph, ctx);
    }
  }

  /**
  * Function controller().
  * @param {Object} $scope - Angular auto inject $scope.
  * @api {Private}
  */
  function controller($scope) {

    function normal(datas) {
      var graph = $scope.graph = {};
      graph.values = datas.values;
      graph.columns = datas.columns;
      graph.datas = datas.datas;
      return graph;
    }

    $scope.graph = {};

    $scope.$on("displayGraph", function(event, datas){
      var graph = normal(datas);
      $scope.graph = graph;
      renderGraph(graph, $scope.chartType);
    });
  }

  /**
  * Function link().
  * @api {Private}
  */
  function link() { }

  /**
  * Return directive object.
  */
  return {
    restrict: "E",
    controller: controller,
    scope: {
      chartType: "@"
    },
    link: link,
    templateUrl: "/views/directives/touchGraphDirective.html"
  }
});
