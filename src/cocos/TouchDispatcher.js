var sys = require('sys'),
    Obj = require('object').Object,
    StandardTouchHandler = require('./TouchHandler').StandardTouchHandler;
    
var kTouchBegan = 0,
	kTouchMoved = 1,
	kTouchEnded = 2,
	kTouchCancelled = 3,
	kTouchMax = 4;

var kTouchSelectorBeganBit     = 1 << 0,
    kTouchSelectorMovedBit     = 1 << 1,
    kTouchSelectorEndedBit     = 1 << 2,
    kTouchSelectorCancelledBit = 1 << 3,
    kTouchSelectorAllBits      = ( kTouchSelectorBeganBit | kTouchSelectorMovedBit | kTouchSelectorEndedBit | kTouchSelectorCancelledBit);

    
var TouchDispatcher = Obj.extend({
    targetedHandlers: null,
    standardHandlers: null,
    locked: false,
    toAdd: false,
    toRemove: false,
    handlersToAdd: null,
    handlersToRemove: null,
    toQuit: null,
    dispatchEvents: true,


    init: function() {
        @super;

		this.targetedHandlers = [];
		this.standardHandlers = [];
		this.handlersToAdd =    [];
		this.handlersToRemove = [];
        
    },

    addStandardDelegate: function(opts) {
        var delegate = opts['delegate'],
            priority = opts['priority'];

        var handler = StandardTouchHandler.create({delegate:delegate, priority:priority});
        if(!this.locked) {
            this.forceAddHandler({handler:handler, array:this.standardHandlers});
        } else {
            this.handlersToAdd.push(handler);
            this.toAdd = true;
        }
            
    },
    forceAddHandler: function(opts) {
        var handler = opts['handler'],
            array = opts['array'];

        var i = 0;
        sys.each(array, function(h) {
            if (h.get('priority') < handler.get('priority')) {
                i++;
            }

            if (h.get('delegate') == handler.get('delegate')) {
                throw "Delegate already added to touch dispatcher.";
            }
        });

        array.splice(i, 0, handler);
    },

    touches: function(opts) {
        var touches = opts['touches'],
            event   = opts['event'],
            touchType = opts['touchType'];

        if (this.standardHandlers.length > 0 && touches.length > 0) {
            sys.each(this.standardHandlers, function(handler) {

                if (handler.get('enabledSelectors') & touchType) {
                    var delegate = handler.get('delegate');
                    var args = {touches: touches, event:event};
                    switch(touchType) {
                    case kTouchSelectorBeganBit:
                        delegate.touchesBegan(args);
                        break;
                    case kTouchSelectorMovedBit:
                        delegate.touchesMoved(args);
                        break;
                    case kTouchSelectorEndedBit:
                        delegate.touchesEnded(args);
                        break;
                    case kTouchSelectorCancelledBit:
                        delegate.touchesCancelled(args);
                        break;
                    }
                }
            });
        }


        this.locked = false;

        if (this.toRemove) {
            this.toRemove = false;
            // TODO
        }

        if (this.toAdd) {
            this.toAdd = false;

            sys.each(this.handlersToAdd, sys.callback(this, function(handler) {
                // TODO Targeted handlers
                this.forceAddHandler({handler: handler, array:this.standardHandlers});
            }));
        }

        if (this.toQuit) {
            this.toQuit = false;
            // TODO
            //this.forceRemoveAllDelegates();
        }
    },

    touchesBegan: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchSelectorBeganBit});
        }
    },

    touchesMoved: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchSelectorMovedBit});
        }
    },

    touchesEnded: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchSelectorEndedBit});
        }
    },

    touchesCancelled: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchSelectorCancelledBit});
        }
    }



});

/**
 * Class methods
 */
sys.extend(TouchDispatcher, {
    sharedDispatcher: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});


exports.TouchDispatcher = TouchDispatcher;
