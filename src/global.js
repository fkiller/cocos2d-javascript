var util = require('util'),
    event = require('event');

function Accessors(obj) {
    if (!obj.js_accessors_) obj.js_accessors_ = {};
    return obj.js_accessors_;
}
function Bindings(obj) {
    if (!obj.js_bindings_) obj.js_bindings_ = {};
    return obj.js_bindings_;
}
function addAccessor(obj, key, target, targetKey, noNotify) {
    Accessors(obj)[key] = {
        key: key,
        target: target
    };

    if (!noNotify) {
        event.trigger(obj, key.toLowerCase() + '_changed');
    }
}

/**
 * All exports from this file are automatically available everywhere
 */

/** @class
 *
 * A bindable object. Allows observing and binding to its properties.
 */
exports.BObject = function() {}
exports.BObject.prototype = util.extend(exports.BObject.prototype, {
    get: function(key) {
        var accessor = Accessors(this)[key];
        if (accessor) {
            return accessor.target.get(accessor.key);
        } else {
            return this[key];
        }
    },
    set: function(key, value) {
        var accessor = Accessors(this)[key];
        if (accessor) {
            accessor.target.set(accessor.key, value);
        } else {
            this[key] = value;
        }
        this.notify(key);
    },
    setValues: function(kvp) {
        for (var x in kvp) {
            this.set(x, kvp[x]);
        }
    },
    changed: function(key) {
    },
    notify: function(key) {
        var accessor = Accessors(this)[key];
        if (accessor) {
            accessor.target.notify(accessor.key);
        } else {
            event.trigger(this, key.toLowerCase() + '_changed');
        }
    },
    bindTo: function(key, target, targetKey, noNotify) {
        targetKey = targetKey || key;
        var self = this;
        this.unbind(key);

        // When bound property changes, trigger a 'changed' event on this one too
        Bindings(this)[key] = event.addListener(target, targetKey.toLowerCase() + '_changed', function() {
            self.notify(key);
        });

        addAccessor(this, key, target, targetKey, noNotify);
    },
    unbind: function(key) {
        var binding = Bindings(this)[key];
        if (!binding) {
            return;
        }

        delete Bindings(this)[key];
        event.removeListener(binding);
        // Grab current value from bound property
        var val = this.get(key);
        delete Accessors(this)[key];
        // Set bound value
        this[key] = val;
    },
    unbindAll: function() {
        var keys = [],
            bindings = Bindings(this);
        for (var k in bindings) {
            this.unbind(k);
        }
    }
});

/** @class
 *
 * A bindable array. Allows observing for changes made to its contents
 */
exports.BArray = function(arr) {
    this.array = arr || [];
    this.set('length', this.array.length);
};

exports.BArray.prototype = util.extend(exports.BObject.prototype, {
    getAt: function(i) {
        return this.array[i];
    },
    setAt: function(i, value) {
        var oldVal = this.array[i];
        this.array[i] = value;

        event.trigger(this, 'set_at', i, oldVal);
    },
    insertAt: function(i, value) {
        this.array.splice(i, 0, value);
        this.set('length', this.array.length);
        event.trigger(this, 'insert_at', i);
    },
    removeAt: function(i) {
        var oldVal = this.array[i];
        this.array.splice(i, 1);
        this.set('length', this.array.length);
        event.trigger(this, 'remove_at', i, oldVal);

        return oldVal;
    },
    getArray: function() {
        return this.array;
    },
    push: function(a) {
        this.insertAt(this.array.length, a);
        return this.array.length;
    },
    pop: function() {
        return this.removeAt(this.array.length -1);
    }
});
