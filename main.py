#!/usr/bin/python
import os
import tornado.ioloop
import tornado.web
import tornado.websocket

# dictionary containing {'clientId' => [websocket, ...], ...}
clients = {}

class GroovyServerWebSocketHandler(tornado.websocket.WebSocketHandler):
    socketType = 'server'

    def open(self, clientId):
        self.clientId = clientId

        print "WebSocket Server opened", self.clientId
        if not self.clientId in clients:
            clients[self.clientId] = []
        clients[self.clientId].append(self)

    def on_message(self, message):
        """Every message recieved from a server is sent to all clients for that clientId"""
        print "WebSocket Server", self.clientId, message

        for ws in clients[self.clientId]:
            if ws.socketType == 'client':
                ws.write_message(message)

    def on_close(self):
        print "WebSocket Server closed", self.clientId
        clients[self.clientId].remove(self)
        if not clients[self.clientId]:
            del clients[self.clientId]

class GroovyClientWebSocketHandler(tornado.websocket.WebSocketHandler):
    socketType = 'client'

    def open(self, clientId):
        self.clientId = clientId

        print "WebSocket Client opened", self.clientId
        if not self.clientId in clients:
            clients[self.clientId] = []
        clients[self.clientId].append(self)

    def on_message(self, message):
        """Every message recieved from a client is sent to all servers for that clientId"""
        print "WebSocket Client", self.clientId, message

        for ws in clients[self.clientId]:
            if ws.socketType == 'server':
                ws.write_message(message)

    def on_close(self):
        print "WebSocket Client closed", self.clientId
        clients[self.clientId].remove(self)
        if not clients[self.clientId]:
            del clients[self.clientId]

application = tornado.web.Application([
    (r"/ws/server/([a-zA-Z0-9]+)", GroovyServerWebSocketHandler),
    (r"/ws/client/([a-zA-Z0-9]+)", GroovyClientWebSocketHandler),
    (r"/static/(.*)", tornado.web.StaticFileHandler,
        {"path": os.path.join(os.path.dirname(__file__), "static"),
         "default_filename": "index.html"}),
])

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()

