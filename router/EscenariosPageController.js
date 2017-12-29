var models  = require('../models');
var decrypt = require('../controllers/decrypt');

module.exports = function (app,crypto,listaSesiones) {
    var listaDecisiones=null;
    app.post('/sesion/escenario/:idSesion/:indexEsc/:idPart/:username', function (req, res) {
        console.log("JELOUUUUUUUUUUUUU EDICION: ", req.body.editar);
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var nocreador = true;
        var editar = req.body.editar;
        var hr_finish = new Date().getTime();
        var hr_finish_editar = -1;
        var tiempo_extra = hr_finish + 1000*60*10;
        if (editar == "true") for (var i = 0; i < listaSesiones[idSesion].participantes.length;i ++) {
            if (parseInt(listaSesiones[idSesion].participantes[i].id) === parseInt(idPart)) {
                if (listaSesiones[idSesion].participantes[i].hr_finish == -1)
                    listaSesiones[idSesion].participantes[i].hr_finish = tiempo_extra;
                break;
            }
        }
        for (var i = 0; i < listaSesiones[idSesion].participantes.length;i ++) {
            if (parseInt(listaSesiones[idSesion].participantes[i].id) === parseInt(idPart)) {
                hr_finish_editar = listaSesiones[idSesion].participantes[i].hr_finish;
            }
        }
        if (req.body.editar2 == "true") editar = true; //estoy agregando tiempo en editar
        var indexEsc = parseInt(req.params.indexEsc);
        console.log("DAR TIEMPO",req.body.dar_tiempo,req.body.hh,req.body.mm,req.body.ss);
        if (parseInt(listaSesiones[idSesion].moderador) === idPart) {
            nocreador = false;
        }
        var namePart = 0;
        listaSesiones[idSesion].bool_result_final[3] = true;
        for (var i = 0; i < listaSesiones[idSesion].participantes.length;i ++){
            console.log(parseInt(listaSesiones[idSesion].participantes[i].id), parseInt(idPart), listaSesiones[idSesion].participantes[i].username);
            if (parseInt(listaSesiones[idSesion].participantes[i].id) === parseInt(idPart)) {
                namePart = i;
            }
        }
        listaSesiones[idSesion].IdxEscActual = indexEsc;
        listaSesiones[idSesion].inicio = true;
        listaSesiones[idSesion].escenarios.ver_resultado = false;
        hr_finish += 1000*60*60*listaSesiones[idSesion].escenarios[indexEsc].hh
            + 1000*60*listaSesiones[idSesion].escenarios[indexEsc].mm
            + 1000*listaSesiones[idSesion].escenarios[indexEsc].ss;
        if (req.body.dar_tiempo == "true" && idPart === listaSesiones[idSesion].moderador &&
            listaSesiones[idSesion].escenarios[indexEsc].flag)
        {
            if (1000*60*60*listaSesiones[idSesion].escenarios[indexEsc].hh
                + 1000*60*listaSesiones[idSesion].escenarios[indexEsc].mm
                + 1000*listaSesiones[idSesion].escenarios[indexEsc].ss <= 0 &&
                listaSesiones[idSesion].escenarios[indexEsc].hr_finish2 - hr_finish < 0)
            {
                listaSesiones[idSesion].escenarios[indexEsc].hr_finish2 = hr_finish +
                    1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
                listaSesiones[idSesion].escenarios[indexEsc].hr_finish = 0;
            }
            else
            {
                listaSesiones[idSesion].escenarios[indexEsc].flag = 0;
                if (listaSesiones[idSesion].escenarios[indexEsc].hr_finish2 - hr_finish > 0)
                    listaSesiones[idSesion].escenarios[indexEsc].hr_finish2 +=
                        1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
                else listaSesiones[idSesion].escenarios[indexEsc].hr_finish +=
                    1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
            }
        }
        hr_finish += listaSesiones[idSesion].escenarios[indexEsc].hr_finish;

        ///////////////// AQUI GUARDARÉ LOS VOTOS AHORA /////////////
        ///////////// TAMBIEN DEBERIA IR EN RESULTADO FINAL :) /////////////
        if (indexEsc !== 0 && req.body.editar === "false" && !nocreador) {
            listaSesiones[idSesion].escenarios[indexEsc-1].votos.forEach(function(voto) {
                console.log("GUARDANDO EN ESCENARIO CON EL VOTANTE: ", voto.idParticipante, voto.username);
                listaSesiones[idSesion].escenarios[indexEsc-1].crearVoto(voto.prioridad, voto.idDecision ,voto.idParticipante, voto.username);
            });
        }
        models.Decision.findAll().then(function (decision) {
            listaDecisiones = decision;
            res.render('decisiones.html', {
                username: req.params.username,
                idSesion: idSesion,
                idSesionEnc: req.params.idSesion,
                idPart: idPart,
                idPartEnc: req.params.idPart,
                indexEsc: indexEsc,
                dec: listaDecisiones,
                esc: listaSesiones[idSesion].escenarios[indexEsc],
                hor: listaSesiones[idSesion].escenarios[indexEsc].hh,
                mi: listaSesiones[idSesion].escenarios[indexEsc].mm,
                se: listaSesiones[idSesion].escenarios[indexEsc].ss,
                hr_finish: hr_finish,
                hr_finish2: listaSesiones[idSesion].escenarios[indexEsc].hr_finish2,
                hr_finish_editar: hr_finish_editar,
                n: listaSesiones[idSesion].escenarios[indexEsc].cont,
                nocreador: nocreador,
                namePart: namePart,
                tiempo_extra: tiempo_extra,
                editar: editar,
                editar2: req.body.editar2,
                moderador: listaSesiones[idSesion].moderador,
                en: req.body.english
            });
        });
    });
    app.post('/sesion/escenario/mandar_decisiones/:idSesion/:indexEsc/:idPart/:username', function(req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        listaSesiones[idSesion].inicio = false;
        escenarioActual = (listaSesiones[idSesion].escenarios)[indexEsc];
        for (var i = escenarioActual.votos.length-1; i >= 0; i--) {
            console.log("EN EL FOR PA ELIMINAR WEAS: ", escenarioActual.votos[i].idParticipante, idPart);
            if (escenarioActual.votos[i].idParticipante === idPart) {
                console.log("SE ESTAN ELIMINANDO WEAS!");
                escenarioActual.votos.splice(i, 1);
            }
        }
        var id = 0;
        req.body.ids.forEach(function (idDecision) {
            escenarioActual.votos.push({
                prioridad: req.body.prioridad[id],
                idDecision: idDecision,
                idParticipante: idPart,
                username: req.params.username
            });
            id++;
        });
        indexEsc = parseInt(indexEsc)+1;
        if (indexEsc <= listaSesiones[idSesion].escenarios.length) {
            res.render('mandarDecisiones.html', {
                forzar_envio: req.body.forzar_envio,
                username: req.params.username,
                idSesionEnc: req.params.idSesion,
                idPartEnc: req.params.idPart,
                indexEsc: indexEsc,
                inicio: listaSesiones[idSesion].inicio,
                ver_resultado: listaSesiones[idSesion].escenarios.ver_resultado,
                en: req.body.english
            });
        }
    });

    app.post('/sesion/fin/:idSesion/:indexEsc/:idPart/:username', function(req, res) {
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        models.Participante.destroy({
            where: {
                registrado: 0
            }
        });
        models.Sesion_user.destroy({
            where: {
                ParticipanteId: null
            }
        });
        if (idSesion in listaSesiones) {
            delete listaSesiones[idSesion];
        }
        res.render("finSesion.html",{
            en: req.body.english,
            idSesionEnc: req.params.idSesion,
            indexEsc: req.params.indexEsc,
            idPartEnc: req.params.idPart,
            username: req.params.username

        });
    });

    app.post('/sesion/escenario/resultado/:idSesion/:indexEsc/:idPart/:username', function(req, res){
        console.log(req.body.forzar_envio);
        var aux = {};
        var VotosporPar = {};
        var cant_dec = {};
        var cant_dec1 = {};
        var cant_dec2 = {};
        var cant_dec3 = {};
        var dec_aux = [];
        var dec_aux1 = [];
        var dec_aux2 = [];
        var dec_aux3 = [];
        var cant_dec_tot = [];
        var cant_dec_tot50 = [];
        var cant_dec1_tot = [];
        var cant_dec2_tot = [];
        var cant_dec2_tot50 = [];
        var dec_todos_alta = [];
        var dec_todos_media = [];
        var dec_todos_media_alta = [];
        var dec_todos_no_selec = [];
        var index = [];
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        var votosEsc = listaSesiones[idSesion].escenarios[indexEsc-1].votos;
        var num_part = listaSesiones[idSesion].participantes.length;
        console.log("VER AQUI",votosEsc);

        var hr_finish = new Date().getTime();
        hr_finish += 1000*60*60*listaSesiones[idSesion].escenarios[indexEsc-1].hh
            + 1000*60*listaSesiones[idSesion].escenarios[indexEsc-1].mm
            + 1000*listaSesiones[idSesion].escenarios[indexEsc-1].ss;

        if (req.body.dar_tiempo == "true") //se dio tiempo a los participantes que faltan por votar
        {
            if (1000*60*60*listaSesiones[idSesion].escenarios[indexEsc-1].hh
                + 1000*60*listaSesiones[idSesion].escenarios[indexEsc-1].mm
                + 1000*listaSesiones[idSesion].escenarios[indexEsc-1].ss <= 0 &&
                listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish2 - hr_finish < 0)
            {
                listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish2 = hr_finish +
                    1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
                listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish = 0;
            }
            else
            {
                listaSesiones[idSesion].escenarios[indexEsc-1].flag = 0;
                if (listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish2 - hr_finish > 0)
                    listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish2 +=
                        1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
                else listaSesiones[idSesion].escenarios[indexEsc-1].hr_finish +=
                    1000*60*60*req.body.hh + 1000*60*req.body.mm + 1000*req.body.ss;
            }
        }

        listaSesiones[idSesion].escenarios.ver_resultado = true;
        var creador = false;
        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            creador = true;
        }
        if (listaSesiones[idSesion].resultado_final.length < indexEsc) {
            for (i = 0; i < listaDecisiones.length; i++) {
                aux[listaDecisiones[i].dataValues.id] = 0;
            }
        }

        for(i = 0; i < votosEsc.length; i++) {
            VotosporPar[votosEsc[i].idParticipante] = [];
        }
        for(i = 0; i < votosEsc.length; i++) {
            VotosporPar[votosEsc[i].idParticipante].push([votosEsc[i].idDecision,votosEsc[i].prioridad]);
        }

        if (creador && listaSesiones[idSesion].bool_result_final[3]) {
            for (i = 0; i < votosEsc.length; i++) {
                listaSesiones[idSesion].bool_result_final[3] = false;
            }
        }
        listaSesiones[idSesion].bool_result_final[0]++;
        console.log("AAAAAAAAAAAAAAAAAH: ", indexEsc, listaSesiones[idSesion].escenarios.length);
        if (indexEsc === listaSesiones[idSesion].escenarios.length)
            listaSesiones[idSesion].bool_result_final[1] = true;


        F = []; /*F=[[nombrePart1,[[dec1,prioridad],[dec2,prioridad],...]],
                [nombrePart2,[[dec1,prioridad],[dec2,prioridad],...]]]*/
        for (idPart in VotosporPar){
            aux = [];
            aux2 = [];
            for (i = 0; i < listaSesiones[idSesion].participantes.length; i++){
                if (parseInt(listaSesiones[idSesion].participantes[i].id) == parseInt(idPart)){
                    aux.push(listaSesiones[idSesion].participantes[i].username);
                    break;
                }

            }
            for (dec = 0; dec < VotosporPar[idPart].length; dec++) {
                for (i = 0; i < listaDecisiones.length; i++) {
                    if (parseInt(listaDecisiones[i].id) == parseInt(VotosporPar[idPart][dec][0])) {
                        aux2.push([listaDecisiones[i].nombre,VotosporPar[idPart][dec][1]]);
                        break;
                    }
                }
            }
            aux.push(aux2);

            F.push(aux);
        }
        listaSesiones[idSesion].resultados[indexEsc - 1] = F;
        var resultados = listaSesiones[idSesion].resultados;


        for (Part in resultados[indexEsc-1]) {
            for (dec in resultados[indexEsc-1][Part][1]) {

                if (resultados[indexEsc-1][Part][1][dec][1] === "No Seleccionada") {
                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec3) cant_dec3[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec3[resultados[indexEsc-1][Part][1][dec][0]] = 1;

                }

                if (resultados[indexEsc-1][Part][1][dec][1] === "Alta") {
                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec) cant_dec[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec[resultados[indexEsc-1][Part][1][dec][0]] = 1;

                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec2[resultados[indexEsc-1][Part][1][dec][0]] = 1;
                }

                if (resultados[indexEsc-1][Part][1][dec][1] === "Media") {
                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec1) cant_dec1[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec1[resultados[indexEsc-1][Part][1][dec][0]] = 1;

                    if (resultados[indexEsc-1][Part][1][dec][0] in cant_dec2) cant_dec2[resultados[indexEsc-1][Part][1][dec][0]]++;
                    else cant_dec2[resultados[indexEsc-1][Part][1][dec][0]] = 1;
                }

            }
        }
        /////////////////////////////// Estadisticas ////////////////////////////////////
        for (dec in cant_dec)
        {
            if (cant_dec[dec] == num_part) dec_aux.push(dec);
        }
        dec_todos_alta.push([indexEsc-1,dec_aux]);

        for (dec in cant_dec1)
        {
            if (cant_dec1[dec] == num_part) dec_aux1.push(dec);
        }
        dec_todos_media.push([indexEsc-1,dec_aux1]);

        for (dec in cant_dec2)
        {
            if (cant_dec2[dec] == num_part) dec_aux2.push(dec);
        }
        dec_todos_media_alta.push([indexEsc-1,dec_aux2]);

        for (dec in cant_dec3)
        {
            if (cant_dec3[dec] == num_part) dec_aux3.push(dec);
        }
        dec_todos_no_selec.push([indexEsc-1,dec_aux3]);
        /////////////////////////////////////////////////////////////////////////////

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


        cant_dec_tot.stringify = JSON.stringify(cant_dec_tot);
        cant_dec1_tot.stringify = JSON.stringify(cant_dec1_tot);
        cant_dec2_tot.stringify = JSON.stringify(cant_dec2_tot);
        cant_dec_tot50.stringify = JSON.stringify(cant_dec_tot50);
        cant_dec2_tot50.stringify = JSON.stringify(cant_dec2_tot50);
        index.stringify = JSON.stringify(index);
        var names_conectados = [];
        for (var i = 0; i < listaSesiones[idSesion].conectados.length; i++) {
            if (listaSesiones[idSesion].conectados[i].username !== req.params.username)
                names_conectados.push(listaSesiones[idSesion].conectados[i].username);
        }
        console.log("TENGO Q VER AQUI2:",req.body.english);
        res.render('resultadoEsc.html', {
            forzar_envio: req.body.forzar_envio,
            names: names_conectados,
            revisados: listaSesiones[idSesion].escenarios[indexEsc-1].revisados,
            grafico1: cant_dec_tot,
            grafico2: cant_dec1_tot,
            grafico3: cant_dec2_tot,
            grafico4: cant_dec_tot50,
            grafico5: cant_dec2_tot50,
            altas: dec_todos_alta,
            medias: dec_todos_media ,
            altas_medias: dec_todos_media_alta,
            VotosporPart: F,
            username: req.params.username,
            idSesion: idSesion,
            idSesionEnc: req.params.idSesion,
            idPartEnc: req.params.idPart,
            indexEsc: indexEsc,
            creador: creador,
            inicio: listaSesiones[idSesion].inicio,
            result_final: listaSesiones[idSesion].bool_result_final[1],
            result_final_part: listaSesiones[idSesion].bool_result_final[2],
            idx: index,
            moderador: listaSesiones[idSesion].moderador,
            idPart: idPart,
            en: req.body.english,
            dec_enviadas: listaSesiones[idSesion].escenarios[indexEsc-1].enviar_decisiones
        });
    });

    app.post('/sesion/resultfinal/:idSesion/:indexEsc/:idPart/:username', function(req, res){
        var idSesion = parseInt(decrypt(String(req.params.idSesion), crypto));
        var idPart = parseInt(decrypt(String(req.params.idPart), crypto));
        var indexEsc = parseInt(req.params.indexEsc);
        var creador = false;
        var dec_todos_alta = []; // = [[indexEsc1,[dec1, dec3]],... ]
        var dec_todos_media = [];
        var dec_todos_media_alta = [];
        var dec_todos_no_selec = [];
        var cant_dec_tot = []; // [[indexEsc1,cant_dec1],...]
        var cant_dec1_tot = [];
        var cant_dec2_tot = [];
        var cant_dec_tot50 = [];
        var cant_dec2_tot50 = [];
        var num_part = listaSesiones[idSesion].participantes.length;
        var esc = [];
        var index = [];

        if (parseInt(listaSesiones[idSesion].moderador) === parseInt(idPart)) {
            creador = true;
        }

        /////////// GUARDANDO EN LA BD LOS VOTOS ///////////////
        if (indexEsc !== 0 && creador && !listaSesiones[idSesion].votosGuardados) {
            listaSesiones[idSesion].escenarios[indexEsc-1].votos.forEach(function(voto) {
                console.log("GUARDANDO EN FINAL CON EL VOTANTE: ", voto.idParticipante, voto.username);
                listaSesiones[idSesion].escenarios[indexEsc-1].crearVoto(voto.prioridad, voto.idDecision ,voto.idParticipante, voto.username);
            });
            listaSesiones[idSesion].votosGuardados = true;
        }

        if (req.body.escenarios === undefined) index.push("1");
        else index.push(req.body.escenarios);
        for (var i = 0; i < listaSesiones[idSesion].escenarios.length; i++)
        {
            esc.push(i+1);
        }

        /*  resultados={"0": F_1,"1"; F_2,..}
            F_n=[[nombrePart1,[[dec1,prioridad],[dec2,prioridad],...]],
                [nombrePart2,[[dec1,prioridad],[dec2,prioridad],...]]]*/

        var resultados = listaSesiones[idSesion].resultados;

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


        listaSesiones[idSesion].resultado_final.stringify = JSON.stringify(listaSesiones[idSesion].resultado_final);
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
            res_final: listaSesiones[idSesion].resultado_final,
            username: req.params.username,
            idSesionEnc: req.params.idSesion,
            idPartEnc: req.params.idPart,
            indexEsc: indexEsc  ,
            creador: creador,
            inicio: listaSesiones[idSesion].inicio,
            result_final: listaSesiones[idSesion].bool_result_final[1],
            esc: esc,
            idx: index,
            idSesion: idSesion,
            historial: false,
            en: req.body.english,
            resultados: resultados
        });
    });
};