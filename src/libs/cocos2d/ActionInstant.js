var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

/** @member cocos
 * @class
 *
 * Instant actions are immediate actions. They don't have a duration like the cocos.ActionInterval actions.
 *
 * @extends cocos.FiniteTimeAction
 */
var ActionInstant = act.FiniteTimeAction.extend(/** @scope cocos.ActionInstant# */{
    init: function(opts) {
        @super;
        this.duration = 0;
    },
    isDone: function() {
        return true;
    },
    step: function(dt) {
        this.update(1);
    },
    update: function(t) {
        // ignore
    },
    reverse: function() {
        return this.copy();
    }
});

/** @member cocos
 * @class
 *
 * Flips the sprite horizontally
 *
 * @extends cocos.ActionInstant
 */
var FlipX = ActionInstant.extend(/** @scope cocos.FlipX# */{
    flipX: false,

    init: function(opts) {
        @super;

        this.flipX = opts['flipX'];
    },
    startWithTarget: function(target) {
        @super;
        target.set('flipX', this.flipX);
    },
    reverse: function() {
        return FlipX.create({flipX: !this.flipX});
    },
    copy: function() {
        return FlipX.create({flipX: this.flipX});
    }
});

/** @member cocos
 * @class
 *
 * Flips the sprite vertically
 *
 * @extends cocos.ActionInstant
 */
var FlipY = ActionInstant.extend(/** @scope cocos.FlipY# */{
    flipY: false,

    init: function(opts) {
        @super;

        this.flipY = opts['flipY'];
    },
    startWithTarget: function(target) {
        @super;
        target.set('flipY', this.flipY);
    },
    reverse: function() {
        return FlipY.create({flipY: !this.flipY});
    },
    copy: function() {
        return FlipY.create({flipY: this.flipY});
    }
});

exports.ActionInstant = ActionInstant;
exports.FlipX = FlipX;
exports.FlipY = FlipY;
