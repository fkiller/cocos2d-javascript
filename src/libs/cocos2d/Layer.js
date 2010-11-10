var Node = require('./Node').Node,
    Director = require('./Director').Director,
    EventDispatcher = require('./EventDispatcher').EventDispatcher;

/** @member cocos
 * @class
 */
var Layer = Node.extend(/** @scope cocos.Layer# */{
    isMouseEnabled: false,
    mouseDelegatePriority: 0,

    init: function() {
        @super;

        var s = Director.get('sharedDirector.winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);
    },

    onEnter: function() {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority:this.get('mouseDelegatePriority')});
        }

        @super;
    },

    onExit: function() {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
        }

        @super;
    },

    _updateIsMouseEnabled: function() {
        if (this.isRunning) {
            if (this.isMouseEnabled) {
                EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority:this.get('mouseDelegatePriority')});
            } else {
                EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
            }
        }
    }.observes('isMouseEnabled')
});

module.exports.Layer = Layer;
