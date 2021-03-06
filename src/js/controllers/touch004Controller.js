
/**
* @controller touch003Controller -
*/
app.controller("touch004Controller", function($scope, models, $rootScope, dbService){

  dbService.findAllCategoryByExample({ delete: false}, function(data){
    $scope.categories = data;
    var aa = _.filter(data, function(x){ return x.parentId == null; });
    var aaids = _.map(aa, function(x){ return x._id; });
    var bb = _.filter(data, function(x) { return aaids.indexOf(x.parentId) != -1; });
    var bbids = _.map(bb, function(x) { return x._id; });
    var cc = _.filter(data, function(x){ return bbids.indexOf(x.parentId) != -1;});
    $scope.allCategoriesC = cc;
  });

  dbService.findAllProductByExample({delete: false}, function(data){
    $scope.products = data;
  });

  /**
  * Scrop variable.
  */
  $scope.categoriesC = [];
  $scope.categories = [];
  $scope.products = [];
  $scope.allCategoriesC = [];

  /**
  * Check is product is under specific category.
  * @param {String} productId.
  * @param {String} categoryId.
  * @return {Boolean}.
  */
  $scope.isInCategoryC = function(productId, categoryId) {

    var all = $scope.categories;
    var products = $scope.products;
    var product = _.filter(products, function(x) { return x._id == productId })[0];

    if(!product) return false;
    var c = _.filter(all, function(x) { return product.categoryIds.indexOf(x._id) != -1; })[0];
    return c._id == categoryId;
  };

  /**
  * Start query.
  * Trigger when user click ((display)) button.
  */
  $scope.$on("startQuery", function(event, form){

    /**
    * Parse form data as specific query (can understand by server).
    */
    var query = models.parseQuery(form);
    var levelBId= form.categoryB._id;
    if(levelBId){
      var all = $scope.categories;
      var nbs = _.filter(all, function(x){ return x.parentId === levelBId; });
      $scope.categoriesC = nbs;
    }else {
      $scope.categoriesC = $scope.allCategoriesC;
    }

    /**
    * Start rest api request.
    * Endpoint - /report/touch001
    * Return - List of touch information.
    */
    dbService.post("/report/touch001", query, function(record){

      var columnIds = [];

      /**
      * Get column summary.
      * @param {String} column - Column value use as query key.
      * @return {Number} - Caculation result.
      */
      function getBranchSum(column) {
        var columnDatas= record.datas[column];
        if(!columnDatas) return 0;
        return columnDatas.length;
      }

      /**
      * Get element value.
      * Value compose from column and row.
      * @param {String} column - Column value.
      * @param {Number} $index - Row index.
      * @return {Number} - Caculation result.
      */
      function getBranchRecord(column, $index) {

        var columnDatas = record.datas[column];
        var rows = [];

        if(!columnDatas) return 0;

        var rs = 0;
        columnDatas.forEach(function(el){
          var catC = columnIds[$index];
          var ok = $scope.isInCategoryC(el.objectId, catC);
          if(ok) rs ++;
        });

        return rs;
      }

      /**
      * showGraph()
      * @param {Array} columns - Columns to render.
      * @param {Value} values - Graph values.
      */
      function showGraph(columns, values) {
        var graph = {
          columns: columns,
          values: values
        };

        $rootScope.$broadcast("displayGraph", graph);
      }

      /**
      * Function showTable()
      * Pass addition info into directive template.
      */
      function showTable(columns, values) {
        record.rows = columns;
        record.getBranchRecord = getBranchRecord;
        record.getBranchSum = getBranchSum;
        $rootScope.$broadcast("displayTable", record);
      }

      function createRowAndValue() {
        /**
      * Transform original data into prefer format.
      */
        var inx = 1;
        var columns =  _.map($scope.categoriesC, function(x) { return (inx++) + ". " + x.title; });
        var columnIds = _.map($scope.categoriesC, function(x) { return x._id; });
        var values = [];

        /**
      * Create graph values.
      */
        var index = 0;
        columnIds.forEach(function(column){
          var length = 1;
          record.datas.forEach(function(touchs){
            touchs.forEach(function(touch){
              var match = $scope.isInCategoryC(touch.objectId, column);
              if(match) length ++;
            });
          });

          values[index++] = length;
        });

        return {
          columns: columns,
          columnIds: columnIds,
          values: values
        };
      }

      /**
      * Render to screen.
      */
      var rv = createRowAndValue();
      columnIds = rv.columnIds;
      showGraph(rv.columns, rv.values);
      showTable(rv.columns, rv.values);

    });
  });
});
