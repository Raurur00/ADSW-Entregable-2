var socket = io.connect(window.location.host);
var btn = document.getElementById('iniciar_sesion');
var result = document.getElementById('mostrar_resultados');
var idSesion = document.getElementById('iniciar');
var resultFinal = document.getElementById('resultfinal');

//Enviar mensaje al hacer click
btn.addEventListener('click',function () {
    socket.emit('start', {
        d: window.location
    });
});

resultFinal.addEventListener('click',function () {
    socket.emit('resultFinal', {
    });
});

result.addEventListener('click',function () {
    socket.emit('ver_result', {
        d: window.location
    });
});

socket.on('start',function (data) {
    d.reload(true)
});

socket.on('result',function (data) {
    d.reload(true)
});



