var app = angular.module('sesion', ['LocalStorageModule']);

app.controller('crearSesion',['$scope', 'localStorageService',
    function ($scope, lss) {
        /*if (lss.get('variables')) {
            $scope.variables = lss.get('variables');
        } else {
            $scope.variables = {
                invRepetido: false,
                escRepetido: false,
                invitados: [],
                nuevoInvitado: "",
                escenarios: [],
                nuevoEsc: {
                    obj: null,
                    hh: null,
                    mm: null,
                    ss: null
                }
            };
        }*/

        $scope.variables = {
            invRepetido: false,
            escRepetido: false,
            invitados: [],
            nuevoInvitado: "",
            escenarios: [],
            nuevoEsc: {
                obj: null,
                hh: null,
                mm: null,
                ss: null
            }
        };

        $scope.agregarInvitado = function() {
            $scope.variables.escRepetido = false;
            $scope.variables.invRepetido = false;
            var repetido = false;
            $scope.variables.invitados.forEach(function(invitado) {
                if (invitado.toString() === $scope.variables.nuevoInvitado.toString()) {
                    $scope.variables.nuevoInvitado = "";
                    repetido = true;
                }
            });
            if (!repetido) {
                $scope.variables.invitados.push($scope.variables.nuevoInvitado);
                $scope.variables.nuevoInvitado = "";
            } else {
                $scope.variables.invRepetido = true;
            }
            //lss.set('variables', $scope.variables);

        };

        $scope.agregarEsc = function() {
            $scope.variables.escRepetido = false;
            $scope.variables.invRepetido = false;
            var repetido = false;
            $scope.variables.escenarios.forEach(function(esc) {
                if (esc.obj.toString() === $scope.variables.nuevoEsc.obj.toString()) {
                    $scope.variables.nuevoEsc = {
                        obj: null,
                        hh: null,
                        mm: null,
                        ss: null
                    };
                    repetido = true;
                }
            });
            if (!repetido) {
                $scope.variables.escenarios.push($scope.variables.nuevoEsc);
                $scope.variables.nuevoEsc = {
                    obj: null,
                    hh: null,
                    mm: null,
                    ss: null
                };
            } else {
                $scope.variables.escRepetido = true;
            }
            //lss.set('variables', $scope.variables);
        };

        /*$scope.finalizar = function() {
            lss.set('variables', {
                invRepetido: false,
                escRepetido: false,
                invitados: [],
                nuevoInvitado: "",
                escenarios: [],
                nuevoEsc: {
                    obj: null,
                    hh: null,
                    mm: null,
                    ss: null
                }
            });
        };*/
    }]);