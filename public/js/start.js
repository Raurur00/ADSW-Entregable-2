var socket = io.connect(window.location.host);
var btn = document.getElementById('iniciar_sesion');


//Enviar mensaje al hacer click
btn.addEventListener('click',function () {
    socket.emit('start', {
        d: window.location
    });
});

socket.on('start',function (data) {
    d.reload(true)
});



