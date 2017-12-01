var socket = io.connect(window.location.host),
    message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    test = document.getElementById('test'),
    chat = document.getElementById('chat');

socket.emit('conectado', {
    username: handle.value,
    email: document.getElementById('email'),
    idSesion: document.getElementById('idSesion').value,
});

//Enviar mensaje al hacer click
btn.addEventListener('click',function () {
    if (message.value.length > 0 & handle.value.length > 0 & message.value != " " & handle.value != " ") {
        socket.emit('chat', {
            message: message.value,
            handle: handle.value
        });
        message.value = "";
    }
});



//Listen for events
socket.on('chat',function (data) {
    output.innerHTML += '<p><strong>'+ data.handle + ': </strong>'+data.message+'</p>';
    chat.scrollTop = chat.scrollHeight;
});

socket.on('online',function (data) {
    test.innerHTML += data.username + "<br>";
});

//enviar mensaje al presionar enter y borrarlo después
function myFunction(event) {
    var x = event.which || event.keyCode;
    if (x == 13 & message.value != " " & handle.value != " " & message.value.length > 0 & handle.value.length > 0) {
        socket.emit('chat', {
            message: message.value,
            handle: handle.value
        });
        message.value = "";
    }
}
