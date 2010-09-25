var sys = require('sys'),
    Obj = require('object').Obj,
    StandardTouchHandler = require('./TouchHandler').StandardTouchHandler,
    TargetedTouchHandler = require('./TouchHandler').TargetedTouchHandler;
    
var kTouchBegan = 0,
	kTouchMoved = 1,
	kTouchEnded = 2,
	kTouchCancelled = 3,
	kTouchMax = 4;

var kTouchMethodBeganBit     = 1 << 0,
    kTouchMethodMovedBit     = 1 << 1,
    kTouchMethodEndedBit     = 1 << 2,
    kTouchMethodCancelledBit = 1 << 3,
    kTouchMethodAllBits      = ( kTouchMethodBeganBit | kTouchMethodMovedBit | kTouchMethodEndedBit | kTouchMethodCancelledBit);

    
/** @member cocos
 * @class
 */
var TouchDispatcher = Obj.extend(/** @scope cocos.TouchDispatcher# */{
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

    addTargetedDelegate: function(opts) {
        var delegate = opts['delegate'],
            priority = opts['priority'],
            swallowsTouches = opts['swallowsTouches'];

        var handler = TargetedTouchHandler.create({delegate:delegate, priority:priority, swallowsTouches:swallowsTouches});
        if(!this.locked) {
            this.forceAddHandler({handler:handler, array:this.targetedHandlers});
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

        // Targeted touch handlers
        if (this.targetedHandlers.length > 0 && touches.length > 0) {
            sys.each(touches, sys.callback(this, function(touch) {
                sys.each(this.targetedHandlers, function(handler) {
                    var claimed = false,
                        args = {touch: touch, event:event},
                        claimedTouches = handler.get('claimedTouches'),
                        delegate = handler.get('delegate');
                        

                    if (touchType == kTouchMethodBeganBit) {
                        claimed = delegate.touchBegan(args);
                        if (claimed) {
                            claimedTouches.push(touch);
                        }
                    }

                    // else (moved, ended, cancelled)
                    else if (claimedTouches.indexOf(touch) > -1) {
                        claimed = true;

                        if (handler.get('enabledMethods') & touchType) {
                            switch(touchType) {
                            case kTouchMethodBeganBit:
                                delegate.touchBegan(args);
                                break;
                            case kTouchMethodMovedBit:
                                delegate.touchMoved(args);
                                break;
                            case kTouchMethodEndedBit:
                                delegate.touchEnded(args);
                                break;
                            case kTouchMethodCancelledBit:
                                delegate.touchCancelled(args);
                                break;
                            }
                        }

                        if (touchType & (kTouchMethodCancelledBit | kTouchMethodEndedBit)) {
                            var idx = claimedTouches.indexOf(touch);
                            if (idx > -1) {
                                claimedTouches.splice(idx, 1);
                            }
                        }
                    }

                    if (claimed && handler.get('swallowsTouches')) {
                        var idx = touches.indexOf(touch);
                        if (idx > -1) {
                            delete touches[idx];
                        }
                    }
                });
            }));
        }



        // Standard touch handlers
        if (this.standardHandlers.length > 0 && touches.length > 0) {
            sys.each(this.standardHandlers, function(handler) {

                if (handler.get('enabledMethods') & touchType) {
                    var delegate = handler.get('delegate');
                    var args = {touches: touches, event:event};
                    switch(touchType) {
                    case kTouchMethodBeganBit:
                        delegate.touchesBegan(args);
                        break;
                    case kTouchMethodMovedBit:
                        delegate.touchesMoved(args);
                        break;
                    case kTouchMethodEndedBit:
                        delegate.touchesEnded(args);
                        break;
                    case kTouchMethodCancelledBit:
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
            this.touches({touches: touches, event: event, touchType: kTouchMethodBeganBit});
        }
    },

    touchesMoved: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchMethodMovedBit});
        }
    },

    touchesEnded: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchMethodEndedBit});
        }
    },

    touchesCancelled: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchMethodCancelledBit});
        }
    }



});

/**
 * Class methods
 */
sys.extend(TouchDispatcher, /** @scope cocos.TouchDispatcher */{
    /** @field */
    sharedDispatcher: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});


exports.TouchDispatcher = TouchDispatcher;
