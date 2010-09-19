#!/usr/bin/env python

from optparse import OptionParser
import SocketServer
import SimpleHTTPServer
import urllib
from make import Compiler
import os

PORT = 4000
CODE_URL = '/cocos2d.js'

class Cocos2D(SimpleHTTPServer.SimpleHTTPRequestHandler):

    def __init__(self, *args):
        print "Serving as:", CODE_URL
        self.compiler = Compiler('make.js')
        SimpleHTTPServer.SimpleHTTPRequestHandler.__init__(self, *args)


    def do_GET(self):
        if self.path == '/':
            self.path = '/public/index.html'
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        else:
            if CODE_URL == self.path:
                print "Building code"
                code = self.compiler.make()

                self.send_response(200)
                self.send_header('Content-Type', 'text/javascript')
                self.end_headers()
                self.wfile.write(code)

            else:
                self.path = '/public' + os.path.normpath(self.path)
                return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

def main():
    global CODE_URL
    parser = OptionParser()
    parser.add_option("-u", "--url", dest="url",
                      help="The URL to serve the JS as. Default is '/cocos.js'", metavar="URL")

    (options, args) = parser.parse_args()

    if options.url and options.url[0] != '/':
        options.url = '/' + options.url

    CODE_URL = options.url or '/cocos2d.js'
    httpd = SocketServer.ForkingTCPServer(('', PORT), Cocos2D)
    print "serving at port", PORT
    httpd.serve_forever()

if __name__ == "__main__":
    main()

