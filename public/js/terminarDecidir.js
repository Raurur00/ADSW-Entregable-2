var socket = io.connect(window.location.host),
    btn = document.getElementById('enviar_decisiones');

btn.addEventListener('click',function () {
    socket.emit('enviar_decisiones',{
        sesion: idSesion.value,
        indexEsc: parseInt("<%=indexEsc -1 %>")
    });
});