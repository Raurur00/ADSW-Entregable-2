var socket = io.connect(window.location.host);
var hr = 0;
var min = 1;
var seg = 0;
var counter = document.getElementById('counter');
console.log('iniciando timer..');
socket.emit('iniciar',{
    hora: hr,
    minuto: min,
    segundo: seg
});

socket.on('timer',function (data) {
    counter.innerHTML = data.countdown;
});