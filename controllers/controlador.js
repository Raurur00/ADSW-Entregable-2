var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http) {
    $scope.firstName= "John";
    $scope.lastName= "Doe";
    $scope.decisiones = ["hola", "ke", "ase"];
    $http.get("api/decisiones").then(function(data){
        $scope.decisiones = data.data;
    });
});