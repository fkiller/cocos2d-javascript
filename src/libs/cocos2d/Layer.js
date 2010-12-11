var Node = require('./Node').Node,
    util = require('util'),
    event = require('event'),
    Director = require('./Director').Director,
    ccp    = require('geometry').ccp,
    EventDispatcher = require('./EventDispatcher').EventDispatcher;

/** 
 * @class cocos.Layer A fullscreen Node. You need at least 1 layer in your app to add things to.
 * @extends cocos.Node
 *
 * @constructor
 */
var Layer = Node.extend({
    isMouseEnabled: false,
    isKeyboardEnabled: false,
    mouseDelegatePriority: 0,
    keyboardDelegatePriority: 0,

    init: function() {
        @super;

        var s = Director.get('sharedDirector').get('winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);

        event.addListener(this, 'ismouseenabled_changed', util.callback(this, function() {
            if (this.isRunning) {
                if (this.isMouseEnabled) {
                    EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority:this.get('mouseDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
                }
            }
        }));


        event.addListener(this, 'iskeyboardenabled_changed', util.callback(this, function() {
            if (this.isRunning) {
                if (this.isKeyboardEnabled) {
                    EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority:this.get('keyboardDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
                }
            }
        }));
    },

    onEnter: function() {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority:this.get('mouseDelegatePriority')});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority:this.get('keyboardDelegatePriority')});
        }

        @super;
    },

    onExit: function() {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
        }

        @super;
    }
});

module.exports.Layer = Layer;
