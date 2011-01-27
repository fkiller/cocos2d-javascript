/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var ActionInstant = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInstant */{
    /**
     * Base class for actions that triggers instantly. They have no duration.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.FiniteTimeAction
     */
    init: function (opts) {
        ActionInstant.superclass.init.call(this, opts);

        this.duration = 0;
    },
    get_isDone: function () {
        return true;
    },
    step: function (dt) {
        this.update(1);
    },
    update: function (t) {
        // ignore
    },
    reverse: function () {
        return this.copy();
    }
});

var FlipX = ActionInstant.extend(/** @lends cocos.actions.FlipX# */{
    flipX: false,

    /**
     * Flips a sprite horizontally
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInstant
     *
     * @opt {Boolean} flipX Should the sprite be flipped
     */
    init: function (opts) {
        FlipX.superclass.init.call(this, opts);

        this.flipX = opts.flipX;
    },
    startWithTarget: function (target) {
        FlipX.superclass.startWithTarget.call(this, target);

        target.set('flipX', this.flipX);
    },
    reverse: function () {
        return FlipX.create({flipX: !this.flipX});
    },
    copy: function () {
        return FlipX.create({flipX: this.flipX});
    }
});

var FlipY = ActionInstant.extend(/** @lends cocos.actions.FlipY# */{
    flipY: false,

    /**
     * Flips a sprite vertically
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInstant
     *
     * @opt {Boolean} flipY Should the sprite be flipped
     */
    init: function (opts) {
        FlipY.superclass.init.call(this, opts);

        this.flipY = opts.flipY;
    },
    startWithTarget: function (target) {
        FlipY.superclass.startWithTarget.call(this, target);

        target.set('flipY', this.flipY);
    },
    reverse: function () {
        return FlipY.create({flipY: !this.flipY});
    },
    copy: function () {
        return FlipY.create({flipY: this.flipY});
    }
});

exports.ActionInstant = ActionInstant;
exports.FlipX = FlipX;
exports.FlipY = FlipY;
