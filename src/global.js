var util = require('util'),
    event = require('event');


function getAccessors(obj) {
    if (!obj.js_accessors_) {
        obj.js_accessors_ = {};
    }
    return obj.js_accessors_;
}
function getBindings(obj) {
    if (!obj.js_bindings_) {
        obj.js_bindings_ = {};
    }
    return obj.js_bindings_;
}
function addAccessor(obj, key, target, targetKey, noNotify) {
    getAccessors(obj)[key] = {
        key: targetKey,
        target: target
    };

    if (!noNotify) {
        obj.triggerChanged(key);
    }
}

var objectID = 0;

/**
 * @class BObject A bindable object. Allows observing and binding to its properties.
 *
 * @constructor
 */
exports.BObject = function () {};
exports.BObject.prototype = util.extend(exports.BObject.prototype, {
    init: function () {},
    get: function (key) {
        var accessor = getAccessors(this)[key];
        if (accessor) {
            return accessor.target.get(accessor.key);
        } else {
            // Call getting function
            if (this['get_' + key]) {
                return this['get_' + key]();
            }

            return this[key];
        }
    },
    set: function (key, value) {
        var accessor = getAccessors(this)[key],
            oldVal = this.get(key);
        if (accessor) {
            accessor.target.set(accessor.key, value);
        } else {
            if (this['set_' + key]) {
                this['set_' + key](value);
            } else {
                this[key] = value;
            }
        }
        this.triggerChanged(key, oldVal);
    },
    setValues: function (kvp) {
        for (var x in kvp) {
            if (kvp.hasOwnProperty(x)) {
                this.set(x, kvp[x]);
            }
        }
    },
    changed: function (key) {
    },
    notify: function (key, oldVal) {
        var accessor = getAccessors(this)[key];
        if (accessor) {
            accessor.target.notify(accessor.key, oldVal);
        }
    },
    triggerChanged: function(key, oldVal) {
        event.trigger(this, key.toLowerCase() + '_changed', oldVal);
    },
    bindTo: function (key, target, targetKey, noNotify) {
        targetKey = targetKey || key;
        var self = this;
        this.unbind(key);

        var oldVal = this.get(key);

        // When bound property changes, trigger a 'changed' event on this one too
        getBindings(this)[key] = event.addListener(target, targetKey.toLowerCase() + '_changed', function () {
            self.triggerChanged(key, oldVal);
        });

        addAccessor(this, key, target, targetKey, noNotify);
    },
    unbind: function (key) {
        var binding = getBindings(this)[key];
        if (!binding) {
            return;
        }

        delete getBindings(this)[key];
        event.removeListener(binding);
        // Grab current value from bound property
        var val = this.get(key);
        delete getAccessors(this)[key];
        // Set bound value
        this[key] = val;
    },
    unbindAll: function () {
        var keys = [],
            bindings = getBindings(this);
        for (var k in bindings) {
            if (bindings.hasOwnProperty(k)) {
                this.unbind(k);
            }
        }
    },

    get_id: function() {
        if (!this._id) {
            this._id = ++objectID;
        }

        return this._id;
    }
});


/**
 * @static
 * Creates a new instance of this object
 * @returns {BObject} An instance of this object
 */
exports.BObject.create = function() {
    var ret = new this();
    ret.init.apply(ret, arguments);
    return ret;
};

/**
 * Create an new class by extending this one
 * @returns {Class} A new class
 * @static
 */
exports.BObject.extend = function() {
    var newObj = function() {},
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
    newObj.prototype = util.beget(this.prototype)
    args.push(newObj.prototype);
    for (i = 0; i<arguments.length; i++) {
        args.push(arguments[i])
    }
    util.extend.apply(null, args);

    newObj.superclass = this;
    // Create new instance
    return newObj;
};

exports.BObject.get = exports.BObject.prototype.get;
exports.BObject.set = exports.BObject.prototype.set;

/**
 * @class BArray A bindable array. Allows observing for changes made to its contents
 * @extends BObject
 *
 * @constructor
 * @param {Array} arr A normal JS array to use for data
 */
exports.BArray = function (arr) {
    this.array = arr || [];
    this.set('length', this.array.length);
};

exports.BArray.prototype = new exports.BObject();
exports.BArray.prototype = util.extend(exports.BArray.prototype, {
    /**
     * Get an item
     * @param {Integer} i Index to get item from
     */
    getAt: function (i) {
        return this.array[i];
    },

    /**
     * Set an item -- Overwrites any existing item at index
     * @param {Integer} i Index to set item to
     * @param {*} value Value to assign to index
     */
    setAt: function (i, value) {
        var oldVal = this.array[i];
        this.array[i] = value;

        event.trigger(this, 'set_at', i, oldVal);
    },

    /**
     * Insert a new item into the array without overwriting anything
     * @param {Integer} i Index to insert item at
     * @param {*} value Value to insert
     */
    insertAt: function (i, value) {
        this.array.splice(i, 0, value);
        this.set('length', this.array.length);
        event.trigger(this, 'insert_at', i);
    },
    removeAt: function (i) {
        var oldVal = this.array[i];
        this.array.splice(i, 1);
        this.set('length', this.array.length);
        event.trigger(this, 'remove_at', i, oldVal);

        return oldVal;
    },
    getArray: function () {
        return this.array;
    },
    push: function (a) {
        this.insertAt(this.array.length, a);
        return this.array.length;
    },
    pop: function () {
        return this.removeAt(this.array.length - 1);
    }
});
