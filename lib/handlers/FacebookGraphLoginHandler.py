import tornado.web
import tornado.auth

class FacebookGraphLoginHandler(tornado.web.RequestHandler, tornado.auth.FacebookGraphMixin):
    """Facebook login. login_url points here. Once logged in, the secure 'uid' cookie is set"""
    @tornado.web.asynchronous
    def get(self):
        if self.get_argument("code", False):
            self.get_authenticated_user(
                redirect_uri=self.request.full_url(),
                client_id=self.settings["facebook_api_key"],
                client_secret=self.settings["facebook_secret"],
                code=self.get_argument("code"),
                callback=self.async_callback(self._on_login))
            return
        self.authorize_redirect(redirect_uri=self.request.full_url(),
                                client_id=self.settings["facebook_api_key"])

    def _on_login(self, user):
        self.set_secure_cookie('uid', user['id'])
        if self.get_argument("next", None):
            self.redirect(self.get_argument("next"))
        else:
            self.finish()

