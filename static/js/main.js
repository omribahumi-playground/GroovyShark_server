function $(selector) {
    return document.querySelector(selector);
}

document.addEventListener("DOMContentLoaded", function(){
    var GroovyClient = function(address) {
        var self = this;
        self.ws = new WebSocket(address);

        self.send = function send(data) {
            self.ws.send(JSON.stringify(data));
        }

        self.invoke = function invoke(action, args) {
            var data = {
                'type': 'call',
                'call': {
                    'function': action
                }
            };

            if (typeof args != undefined) {
                data['args'] = args;
            }

            self.send(data);
        };

        self.ws.onopen = function(){
            console.log("WebSocket connected");
        };

        self.ws.onmessage = function(message){
            data = JSON.parse(message.data);
            console.log(data);
        };
    }

    client = new GroovyClient("ws://" + window.location.host + "/ws/client/dummyClientId");

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
