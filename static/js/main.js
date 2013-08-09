function $(selector) {
    return document.querySelector(selector);
}

document.addEventListener("DOMContentLoaded", function(){
    client = new GroovyClient("ws://" + window.location.host + "/ws/client/");

    client.addEventListener('playState', function(e){
        $('#playing_state').innerHTML = e.state;
    });

    client.addEventListener('songChange', function(e){
        $('#current_song').innerHTML = e.song.artistName + ' - ' + e.song.songName;
    });

    $("#prev").addEventListener('click', function(){
        client.invoke("prev");
    });

    $("#play").addEventListener('click', function(){
        client.invoke("play");
    });

    $("#pause").addEventListener('click', function(){
        client.invoke("pause");
    });

    $("#next").addEventListener('click', function(){
        client.invoke("next");
    });
});
