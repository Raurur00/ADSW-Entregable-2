var socket = io.connect(window.location.host),
    btn = document.getElementById('iniciando');
    idSesion = document.getElementById('idSesion');

btn.addEventListener('click',function () {
    socket.emit('iniciando', {
            sesion: idSesion.value
        });
});