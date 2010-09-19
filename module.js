function resource(path) {
    return window.__resources__[path].data;
}

(function() {
    var process = {};
    var modulePaths = ['/libs'];

    var path; // Will be loaded further down

    function resolveModulePath(request, parent) {
        // If not a relative path then search the modulePaths for it
        var start = request.substring(0, 2);
        if (start !== "./" && start !== "..") {
            return [request, modulePaths];
        }

        var parentIsIndex = path.basename(parent.filename).match(/^index\.js$/),
            parentPath    = parentIsIndex ? parent.id : path.dirname(parent.id),
            id            = path.join(parentPath, request);

        // Relative path so searching inside parent's directory
        return [id, [path.dirname(parent.filename)]];
    }

    function findModulePath(id, dirs) {
        if (id.charAt(0) === '/') {
            dirs = [''];
        }
        for (var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var p = path.join(dir, id);

            // Check for index first
            if (path.exists(path.join(p, 'index.js'))) {
                return path.join(p, 'index.js');
            } else if (path.exists(p) + '.js') {
                return p + '.js';
            }
        }

        return false;
    }

    function loadModule(request, parent) {
        var resolvedModule = resolveModulePath(request, parent),
            id             = resolvedModule[0],
            paths          = resolvedModule[1],
            filename       = findModulePath(request, paths);

        var cachedModule = parent.moduleCache[filename];
        if (cachedModule) {
            return cachedModule.exports;
        }

        var module = new Module(id, parent);
        module.moduleCache[filename] = module;
        module._initialize(filename);

        return module.exports;
    }

    function Module(id, parent) {
        this.id = id;
        this.parent = parent;
        this.children = [];
        this.exports = {};

        if (parent) {
            this.moduleCache = parent.moduleCache;
            parent.children.push(this);
        } else {
            this.moduleCache = {};
        }

        this.filename = null;
        this.dirname = null;
    }

    Module.prototype._initialize = function(filename) {
        var module = this;
        function require(request) {
            return loadModule(request, module);
        }

        this.filename = filename;

        // Work around incase this IS the path module
        if (path) {
            this.dirname = path.dirname(filename);
        } else {
            this.dirname = '/libs';
        }

        require.paths = modulePaths;
        require.main = process.mainModule;

        window.__resources__[this.filename].data.apply(this.exports, [this.exports, require, this, this.filename, this.dirname])

        return this;
    }


    // Manually load the path module because we need to to load other modules
    path = (new Module('path'))._initialize('/libs/path.js').exports;

    process.mainModule = (new Module('/'))._initialize('/index.js');
})();
