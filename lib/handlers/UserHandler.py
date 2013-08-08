from common import authenticate_from_cookie
import tornado.web

class UserHandler(tornado.web.RequestHandler):
    """Debuging purposes. Dump the content of the 'uid' cookie. Requires authentication"""
    @authenticate_from_cookie
    def get(self):
        self.write(self.get_secure_cookie("uid"))

