initSesion = document.getElementById('initSesion');
initSesion.addEventListener('click',function () {
    socket.emit('iniciar',{
        hora: 0,
        minuto: 1,
        segundo: 0
    });
});