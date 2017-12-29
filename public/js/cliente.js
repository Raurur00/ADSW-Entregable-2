var socket = io.connect(window.location.host),
    message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    test = document.getElementById('test'),
    chat = document.getElementById('chat');
    idSesion = document.getElementById('idSesion');

//Enviar mensaje al hacer click
btn.addEventListener('click',function () {
    if (message.value.length > 0 & handle.value.length > 0 & message.value != " " & handle.value != " ") {
        socket.emit('chat', {
            message: message.value,
            handle: handle.value,
            sesion: idSesion.value
        });
        message.value = "";
    }
});

//enviar mensaje al presionar enter y borrarlo después
function myFunction(event) {
    var x = event.which || event.keyCode;
    if (x == 13 & message.value != " " & handle.value != " " & message.value.length > 0 & handle.value.length > 0) {
        socket.emit('chat', {
            message: message.value,
            handle: handle.value,
            sesion: idSesion.value
        });
        message.value = "";
    }
}


