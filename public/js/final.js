var socket = io.connect(window.location.host),
    btn = document.getElementById('final');

btn.addEventListener('click',function () {
    socket.emit('final',{
        sesion: idSesion.value
    });
});