exports.mergeObjects = function() {
    var result = {};

    for (var i = 0; i < arguments.length; i++) {
        var obj = arguments[i];

        for (var x in obj) {
            if (!obj.hasOwnProperty(x)) {
                continue;
            }

            result[x] = obj[x];
        }
    };

    return result;
};

exports.copy = function(obj) {
    var copy = {};

    var o, x;
    for (x in obj) {
        o = obj[x];

        if (typeof(o) == 'object') {
            o = arguments.callee(o);
        }

        copy[x] = o;
    }

    return copy;
};
exports.each = function(arr, func) {
    var i = 0,
        len = arr.length;
    for (i = 0; i < len; i++) {
        func(arr[i], i);
    };

    return arr;
};
exports.map = function(arr, func) {
    var i = 0,
        len = arr.length,
        result = [];

    for (i = 0; i < len; i++) {
        result.push(func(arr[i], i));
    };

    return result;
};

exports.extend = function(target, ext) {
    if (arguments.length < 2) {
        console.log(arguments);
        throw "You must provide at least a target and 1 object to extend from"
    }

    var i, obj, key, val;

    for (i = 1; i < arguments.length; i++) {
        obj = arguments[i];
        for (key in obj) {
            // Don't copy built-ins
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            val = obj[key];
            // Don't copy undefineds or references to target (would cause infinite loop)
            if (val === undefined || val === target) {
                continue;
            }

            // Replace existing function and store reference to it in .base
            if (val instanceof Function && val !== target[key]) {
                val.base = target[key];
            }
            target[key] = val;

            if (val instanceof Function) {
                // If this function observes make a reference to it so we can set
                // them up when this get instantiated
                if (val._observing) {
                    // Force a COPY of the array or we will probably end up with various
                    // classes sharing the same one.
                    if (!target._observingFunctions) {
                        target._observingFunctions = [];
                    } else {
                        target._observingFunctions = target._observingFunctions.slice(0);
                    }


                    var i;
                    for (i = 0; i<val._observing.length; i++) {
                        target._observingFunctions.push({property:val._observing[i], method: key});
                    }
                } // if (val._observing)

                // If this is a computer property then add it to the list so get/set know where to look
                if (val._isProperty) {
                    if (!target._computedProperties) {
                        target._computedProperties = [];
                    } else {
                        target._computedProperties = target._computedProperties.slice(0);
                    }

                    target._computedProperties.push(key)
                }
            }
    
        }
    }


    return target;
};

exports.beget = function(o) {
    var F = function(){};
    F.prototype = o
    var ret  = new F();
    F.prototype = null;
    return ret;
};

exports.callback = function(target, method) {
    if (typeof(method) == 'string') {
        method = target[method];
    }

    return function() {
        method.apply(target, arguments);
    }
};

exports.extend(Function.prototype, {
    _observing: null,

    observes: function() {
        /*
        var target, key;
        if (typeof(arguments[0]) == 'object') {
            target = arguments[0],
            key = arguments[1];
        } else {
            target = null,
            key = arguments[0];
        }
        */

        if (!this._observing) {
            this._observing = [];
        }
        
        var i;
        for (i = 0; i<arguments.length; i++) {
            this._observing.push(arguments[i]);
        }

        return this;
    },
    property: function() {
        this._isProperty = true;

        return this;
    }
});

var ready = function() {
    if (this._isReady) {
        return
    }

    if (!document.body) {
        setTimeout(function() { ready(); }, 13);
    }

    window.__isReady = true;

    if (window.__readyList) {
        var fn, i = 0;
        while ( (fn = window.__readyList[ i++ ]) ) {
            fn.call(document);
        }

        window.__readyList = null;
        delete window.__readyList;
    }
};


/**
 * Adapted from jQuery
 */
var bindReady = function() {

    if (window.__readyBound) {
        return;
    }

    window.__readyBound = true;

    // Catch cases where $(document).ready() is called after the
    // browser event has already occurred.
    if ( document.readyState === "complete" ) {
        return ready();
    }

    // Mozilla, Opera and webkit nightlies currently support this event
    if ( document.addEventListener ) {
        // Use the handy event callback
        //document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
        
        // A fallback to window.onload, that will always work
        window.addEventListener( "load", ready, false );

    // If IE event model is used
    } else if ( document.attachEvent ) {
        // ensure firing before onload,
        // maybe late but safe also for iframes
        //document.attachEvent("onreadystatechange", DOMContentLoaded);
        
        // A fallback to window.onload, that will always work
        window.attachEvent( "onload", ready );

        // If IE and not a frame
        /*
        // continually check to see if the document is ready
        var toplevel = false;

        try {
            toplevel = window.frameElement == null;
        } catch(e) {}

        if ( document.documentElement.doScroll && toplevel ) {
            doScrollCheck();
        }
        */
    }
};



exports.ApplicationMain = function(appDelegate) {
    var delegate = appDelegate.create();
    if (window.__isReady) {
        delegate.applicationDidFinishLaunching()
    } else {
        if (!window.__readyList) {
            window.__readyList = [];
        }
        window.__readyList.push(function() { delegate.applicationDidFinishLaunching(); });
    }

    bindReady();
};
