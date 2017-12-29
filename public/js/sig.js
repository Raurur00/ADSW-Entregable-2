var socket = io.connect(window.location.host),
    btn = document.getElementById('sig');

btn.addEventListener('click',function () {
    socket.emit('sig',{
        sesion: idSesion.value
    });
});