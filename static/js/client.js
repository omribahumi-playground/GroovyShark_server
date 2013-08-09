var GroovyClient = function(address) {
    var self = this;
    var callbacks = new Object();

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

    var ws = new WebSocket(address);

    function send(data) {
        ws.send(JSON.stringify(data));
    }

    // events
    var events = {};

    self.addEventListener = function addEventListener(type, listener) {
        if (typeof events[type] == 'undefined') {
            events[type] = new Array();
        }
        events[type].push(listener);
    };
    self.removeEventListner = function removeEventListener(type, listener) {
        if (typeof events[type] == 'undefined') {
            return;
        }
        var index = events[type].indexOf(listener);
        if (index != -1) {
            events[type].splice(index, 1);
        }
    };
    self.dispatchEvent = function dispatchEvent(type, eventObject) {
        console.log('Dispatching event ' + type);
        console.log(eventObject);

        if (typeof events[type] != 'undefined') {
            for (var i=0; i<events[type].length; i++) {
                events[type][i].call(self, eventObject);
            }
        }
    };

    self.invoke = function invoke(action, args, cb) {
        var data = {
            'type': 'call',
            'call': {
                'function': action
            }
        };

        if (typeof args != 'undefined' && args != null) {
            data['args'] = args;
        }

        if (typeof cb != 'undefined' && cb != null) {
            var cbguid = guid();
            callbacks[cbguid] = cb;
            data['call']['callback'] = cbguid;
        }

        send(data);
    };

    ws.onopen = function(){
        console.log("WebSocket connected");
    };

    ws.onmessage = function(message){
        data = JSON.parse(message.data);
        console.log(data);
        if (data['type'] == 'return') {
            var ret, cb;
            if (typeof data['call']['callback'] != 'undefined' && data['call']['callback'] != null) {
                cb = callbacks[data['call']['callback']];
                delete callbacks[data['call']['callback']];
            }

            if (typeof data['value'] != 'undefined' && data['value'] != null) {
                ret = data['value'];
            }

            if (cb != null) {
                if (ret != null) {
                    cb.call(self, ret);
                } else {
                    cb.call(self);
                }
            }
        } else if (data['type'] == 'event') {
            self.dispatchEvent(data['event']['type'], data['event']['data']);
        } else {
            console.log("Unknown message");
        }
    };
};
