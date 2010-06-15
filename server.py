#!/usr/bin/env python

import SocketServer
import SimpleHTTPServer
import urllib
import build
import os

PORT = 4000

class Cocos2D(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/cocos2d.js':
            b = build.Builder()
            code = b.build('src')

            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.end_headers()
            self.wfile.write(code)
        else:
            self.path = '/public' + self.path
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

httpd = SocketServer.ForkingTCPServer(('', PORT), Cocos2D)
print "serving at port", PORT
httpd.serve_forever()
