#!/usr/bin/env python

from optparse import OptionParser
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

def main():
    parser = OptionParser()
    parser.add_option("-s", "--source", dest="input",
                      help="build source code in SRC. Default is main.js", metavar="SRC")

    (options, args) = parser.parse_args()

    httpd = SocketServer.ForkingTCPServer(('', PORT), Cocos2D)
    print "serving at port", PORT
    httpd.serve_forever()

if __name__ == "__main__":
    main()
