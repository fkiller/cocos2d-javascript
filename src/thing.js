var sys = require('sys');

/** @class */
var Thing = function() { this._init.apply(this, arguments); };

Thing = sys.extend(Thing, /** @scope Thing */ {
    isThing: true,
    _observers: null,
    superclass: null,
	_lastID: 0,

    /**
     * Creates a new instance of this object
     *
     * @returns {Thing} An instance of this object
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
        newObj.prototype = sys.beget(this.prototype)
        args.push(newObj.prototype);
        for (i = 0; i<arguments.length; i++) {
            args.push(arguments[i])
        }
        sys.extend.apply(null, args);

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
                if (typeof(ob) == 'string') {
                    this[ob](this, key, val, oldVal);
                } else {
                    ob(this, key, val, oldVal)
                }
            };
        }


        return val;
    },

	// Increment integer value
	inc: function(key) {
		return this.set(key, this.get(key) +1);
	},

	// Decrement integer value
	dec: function(key) {
		return this.set(key, this.get(key) -1);
	},

    addObserver: function(keys, callback) {
        keys = sys.isArray(keys) ? keys : [keys];

        if (!this._observers) {
            this._observers = {};
        }

        for (var i=0, len = keys.length; i < len; i++) {
            var key = keys[i];
            if (!this._observers[key]) {
                this._observers[key] = [];
            }

            this._observers[key].push(callback);
        }
    }
});

Thing.prototype = {
	id: 0,
    /** @private
     * Initialise the object
     */
    _init: function() {
		this.id = ++Thing._lastID;

        if (this._observingFunctions) {
            var i = 0,
                f;
            for ( ; i<this._observingFunctions.length; i++) {
                f = this._observingFunctions[i];

                this.addObserver(f.property, f.method);
            }
        }
    },

    init: function() {
    },

    /** @function */
    get: Thing.get,
    /** @function */
    set: Thing.set,
    /** @function */
    inc: Thing.inc,
    /** @function */
    dec: Thing.dec,
    /** @function */
    addObserver: Thing.addObserver


};

exports.Thing = Thing;
