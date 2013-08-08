import tornado.auth
import functools

def authenticate_from_cookie(method):
    """Just like wrapping with tornado.web.authenticate, but doesn't do anything if 'uid' secure cookie exists"""
    @functools.wraps(method)
    def wrapper(self, *args, **kwargs):
        if not self.get_secure_cookie('uid', None):
            return tornado.web.authenticated(method)(self, *args, **kwargs)
        return method(self, *args, **kwargs)
    return wrapper

