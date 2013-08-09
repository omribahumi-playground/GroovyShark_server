import json
import tornado.websocket

# dictionary containing {'clientId' => [websocket, ...], ...}
clients = {}

class GroovyWebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self, socketType):
        self.socketType = socketType # currently, either 'server' for the chrome extension
                                     # or 'client' for the HTML5 APP served from /static/
        self.clientId = self.get_secure_cookie('uid', None) # facebook userid

        # we cannot decorate this function like we do on regular handler
        # just check if the user is logged in and return a message if not
        if not self.clientId: 
            self.write_message(json.dumps({"type": "error", "error": "Not logged in"}))
            self.close()
            return

        print "WebSocket %s opened %s" % (self.socketType, self.clientId)
        if not self.clientId in clients:
            clients[self.clientId] = []
        clients[self.clientId].append(self)

    def on_message(self, message):
        """Every message recieved from a server is sent to all clients, and from a client to all servers"""
        print "WebSocket %s %s %r" % (self.socketType, self.clientId, message)

        for ws in clients[self.clientId]:
            if self.socketType != ws.socketType:
                ws.write_message(message)

    def on_close(self):
        print "WebSocket %s closed %s" % (self.socketType, self.clientId)
        if self.clientId:
            clients[self.clientId].remove(self)
            if not clients[self.clientId]:
                del clients[self.clientId]

