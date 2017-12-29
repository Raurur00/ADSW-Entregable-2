module.exports  = function mueveReloj (hor, minut, segund, idSesion, indexEsc, listaSesiones, io) {
    if (listaSesiones[idSesion] == undefined) return;
    indexEsc2 = listaSesiones[idSesion].IdxEscActual;
    if (indexEsc != indexEsc2) return;
    var hour = hor;
    var minute = minut;
    var second = segund;
    var str_segundo = new String (second)
    if (str_segundo.length === 1)
        second = "0" + second;

    var str_minuto = new String (minute)
    if (str_minuto.length === 1)
        minute = "0" + minute;

    var str_hora = new String (hour)
    if (str_hora.length === 1)
        hour = "0" + hour;

    var horaImprimible = hour + " : " + minute + " : " + second;

    io.sockets.emit('timer', { countdown: horaImprimible });
    if (second == 0 & minute == 0 & hour == 0) {}
    else if (second > 0) second --;

    else if (second == 0 & minute == 0 & hour > 0){
        hour --;
        minute = 59;
        second = 59;
    }

    else if (second == 0 & minute > 0){
        minute -= 1;
        second = 59;
    }
    listaSesiones[idSesion].escenarios[indexEsc2].hh = hour;
    listaSesiones[idSesion].escenarios[indexEsc2].mm = minute;
    listaSesiones[idSesion].escenarios[indexEsc2].ss = second;
    setTimeout(function(){
        mueveReloj(hour, minute, second,
            idSesion, indexEsc, listaSesiones, io)
    },1000)
}