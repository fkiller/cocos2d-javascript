@require "core.js";

CC.Object = function() { this._init.apply(this, arguments); };
CC.Object = CC.extend(CC.Object, {
    isObject: true,
    _observers: null,
    superclass: null,

    /**
     * Creates a new instance of this object
     * var foo = CC.Object.create();
     */
    create: function() {
        var ret = new this();
        ret.init.apply(ret, arguments);
        return ret;
    },

    extend: function() {
        var newObj = function() {
                this._init.apply(this, arguments);
            },
            args = [],
            i;

        // Copy 'class' methods
        for (x in this) {
            // Don't copy built-ins
            if (!this.hasOwnProperty(x)) {
                continue;
            }

            newObj[x] = this[x];
        }


        // Add given properties to the prototype
        newObj.prototype = CC.beget(this.prototype)
        args.push(newObj.prototype);
        for (i = 0; i<arguments.length; i++) {
            args.push(arguments[i])
        }
        CC.extend.apply(CC, args);

        newObj.superclass = this;
        // Create new instance
        return newObj;
    },

    get: function(path) {
        var path = path.split('.'),
            obj = this,
            prop,
            key;

        while (key = path.shift()) {
            prop = obj[key];
            if (prop instanceof Function && prop._isProperty) {
                prop = prop.call(obj, key);
            }

            obj = prop;
        }

        return prop;
    },

    // TODO Handle dot notated path to key
    set: function(key, val) {
        var prop = this[key];
        if (prop instanceof Function && prop._isProperty) {
            return prop.call(this, key, val);
        }



        var oldVal = this.get(key);

        this[key] = val;
        val = this.get(key);

        if (this._observers && this._observers[key]) {
            for (var i = 0; i < this._observers[key].length; i++) {
                var ob = this._observers[key][i];
                //console.info('Calling observer: ', ob);
                if (typeof(ob) == 'string') {
                    this[ob](this, key, val, oldVal);
                } else {
                    ob(this, key, val, oldVal)
                }
            };
        }


        return val;
    },

    addObserver: function(key, callback) {
        console.info('Adding observer:', key, callback);
        if (!this._observers) {
            this._observers = {};
        }
        if (!this._observers[key]) {
            this._observers[key] = [];
        }

        this._observers[key].push(callback);
    }
});

CC.Object.prototype = {
    /** @private
     * Initialise the object
     */
    _init: function() {
        if (this._observingFunctions) {
            var i = 0,
                f;
            for ( ; i<this._observingFunctions.length; i++) {
                f = this._observingFunctions[i];

                console.info('Setting up observer: ', this, f);
                this.addObserver(f.property, f.method);
            }
        }
    },

    init: function() {
    },

    get: CC.Object.get,
    set: CC.Object.set,
    addObserver: CC.Object.addObserver


};
