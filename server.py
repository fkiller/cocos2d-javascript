#!/usr/bin/env python

from optparse import OptionParser
import SocketServer
import SimpleHTTPServer
import urllib
from make import Compiler
import os

PORT = 4000

class Cocos2D(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/cocos2d.js':
            compiler = Compiler()
            code = compiler.make('src')

            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.end_headers()
            self.wfile.write(code)
        elif self.path == '/':
            self.path = '/public/index.html'
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        else:
            app_name = os.path.splitext(self.path[1:])[0]
            code_path = os.path.join(os.path.dirname(__file__), app_name)

            if os.path.isdir(code_path) and os.path.realpath(code_path).startswith(os.path.dirname(os.path.abspath(__file__))):
                compiler = Compiler()
                code = compiler.make(app_name)

                self.send_response(200)
                self.send_header('Content-Type', 'text/javascript')
                self.end_headers()
                self.wfile.write(code)

            else:
                self.path = '/public' + os.path.normpath(self.path)
                return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

def main():
    parser = OptionParser()
    parser.add_option("-s", "--source", dest="input",
                      help="build source code in SRC. Default is src", metavar="SRC")

    (options, args) = parser.parse_args()

    httpd = SocketServer.ForkingTCPServer(('', PORT), Cocos2D)
    print "serving at port", PORT
    httpd.serve_forever()

if __name__ == "__main__":
    main()

