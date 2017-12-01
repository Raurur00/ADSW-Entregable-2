var app = angular.module('sesion', ['ngXslt','ngSanitize']);

app.controller('decisiones',['$scope','$filter','$sce','$http',
    function ($scope,$filter,$sce,$http) {
        $scope.decXslt = '  <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
            '               <xsl:output method="xml" encoding="utf-8" />' +
            '               <xsl:template match="/">' +
            '                   <table class = "table">' +
            '                       <thead>' +
            '                       <tr>' +
            '                           <th> </th>' +
            '                           <th> Nombre </th>' +
            '                           <th> Mecanismo </th>' +
            '                           <th> Resultado </th>' +
            '                       </tr>' +
            '                       </thead>' +
            '                       <xsl:for-each select="decisiones/*">' +
            '                       <tbody>' +
            '                           <xsl:variable name="ID"><xsl:value-of select="id" /></xsl:variable>' +
            '                           <td><input type="hidden" name = "ids[]" value = "{$ID}"/></td><br/>' +
            '                           <td><xsl:value-of select="nombre"/></td>' +
            '                           <td><xsl:value-of select="mecanismo"/></td>' +
            '                           <td><xsl:value-of select="resultado"/></td>' +
            '                           <td>' +
            '                               <select name="prioridad">' +
            '                                   <option value="No Seleccionada">No Seleccionada</option>' +
            '                                   <option value="Baja">Baja</option>' +
            '                                   <option value="Media">Media</option>' +
            '                                   <option value="Alta">Alta</option>' +
            '                               </select>' +
            '                           </td>' +
            '                       </tbody>' +
            '                       </xsl:for-each>' +
            '                   </table>' +
            '               <button type="submit" id = "resultado" class="btn btn-default"> Enviar</button>' +
            '               </xsl:template>' +
            '           </xsl:stylesheet>';

}]);

app.filter('html', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);