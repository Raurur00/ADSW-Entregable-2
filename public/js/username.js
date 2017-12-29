var socket = io.connect(window.location.host),
    btnCreador = document.getElementById('submit1'),
    btnPart = document.getElementById('submit2');

btnCreador.addEventListener('click', function() {
    socket.emit('online', {
        username: document.getElementById("creador").value
    });
});

btnPart.addEventListener('click', function() {
    socket.emit('online', {
        username: document.getElementById("part").value
    });
});