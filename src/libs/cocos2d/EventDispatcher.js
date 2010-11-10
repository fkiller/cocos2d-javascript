var sys = require('sys'),
    Thing = require('thing').Thing;

/** @member cocos
 * @class
 *  
 *  This is object is responsible for dispatching the events:
 * 	    - Mouse events
 * 	    - Keyboard events
 */
var EventDispatcher = Thing.extend(/** @scope cocos.EventDispatcher# */ {
    dispatchEvents: true,
    keyboardDelegates: null,
    mouseDelegates: null,
    
    init: function() {
        @super;

        this.keyboardDelegates = [];
        this.mouseDelegates = [];
    },

    addDelegate: function(opts) {
        var delegate = opts['delegate'],
            priority = opts['priority'],
            flags    = opts['flags'],
            list     = opts['list'];

        var listElement = {
            delegate: delegate,
            priority: priority,
            flags: flags
        };

        var added = false;
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            if (priority < elem.priority) {
                // Priority is lower, so insert before elem
                list.splice(i, 0, listElement);
                added = true;
                break;
            }
        }

        // High priority; append to array
        if (!added) {
            list.push(listElement);
        }
    },

    removeDelegate: function(opts) {
        var delegate = opts['delegate'],
            list = opts['list'];

        var idx = list.indexOf(delegate);
        if (idx == -1) {
            return;
        }
        list.splice(idx, 1);
    },
    removeAllDelegates: function(opts) {
        var list = opts['list'];

        list.splice(0, list.length -1);
    },

    addMouseDelegate: function(opts) {
        var delegate = opts['delegate'],
            priority = opts['priority'];

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list:this.mouseDelegates});
    },

    removeMouseDelegate: function(opts) {
        var delegate = opts['delegate'];

        this.removeDelegate({delegate: delegate, list:this.mouseDelegates});
    },

    removeAllMouseDelegate: function() {
        this.removeAllDelegates({list:this.mouseDelegates});
    },


    // Mouse Events

    mouseDown: function(evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDown) {
                var swallows = entry.delegate.mouseDown(evt);
                if (swallows) {
                    break;
                }
            }
        };
    },
    mouseMoved: function(evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseMoved) {
                var swallows = entry.delegate.mouseMoved(evt);
                if (swallows) {
                    break;
                }
            }
        };
    },
    mouseDragged: function(evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDragged) {
                var swallows = entry.delegate.mouseDragged(evt);
                if (swallows) {
                    break;
                }
            }
        };
    },
    mouseUp: function(evt) {
        if (!this.dispatchEvents) {
            return;
        }

            console.log("MD: ", this.mouseDelegates);
        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            console.log("ENTRY: ", entry);
            if (entry.delegate.mouseUp) {
                var swallows = entry.delegate.mouseUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    }

});

/**
 * Class methods
 */
sys.extend(EventDispatcher, /** @scope cocos.EventDispatcher */{
    /** @field */
    sharedDispatcher: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});
exports.EventDispatcher = EventDispatcher;
