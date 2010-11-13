#!/usr/bin/env python

from optparse import OptionParser
import SocketServer
import SimpleHTTPServer
import urllib
import threading
from make import Compiler
import os, sys, time, socket

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
                self.wfile.write(code.encode('utf-8'))

            else:
                self.path = '/public' + os.path.normpath(self.path)
                return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

def main():
    global CODE_URL
    parser = OptionParser()
    parser.add_option("-u", "--url", dest="url",
                      help="the URL to serve the JS as. Default is '/cocos.js'", metavar="URL")

    parser.add_option("-l", "--host", dest="host",
                      help="the host/ip to listen on. Default is 127.0.0.1", metavar="HOST")

    parser.add_option("-p", "--port", dest="port",
                      help="the port to listen on. Default is 4000", metavar="PORT")

    (options, args) = parser.parse_args()

    if options.url and options.url[0] != '/':
        options.url = '/' + options.url

    host = options.host or 'localhost'
    port = int(options.port) if options.port else 4000

    CODE_URL = options.url or '/cocos2d.js'
    httpd = SocketServer.TCPServer((host, port), Cocos2D)
    httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    httpd_thread = threading.Thread(target=httpd.serve_forever)
    httpd_thread.setDaemon(True)
    httpd_thread.start()
    print "Listening at http://%s:%d/" % (host, port)
    
    
    running = True
    while running:
        try:
            time.sleep(3600)
        except (KeyboardInterrupt, SystemExit):
            running = False
            print "Shutting down"
            httpd.shutdown()
            httpd.server_close()

    return 0


if __name__ == "__main__":
    sys.exit(main())

