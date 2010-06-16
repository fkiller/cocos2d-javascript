window.__filename       = '__main__';
window.__dirname        = './';
window.__source_files__ = {};
window.__resources__    = {};

function __normalisePath(path) {
    path = path.replace(/\/.\//, '/');
    while (path.indexOf('/../') != -1) {
       path = path.replace(/\/[a-zA-Z_]+\/..\//, '/');
    }
    return path;
}

function require(sourcePath) {
    // If path doesn't start with a './' or '/' then it's a system include
    console.log('Requiring file: ', sourcePath, __dirname, __filename);
    if (!/^(\.\/)|\//.test(sourcePath)) {
        sourcePath = './libs/' + sourcePath;
    } else if (__filename != '__main__') {
        sourcePath = __dirname + '/' + sourcePath;
    }

    // And .js suffix if it's missing
    if (!/.js$/.test(sourcePath)) {
        sourcePath += '.js'
    }

    // Normalise path
    sourcePath = __normalisePath(sourcePath);

    var src = window.__source_files__[sourcePath];
    if (src == undefined) {
        throw "Failed to require script: " + sourcePath;
    }

    // Execute script only the first time it's accessed
    if (window.__source_files__[sourcePath] instanceof Function) {
        var prevFilename = window.__filename,
            prevDirname = window.__dirname;

        window.__filename = sourcePath;
        window.__dirname = __filename.replace(/\/[^\/]+$/, '');

        window.__source_files__[sourcePath] = window.__source_files__[sourcePath]();

        window.__filename = prevFilename;
        window.__dirname = prevDirname;
    }

    return window.__source_files__[sourcePath];
}

function resource(path) {
    return window.__resources__[__normalisePath(path)];
}
