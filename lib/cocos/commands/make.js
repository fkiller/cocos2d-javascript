/*globals require module exports process console __dirname*/
/*jslint undef: true, strict: true, white: true, newcap: true, indent: 4 */
"use strict";

var sys       = require('sys'),
    opts      = require('../opts'),
    fs        = require('fs'),
    path      = require('path'),
    Template  = require('../template').Template,
    mimetypes = require('../mimetypes');

var options = [
    {   short: 'f',
        long: 'file',
        description: 'File to write output to. Overrides config file',
        value: true },

    {   short: 'c',
        long: 'config',
        description: 'Configuration file. Default is make.json',
        value: true }

];

mimetypes.addType('application/xml', '.tmx');
mimetypes.addType('application/xml', '.tsx');
mimetypes.addType('application/xml', '.plist');

var RESOURCE_TEMPLATE = new Template('__resources__["$resource"] = {meta: {mimetype: "$mimetype"}, data: $data};');
var TEXT_MIMETYPES = 'application/xml text/plain text/json application/json text/html'.split(' ');
var CODE_MIMETYPES = 'text/javascript application/javascript application/x-javascript'.split(' ');

/**
 * Merge an number of objects together and return the result as a new object
 */
function merge() {
    var o = {};
    for (var i = 0, len = arguments.length; i < len; i++) {
        var obj = arguments[i];
        for (var x in obj) {
            if (obj.hasOwnProperty(x)) {
                o[x] = obj[x];
            }
        }
    }

    return o;
}

/**
 * @memberOf cocos.commands.make
 * @class Compile a cocos2d project into a single javascript file
 * @param {String} [configFile=make.json] The project's config filename
 */
function Compiler(configFile) {
    this.readConfig = function (configFile) {
        sys.puts('Loading config: ' + configFile);

        var config = this.readJSONFile(configFile);
        this.output = config.output;
        this.mainModule = config.mainModule || config.main_module;
        this.extensions = config.extensions;

        return config;
    };

    this.config = this.readConfig(configFile || 'make.json');
}
(function () /** @lends cocos.commands.make.Compiler# */{

    /**
     * Read a JSON file and clean up any comments, unquoted keys and trailing
     * commas before returning the object
     *
     * @param {String} filename Name of the JSON file to read
     * @returns {Object} The JSON object
     */
    this.readJSONFile = function (filename) {
        var j = fs.readFileSync(filename, 'utf8');

        // Strip comments
        j = j.replace(/\/\/.*/g, '');
        j = j.replace(/\/\*(.|[\n\r])*?\*\//mg, '');

        // Fix unquoted keys
        j = j.replace(/\{\s*(\w)/g, '{"$1');
        j = j.replace(/,(\s*)(\w)/g, ',$1"$2');
        j = j.replace(/(\w):/g, '$1":');

        // Fix trailing comma
        j = j.replace(/,\s+\}/mg, '}');

        return JSON.parse(j);
    };

    this.__defineGetter__('appConfigFiles', function () {
        if (this.appConfigFiles_) {
            return this.appConfigFiles_;
        }

        var configs = ['src/libs/cocos2d/config.json', 'cocos2d/src/libs/cocos2d/config.json'];

        for (var source in this.config.paths) {
            if (this.config.paths.hasOwnProperty(source)) {
                var dest = this.config.paths[source];

                var c = path.join(source, 'config.json');
                if (path.existsSync(c)) {
                    configs.push(c);
                }
            }
        }

        this.appConfigFiles_ = configs;

        return this.appConfigFiles_;
    });

    /**
     * Reads all the app's config.js files and returns an of object their
     * values
     */
    this.__defineGetter__('appConfig', function () {
        if (this.appConfig_) {
            return this.appConfig_;
        }

        var vals = {}, data;
        for (var i = 0, len = this.appConfigFiles.length; i < len; i++) {
            var config = this.appConfigFiles[i];
            if (path.existsSync(config)) {
                data = this.readJSONFile(config);
                vals = merge(vals, data);
            }
        }

        this.appConfig_ = vals;
        return this.appConfig_;
    });

    /**
     * Compile everything into a single script
     */
    this.make = function () {
        var code = this.header || '';
        code += '\n(function() {\n';
        code += 'var __main_module_name__ = ' + JSON.stringify(this.mainModule) + ';\n';
        code += 'var __resources__ = {};\n';
        code += 'function __imageResource(data) { var img = new Image(); img.src = data; return img; };\n';

        // Add config options
        for (var key in this.appConfig) {
            if (this.appConfig.hasOwnProperty(key)) {
                code += 'var ' + key.toUpperCase() + ' = ' + JSON.stringify(this.appConfig[key]) + ';\n';
            }
        }

        // Add all the code/images/etc
        for (var source in this.config.paths) {
            if (this.config.paths.hasOwnProperty(source)) {
                var dest = this.config.paths[source];
                code += this.makePath(source, dest);
            }
        }

        var module_js = path.join(__dirname, 'module_js');
        code += fs.readFileSync(module_js, 'utf8');

        code += '\n})();\n';

        code += this.footer || '';

        return code;
    };

    /**
     * Compile everything at a path and return the code
     * 
     * @param {String} source Path to compile
     * @param {String} [dest=source] Output path
     * @returns {String} Compiled javascript source code
     */
    this.makePath = function (source, dest) {
        sys.puts('Building Path: ' + source + ' => ' + dest);

        var code = '';
        var files = this.scanForFiles(source);
        for (var i = 0, len = files.length; i < len; i++) {
            var sourceFile = files[i];
            if (!!~this.appConfigFiles.indexOf(sourceFile)) {
                continue;
            }

            var destFile = this.destForSource(sourceFile),
                mimetype = mimetypes.guessType(sourceFile);
                

            sys.puts('Building File: ' + sourceFile + ' => ' + destFile);
            code += '\n';
            code += RESOURCE_TEMPLATE.substitute({
                'mimetype': mimetype,
                'resource': destFile,
                'data': this.makeResource(sourceFile)
            });
        }


        return code;
    };

    this.destForSource = function (path) {
        for (var source in this.config.paths) {
            if (this.config.paths.hasOwnProperty(source)) {
                var dest = this.config.paths[source];

                // Source starts with config path
                if (path.indexOf(source) === 0) {
                    return path.replace(new RegExp(source), dest).replace(/\/+/, '/');
                }
            }
        }

        return source;
    };

    this.makeResource = function (filename) {
        var mimetype = mimetypes.guessType(filename);

        var isCode = (!!~CODE_MIMETYPES.indexOf(mimetype)),
            isText = (!!~TEXT_MIMETYPES.indexOf(mimetype)),
            isImage = (mimetype.split('/')[0] == 'image');

        var data;
        if (isCode) {
            data = fs.readFileSync(filename, 'utf8');
            data = "function(exports, require, module, __filename, __dirname) {\n" + data + "\n}";
        } else if (isText) {
            data = JSON.stringify(fs.readFileSync(filename, 'utf8'));
        } else if (isImage) {
            data = fs.readFileSync(filename).toString('base64');
            data = '__imageResource("data:' + mimetype + ';base64,' + data + '")';
        } else /* isBinary */ {
            data = JSON.stringify(fs.readFileSync(filename).toString('base64'));
        }

        return data;
    };

    this.guessMimeType = function (filename) {
        return 'image/png';
    };

    /**
     * Scan for files to build and return them as an array
     *
     * @param {String} source Path to scan
     * @returns {String[]} List of filenames
     */
    this.scanForFiles = function (source) {

        var foundFiles = [];

        // If given a file rather than a directory they just return that
        if (fs.statSync(source).isFile()) {
            return [source];
        }

        // Find all files in directory
        var files = fs.readdirSync(source);
        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];
            // Skip hidden files
            if (file[0] == '.') {
                continue;
            }

            var fullPath = path.join(source, file);

            if (fs.statSync(fullPath).isFile()) {
                // If extension isn't in our list then skip file
                if (this.extensions && this.extensions.length && !~this.extensions.indexOf(path.extname(file).slice(1))) {
                    continue;
                }

                foundFiles.push(fullPath);
            } else {
                // Directory
                foundFiles = foundFiles.concat(this.scanForFiles(fullPath));
            }

        }
        
        return foundFiles;
    };
}).call(Compiler.prototype);

exports.Compiler = Compiler;

exports.description = 'Compile a cocos2d project into a single javascript file';
exports.run = function () {
    opts.parse(options, true);

    var config   = opts.get('config') || 'make.json',
        compiler = new Compiler(config),
        output   = opts.get('file')   || compiler.output;

    var code = compiler.make();

    if (output) {
        sys.puts("Writing output to: " + output);
        fs.writeFileSync(output, code, 'utf8');
    } else {
        sys.puts(code);
    }
};
