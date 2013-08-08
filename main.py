#!/usr/bin/python
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lib"))

import tornado.ioloop
import tornado.web
import argparse
import yaml
from handlers import *

def main():
    parser = argparse.ArgumentParser(description='GroovyShark server')
    parser.add_argument('--config', default='config.yml',
                        type=argparse.FileType('r'),
                        help='Configuration file in YAML format (default: config.yml)')
    args = parser.parse_args()

    config = yaml.load(args.config)

    application = tornado.web.Application(
        [
            (r"/user", UserHandler),
            (r"/ws/(server|client)/?", GroovyWebSocketHandler),
            (r"/login/?", FacebookGraphLoginHandler),
            (r"/logout/?", LogoutHandler),
            (r"/static/(.*)", tornado.web.StaticFileHandler,
                {"path": os.path.join(os.path.dirname(__file__), "static"),
                 "default_filename": "index.html"})
        ],
        login_url='/login',
        **config['tornado_settings']
    )

    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()

