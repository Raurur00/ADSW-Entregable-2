var DROP = DROP || (function(){
    return {
        allowDrop: function(ev) {
            ev.preventDefault();
        },
        drop: function (ev, votos) {
            if (ev.preventDefault) {
                ev.preventDefault();
            }
            var data = ev.dataTransfer.getData("text");
            ev.target.appendChild(document.getElementById(data));
        },
        handleDragEnter: function (e) {
            // this / e.target is the current hover target.
            this.classList.add('over');
        },

        handleDragLeave: function (e) {
            this.classList.remove('over');  // this / e.target is previous target element.
        },
        readDropZone: function (dec){
            dec = [];
            for(i = 0; i < document.getElementById("dragzone").children.length; i++){
                dec.push(document.getElementById("dragzone").children[i].id);
            }
        },
        drag: function (ev) {
            ev.dataTransfer.setData("text", ev.target.id);
        }
    };
}());