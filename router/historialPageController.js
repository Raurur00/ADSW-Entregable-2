var encrypt = require('../controllers/encrypt');
var Participante = require('../controllers/Participante');
var Sesion = require('../controllers/Sesion');
module.exports = function (app, crypto) {
    app.get('/historial', function(req, res) {
        new Promise(function(resolve) {
            var part = new Participante(null, null, null, null);
            part.historial(req.user.id, resolve);
        }).then(function(data){
            new Promise(function(resolve2) {
                var part = new Participante(null, null, null, null);
                part.historial2(data, resolve2);
            }).then(function(data2) {
                res.render("historial.html", {
                    sesiones: data2
                });
            });

        });
    });

    app.get('/historial_en', function(req, res) {
        new Promise(function(resolve) {
            var part = new Participante(null, null, null, null);
            part.historial(req.user.id, resolve);
        }).then(function(data){
            new Promise(function(resolve2) {
                var part = new Participante(null, null, null, null);
                part.historial2(data, resolve2);
            }).then(function(data2) {
                res.render("historial_en.html", {
                    sesiones: data2
                });
            });

        });
    });

    app.post('/historial/sesion', function(req, res) {
        console.log("SESION ESCOGIDA: ", req.body.sesion);
        new Promise(function(resolve){
            var sesion = new Sesion(null, null, null);
            sesion.sesionesFunc(parseInt(req.body.sesion),resolve);
        }).then(function(data) {
            console.log("DATA: ", data);
            var idsEsc = [];
            data.forEach(function(esc) {
                idsEsc.push(esc.id);
            });
            console.log("IDSESC: ");
            new Promise(function(resolve2) {
                var sesion = new Sesion(null, null, null);
                sesion.votosFunc(idsEsc,resolve2);
            }).then(function(votos){
                console.log("VOTOS: ", votos);
                new Promise(function(resolve3) {
                    var sesion = new Sesion(null, null, null);
                    sesion.escenariosFunc(idsEsc,resolve3);
                }).then(function(escenarios) {
                    console.log("ESCENARIOS: ", escenarios);

                    var index = [];
                    var esc = [];
                    var keyPorEsc = {};
                    var resultados = {};
                    if (req.body.escenarios === undefined) index.push("1");
                    else index.push(req.body.escenarios);
                    console.log("NRO ESCENARIOS: ", escenarios.length);
                    for (var i = 0; i < escenarios.length; i++) {
                        esc.push(i+1);
                        keyPorEsc[escenarios[i].id] = i.toString();
                        resultados[i.toString()] = [];
                    }
                    var participantes = {};
                    for (var i = 0; i < votos.length; i++) {
                        if (!(votos[i].idPart in participantes)){
                            participantes[votos[i].idPart] = resultados[0].length;
                            for (keyEsc in resultados) {
                                resultados[keyEsc].push([votos[i].username,[]]);
                            }
                        }
                        resultados[keyPorEsc[votos[i].idEsc]][participantes[votos[i].idPart]][1].push(
                            [votos[i].idDec, votos[i].prioridad]
                        );
                    }
                    console.log("RESULTADOS: ", resultados);
                    for (keyEsc in resultados) {
                        console.log(keyEsc);
                        for(var i = 0; i < resultados[keyEsc].length; i++) {
                            console.log(resultados[keyEsc][i][0]);
                            for (var j = 0; j < resultados[keyEsc][i][1].length; j++) {
                                console.log(resultados[keyEsc][i][1][j]);
                            }
                        }
                    }
                    console.log("RESULTADOS: ", resultados);
                    var dec_todos_alta = []; // = [[indexEsc1,[dec1, dec3]],... ]
                    var dec_todos_media = [];
                    var dec_todos_media_alta = [];
                    var dec_todos_no_selec = [];
                    var cant_dec_tot = []; // [[indexEsc1,cant_dec1],...]
                    var cant_dec1_tot = [];
                    var cant_dec2_tot = [];
                    var cant_dec_tot50 = [];
                    var cant_dec2_tot50 = [];
                    var num_part = participantes.length;
                    var indexEsc = escenarios.length;

                    for (var idx in resultados)
                    {
                        var cant_dec = {};
                        var cant_dec1 = {};
                        var cant_dec2 = {};
                        var cant_dec3 = {};
                        var dec_aux = [];
                        var dec_aux1 = [];
                        var dec_aux2 = [];
                        var dec_aux3 = [];
                        for (Part in resultados[idx])
                        {
                            for (dec in resultados[idx][Part][1])
                            {
                                if (resultados[idx][Part][1][dec][1] === "Alta")
                                {
                                    if (resultados[idx][Part][1][dec][0] in cant_dec) cant_dec[resultados[idx][Part][1][dec][0]]++;
                                    else cant_dec[resultados[idx][Part][1][dec][0]] = 1;

                                    if (resultados[idx][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[idx][Part][1][dec][0]]++;
                                    else cant_dec2[resultados[idx][Part][1][dec][0]] = 1;
                                }
                                if (resultados[idx][Part][1][dec][1] === "Media")
                                {
                                    if (resultados[idx][Part][1][dec][0] in cant_dec1) cant_dec1[resultados[idx][Part][1][dec][0]]++;
                                    else cant_dec1[resultados[idx][Part][1][dec][0]] = 1;

                                    if (resultados[idx][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[idx][Part][1][dec][0]]++;
                                    else cant_dec2[resultados[idx][Part][1][dec][0]] = 1;
                                }
                                if (resultados[idx][Part][1][dec][1] === "No Seleccionada")
                                {
                                    if (resultados[idx][Part][1][dec][0] in cant_dec3) cant_dec3[resultados[idx][Part][1][dec][0]]++;
                                    else cant_dec3[resultados[idx][Part][1][dec][0]] = 1;
                                }

                            }
                        }
                        /////////////////////////////// Estadisticas ////////////////////////////////////
                        for (dec in cant_dec)
                        {
                            if (cant_dec[dec] == num_part) dec_aux.push(dec);
                        }
                        dec_todos_alta.push([idx,dec_aux]);

                        for (dec in cant_dec1)
                        {
                            if (cant_dec1[dec] == num_part) dec_aux1.push(dec);
                        }
                        dec_todos_media.push([idx,dec_aux1]);

                        for (dec in cant_dec2)
                        {
                            if (cant_dec2[dec] == num_part) dec_aux2.push(dec);
                        }
                        dec_todos_media_alta.push([idx,dec_aux2]);

                        for (dec in cant_dec3)
                        {
                            if (cant_dec3[dec] == num_part) dec_aux3.push(dec);
                        }
                        dec_todos_no_selec.push([idx,dec_aux3]);
                        /////////////////////////////////////////////////////////////////////////////////////

                        /////////////////// Armar estructuras para el grafico //////////////
                        var Aux = [];
                        var Aux50 = [];
                        for(key in cant_dec){
                            if (!(key in cant_dec3)) {
                                Aux.push({name: key, y: cant_dec[key]});
                                Aux50.push({name: key, y: cant_dec[key]});
                            }
                            else if (cant_dec3[key] >= num_part/2.0) {
                                Aux50.push({name: key, y: cant_dec[key]});
                            }
                        }
                        cant_dec_tot.push(Aux);
                        cant_dec_tot50.push(Aux50);

                        Aux = [];
                        for(key in cant_dec1){
                            if (!(key in cant_dec3)) {
                                Aux.push({name: key, y: cant_dec1[key]});
                            }
                        }
                        cant_dec1_tot.push(Aux);

                        Aux = [];
                        Aux50 = [];
                        for(key in cant_dec2){
                            if (!(key in cant_dec3)) {
                                Aux.push({name: key, y: cant_dec2[key]});
                                Aux50.push({name: key, y: cant_dec2[key]});
                            }
                            else if (cant_dec3[key] >= num_part/2.0) {
                                Aux50.push({name: key, y: cant_dec2[key]});
                            }
                        }
                        cant_dec2_tot.push(Aux);
                        cant_dec2_tot50.push(Aux50);

                        index.push(indexEsc-1);
                        /////////////////////////////////////////////////////////////////////////////
                    }

                    cant_dec_tot.stringify = JSON.stringify(cant_dec_tot);
                    cant_dec1_tot.stringify = JSON.stringify(cant_dec1_tot);
                    cant_dec2_tot.stringify = JSON.stringify(cant_dec2_tot);
                    cant_dec_tot50.stringify = JSON.stringify(cant_dec_tot50);
                    cant_dec2_tot50.stringify = JSON.stringify(cant_dec2_tot50);
                    dec_todos_alta.stringify = JSON.stringify(dec_todos_alta);
                    dec_todos_media.stringify = JSON.stringify(dec_todos_media);
                    dec_todos_media_alta.stringify = JSON.stringify(dec_todos_media_alta);
                    index.stringify = JSON.stringify(index);
                    console.log(req.user.username, req.user.id);
                    res.render('resultadoFinal.html', {
                        grafico1: cant_dec_tot,
                        grafico2: cant_dec1_tot,
                        grafico3: cant_dec2_tot,
                        grafico4: cant_dec_tot50,
                        grafico5: cant_dec2_tot50,
                        cant_dec: cant_dec,
                        todos_alta: dec_todos_alta,
                        todos_media: dec_todos_media,
                        todos_media_alta: dec_todos_media_alta,
                        username: req.user.username,
                        idSesionEnc: encrypt(req.body.sesion.toString(), crypto),
                        idPartEnc: encrypt(req.user.id.toString(), crypto),
                        indexEsc: indexEsc,
                        creador: true,
                        esc: esc,
                        idx: index,
                        idSesion: req.body.sesion,
                        historial: true,
                        en: req.body.english,
                        resultados: resultados
                    });

                });
            });

        });
    });
};