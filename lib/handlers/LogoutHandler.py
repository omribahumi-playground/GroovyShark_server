import tornado.web

class LogoutHandler(tornado.web.RequestHandler):
    """Logout? duh"""
    def get(self):
        self.clear_cookie('uid')

