var sys = require('sys'),
    Thing = require('thing').Thing;

var KeyboardDispatcher = Thing.extend({
    firstResponder: null,
    downKeys: null,

    init: function() {
        this.downKeys = [];
    },

    makeFirstResponder: function(responder) {
        if (this.firstResponder && !this.firstResponder.resignFirstResponder()) {
            return false;
        }

        if (responder && !responder.becomeFirstResponder()) {
            return false
        }

        this.set('firstResponder', responder);

        return true;
    },

    keyUp: function(opts) {
        var event = opts['event'];
        var keyCode = event.keyCode;

        var pos = this.downKeys.indexOf(keyCode);
        if (pos > -1) {
            delete this.downKeys[pos];
        }

        if (this.firstResponder && this.firstResponder.keyUp) {
            this.firstResponder.keyUp({keyCode: keyCode, event: event});
        }

    },

    keyDown: function(opts) {
        var event = opts['event'];
        
        var keyCode = event.keyCode;

        // Key is still being held down
        if (this.downKeys.indexOf(keyCode) > -1) {
            return;
        }

        this.downKeys.push(keyCode);

        if (this.firstResponder && this.firstResponder.keyDown) {
            this.firstResponder.keyDown({keyCode: keyCode, event: event});
        }
    },

    keyPress: function(opts) {
        var event = opts['event'];
        var keyCode = event.keyCode;

        if (keyCode >= 97) {
            keyCode -= 32;
        }

        if (this.firstResponder && this.firstResponder.keyPress) {
            this.firstResponder.keyPress({keyCode: keyCode, event: event});
        }
    }
});

/**
 * Class methods
 */
sys.extend(KeyboardDispatcher, {
    sharedDispatcher: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.KeyboardDispatcher = KeyboardDispatcher;
