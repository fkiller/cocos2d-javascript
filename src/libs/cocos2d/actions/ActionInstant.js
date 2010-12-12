var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

/**
 * @class cocos.actions.ActionInstant Base class for actions that triggers instantly. They have no duration.
 * @extends cocos.actions.FiniteTimeAction
 *
 * @constructor
 */
var ActionInstant = act.FiniteTimeAction.extend({
    init: function(opts) {
        @super;
        this.duration = 0;
    },
    get_isDone: function() {
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

/**
 * @class cocos.actions.FlipX Flips a sprite horizontally
 * @extends cocos.actions.ActionInstant
 *
 * @constructor
 * @namedparams
 * @param {Boolean} flipX Should the sprite be flipped
 */
var FlipX = ActionInstant.extend({
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

/**
 * @class cocos.actions.FlipY Flips a sprite horizontally
 * @extends cocos.actions.ActionInstant
 *
 * @constructor
 * @namedparams
 * @param {Boolean} flipY Should the sprite be flipped
 */
var FlipY = ActionInstant.extend({
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
