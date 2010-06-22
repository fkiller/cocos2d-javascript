function merge() {
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

function copy(obj) {
	var copy;

	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = arguments.callee(obj[i]);
		}
	} else if (typeof(obj) == 'object') {
		copy = {};

		var o, x;
		for (x in obj) {
			copy[x] = arguments.callee(obj[x]);
		}
	} else {
		// Primative type. Doesn't need copying
		copy = obj;
	}

    return copy;
};
function each(arr, func) {
    var i = 0,
        len = arr.length;
    for (i = 0; i < len; i++) {
        func(arr[i], i);
    };

    return arr;
};
function map(arr, func) {
    var i = 0,
        len = arr.length,
        result = [];

    for (i = 0; i < len; i++) {
        result.push(func(arr[i], i));
    };

    return result;
};

function extend(target, ext) {
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
            if (val instanceof Function && target[key] && val !== target[key]) {
                val.base = target[key];
				val._isProperty = val.base._isProperty;
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

function beget(o) {
    var F = function(){};
    F.prototype = o
    var ret  = new F();
    F.prototype = null;
    return ret;
};

function callback(target, method) {
    if (typeof(method) == 'string') {
        method = target[method];
    }

    return function() {
        method.apply(target, arguments);
    }
};

extend(Function.prototype, {
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

extend(String.prototype, {
    w: function() {
        return this.split(' ');
    }
});




function ready() {
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
function bindReady() {

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



function ApplicationMain(appDelegate) {
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


// Taken from node/lib/sys.js
function isArray (ar) {
  return ar instanceof Array
      || Array.isArray(ar)
      || (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp (re) {
  var s = ""+re;
  return re instanceof RegExp // easy case
      || typeof(re) === "function" // duck-type for context-switching evalcx case
      && re.constructor.name === "RegExp"
      && re.compile
      && re.test
      && re.exec
      && s.charAt(0) === "/"
      && s.substr(-1) === "/";
}


function isDate (d) {
  if (d instanceof Date) return true;
  if (typeof d !== "object") return false;
  var properties = Date.prototype && Object.getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object.getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}


each('merge copy each map extend beget callback ApplicationMain isArray isRegExp isDate'.w(), callback(this, function(name) {
    exports[name] = eval(name);
}));
