/*globals require module exports process console*/
/*jslint undef: true, strict: true, white: true, newcap: true, indent: 4 */
"use strict";

var sys       = require('sys'),
    http      = require('http'),
    url       = require('url'),
    path      = require('path'),
    fs        = require('fs'),
    mimetypes = require('../mimetypes'),
    Compiler  = require('./make').Compiler;

function parseOptions(args, defaults) {
    return defaults;
}

exports.description = 'Run the cocos2d development web server';
exports.run = function () {
    var options = parseOptions(arguments, {
        host: 'localhost',
        port: 4000,
        config: 'make.json'
    });


    var compiler = new Compiler(options.config);

    http.createServer(function (req, res) {
        var uri = url.parse(req.url, true);

        if (uri.pathname == '/') {
            uri.pathname = '/index.html';
        }


        // Serve app code
        if (uri.pathname == options.url) {
            var code = compiler.make();
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(code);
        } else {
            var filename = path.join(process.cwd(), 'public', uri.pathname);
            sys.puts("Serving: " + filename);
            if (path.existsSync(filename)) {
                var mimetype = mimetypes.guessType(uri.pathname);
                res.writeHead(200, {'Content-Type': mimetype});
                res.end(fs.readFileSync(filename));
            } else {
                res.writeHead(404, 'File not found');
                res.end('File not found');
            }
        }




    }).listen(parseInt(options.port, 10), options.host);
};
