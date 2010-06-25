var sys = require('sys'),
    Obj = require('object').Object;

var kTouchSelectorBeganBit     = 1 << 0,
    kTouchSelectorMovedBit     = 1 << 1,
    kTouchSelectorEndedBit     = 1 << 2,
    kTouchSelectorCancelledBit = 1 << 3,
    kTouchSelectorAllBits      = ( kTouchSelectorBeganBit | kTouchSelectorMovedBit | kTouchSelectorEndedBit | kTouchSelectorCancelledBit);

var TouchHandler = Obj.extend({
    delegate: null,
    priority: 0,
    enabledSelectors: 0,

    init: function(opts) {
        @super;

        var delegate = opts['delegate'],
            priority = opts['priority'];

        this.set('delegate', delegate);
        this.priority = priority;

    }

});

var StandardTouchHandler = TouchHandler.extend({
    init: function(opts) {
        @super;

        if (this.delegate.touchesBegan) {
            this.enabledSelectors |= kTouchSelectorBeganBit;
        }
        if (this.delegate.touchesMoved) {
            this.enabledSelectors |= kTouchSelectorMovedBit;
        }
        if (this.delegate.touchesEnded) {
            this.enabledSelectors |= kTouchSelectorEndedBit;
        }
        if (this.delegate.touchesCancelled) {
            this.enabledSelectors |= kTouchSelectorCancelledBit;
        }
    }
});

exports.TouchHandler = TouchHandler;
exports.StandardTouchHandler = StandardTouchHandler;
