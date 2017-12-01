var socket = io.connect(window.location.host);
var creador = "<%= creador %>";
var submits = document.getElementsByName("submit");

for (var i = 0; i < submits.length; i++)
{
    submits[i].addEventListener('click',function(){
        if (creador == "true")
            socket.emit('online', {
                username: document.getElementById("text1").value
            });
        if (creador == "false")
            socket.emit('online', {
                username: document.getElementById("text2").value
            });
    });
}


