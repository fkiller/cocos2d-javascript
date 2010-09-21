var Node = require('./Node').Node,
    Director = require('./Director').Director,
    TouchDispatcher = require('./TouchDispatcher').TouchDispatcher;

/** @member cocos
 * @class
 */
var Layer = Node.extend(/** @scope cocos.Layer# */{
    isTouchEnabled: false,
    isAccelerometerEnabled: false,

    init: function() {
        @super;

        var s = Director.get('sharedDirector.winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);
    },

    registerWithTouchDispatcher: function() {
        TouchDispatcher.get('sharedDispatcher').addStandardDelegate({delegate: this, priority: 0});
    },

    onEnter: function() {
        if (this.isTouchEnabled) {
            this.registerWithTouchDispatcher();
        }

        @super;
    },

    onExit: function() {
        if (this.isTouchEnabled) {
            TouchDispatcher.get('sharedDispatcher').removeDelegate({delegate: this});
        }

        @super;
    },

    touchBegan: function(opts) {
        var touch = opts['touch'],
            event = opts['event'];

        throw "Layer.touchBegan override me";

        return true;
    },

    _updateIsTouchEnabled: function() {
        if (this.isRunning) {
            if (this.isTouchEnabled) {
                this.registerWithTouchDispatcher();
            } else {
                TouchDispatcher.get('sharedDispatcher').removeDelegate({delegate: this});
            }
        }
    }.observes('isTouchEnabled')
});

module.exports.Layer = Layer;
