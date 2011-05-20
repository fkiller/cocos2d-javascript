/*globals require module exports process console*/
/*jslint undef: true, strict: true, white: true, newcap: true, indent: 4 */
"use strict";

var sys       = require('sys'),
    http      = require('http'),
    qs        = require('querystring'),
    url       = require('url'),
    path      = require('path'),
    fs        = require('fs'),
    opts      = require('../opts'),
    mimetypes = require('../mimetypes'),
    Compiler  = require('./make').Compiler;


var options = [
    {   short: 'u',
        long: 'url',
        description: 'URL to serve the JavaScript as. Default is output defined in the config file',
        value: true },

    {   short: 'c',
        long: 'config',
        description: 'Configuration file. Default is make.json',
        value: true },

    {   short: 'h',
        long: 'host',
        description: 'Hostname or IP address to listen on. Default is localhost',
        value: true },

    {   short: 'p',
        long: 'port',
        description: 'Port to listen on. Default is 4000',
        value: true }
];

exports.description = 'Run the cocos2d development web server';
exports.run = function () {
    opts.parse(options, true);
    var host     = opts.get('host')   || 'localhost',
        port     = opts.get('port')   || 4000,
        config   = opts.get('config') || 'make.json',
        compiler = new Compiler(config),
        output   = opts.get('url')    || compiler.output.script || compiler.output;

    function resourcePath(filename) {
        return compiler.sourceForDest(filename)
    }


    http.createServer(function (req, res) {
        var uri = url.parse(req.url, true);

        if (uri.pathname == '/') {
            uri.pathname = '/index.html';
        }

        // Serve app code
        if (uri.pathname == '/' + output || uri.pathname == output.replace(/^\/?public/, '')) {
            var code = compiler.make();
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(code);
        } else {
            var publicFilename = path.join(process.cwd(), 'public', uri.pathname);
            // resource paths are prefixed with '/resources'
            var resourceFilename = qs.unescape(uri.pathname.replace(/^\/resources/, ''));
            sys.puts('Requested:' + resourceFilename);

            // If file exists in public folder, server that
            if (path.existsSync(publicFilename)) {
                sys.puts("Serving public file: " + publicFilename);

                var mimetype = mimetypes.guessType(uri.pathname);
                res.writeHead(200, {'Content-Type': mimetype});
                res.end(fs.readFileSync(publicFilename));
            }
            
            // Else if file is a resource in the app, server that 
            else if ((resourceFilename = resourcePath(resourceFilename))) {
                sys.puts("Serving resource file: " + resourceFilename);

                var mimetype = mimetypes.guessType(uri.pathname);
                res.writeHead(200, {'Content-Type': mimetype});
                res.end(fs.readFileSync(resourceFilename));
            }

            // File not found
            else {
                sys.puts("File not found: " + uri.pathname);
                res.writeHead(404, 'File not found');
                res.end('File not found');
            }
        }
    }).listen(parseInt(port, 10), host);

    sys.puts('Point your browser to http://' + host + ':' + port + '/');
};
