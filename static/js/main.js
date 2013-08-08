function $(selector) {
    return document.querySelector(selector);
}

// from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
}

document.addEventListener("DOMContentLoaded", function(){
    var GroovyClient = function(address) {
        var self = this;
        var callbacks = new Object();

        self.ws = new WebSocket(address);

        self.send = function send(data) {
            self.ws.send(JSON.stringify(data));
        }

        self.invoke = function invoke(action, args, cb) {
            var data = {
                'type': 'call',
                'call': {
                    'function': action
                }
            };

            if (typeof args != undefined && args != null) {
                data['args'] = args;
            }

            if (typeof cb != undefined && cb != null) {
                var cbguid = guid();
                callbacks[cbguid] = cb;
                data['call']['callback'] = cbguid;
            }

            self.send(data);
        };

        self.ws.onopen = function(){
            console.log("WebSocket connected");
        };

        self.ws.onmessage = function(message){
            data = JSON.parse(message.data);
            console.log(data);
            if (data['type'] == 'return') {
                var ret, cb;
                if (typeof data['call']['callback'] != undefined && data['call']['callback'] != null) {
                    cb = callbacks[data['call']['callback']];
                    delete callbacks[data['call']['callback']];
                }

                if (typeof data['value'] != undefined && data['value'] != null) {
                    ret = data['value'];
                }

                if (cb != null) {
                    if (ret != null) {
                        cb.call(self, ret);
                    } else {
                        cb.call(self);
                    }
                }
            } else {
                console.log("Unknown message");
            }
        };
    }

    client = new GroovyClient("ws://" + window.location.host + "/ws/client/");

    $("#refresh").addEventListener('click', function(){
        client.invoke("getCurrentSong", null, function(song){
            console.log("Current song: " + song);
        });
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
