var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

/**
 * @class cocos.actions.ActionInterval
 *
 * Base class actions that do have a finite time duration. 
 *
 * Possible actions:
 *
 * - An action with a duration of 0 seconds
 * - An action with a duration of 35.5 seconds Infinite time actions are valid
 *
 * @extends cocos.actions.FiniteTimeAction
 *
 * @constructor
 * @param {Float} duration Number of seconds to run action for
 */
var ActionInterval = act.FiniteTimeAction.extend({
    /**
     * Number of seconds that have elapsed
     * @type Float
     */
    elapsed: 0.0,

    _firstTick: true,

    init: function(opts) {
        @super;

        var dur = opts['duration'] || 0;
        if (dur == 0) {
            dur = 0.0000001;
        }

        this.set('duration', dur);
        this.set('elapsed', 0);
        this._firstTick = true;
    },

    get_isDone: function() {
        return (this.elapsed >= this.duration);
    },

    step: function(dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.update(Math.min(1, this.elapsed/this.duration));
    },

    startWithTarget: function(target) {
        @super;

        this.elapsed = 0.0;
        this._firstTick = true;
    },

    reverse: function() {
        throw "Reverse Action not implemented"
    }
});

/**
 * @class cocos.actions.ScaleTo
 *
 * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
 *
 * @extends cocos.actions.ActionInterval
 *
 * @constructor
 * @param {Float} duration Number of seconds to run action for
 * @param {Float} scale (Optional) Size to scale Node to
 * @param {Float} scaleX (Optional) Size to scale width of Node to
 * @param {Float} scaleY (Optional) Size to scale height of Node to
 */
var ScaleTo = ActionInterval.extend({
    /**
     * Current X Scale
     * @type Float
     */
    scaleX: 1,

    /**
     * Current Y Scale
     * @type Float
     */
    scaleY: 1,

    /**
     * Initial X Scale
     * @type Float
     */
    startScaleX: 1,

    /**
     * Initial Y Scale
     * @type Float
     */
    startScaleY: 1,

    /**
     * Final X Scale
     * @type Float
     */
    endScaleX: 1,

    /**
     * Final Y Scale
     * @type Float
     */
    endScaleY: 1,

    /**
     * Delta X Scale
     * @type Float
     * @private
     */
    deltaX: 0.0,

    /**
     * Delta Y Scale
     * @type Float
     * @private
     */
    deltaY: 0.0,

    /** @ignore */
    init: function(opts) {
        @super;

        if (opts['scale'] != undefined) {
            this.endScaleX = this.endScaleY = opts['scale'];
        } else {
            this.endScaleX = opts['scaleX'];
            this.endScaleY = opts['scaleY'];
        }


    },

    /** @ignore */
    startWithTarget: function(target) {
        @super;

        this.startScaleX = this.target.get('scaleX');
        this.startScaleY = this.target.get('scaleY');
        this.deltaX = this.endScaleX - this.startScaleX;
        this.deltaY = this.endScaleY - this.startScaleY;
    },

    /** @ignore */
    update: function(t) {
        if (!this.target) {
            return;
        }
        
        this.target.set('scaleX', this.startScaleX + this.deltaX * t);
        this.target.set('scaleY', this.startScaleY + this.deltaY * t);
    }
});

/**
 * @class cocos.actions.ScaleBy
 *
 * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
 *
 * @extends cocos.actions.ScaleTo
 *
 * @constructor
 * @param {Float} duration Number of seconds to run action for
 * @param {Float} scale (Optional) Size to scale Node by
 * @param {Float} scaleX (Optional) Size to scale width of Node by
 * @param {Float} scaleY (Optional) Size to scale height of Node by
 */
var ScaleBy = ScaleTo.extend({
    startWithTarget: function(target) {
        @super;

        this.deltaX = this.startScaleX * this.endScaleX - this.startScaleX;
        this.deltaY = this.startScaleY * this.endScaleY - this.startScaleY;
    },

    reverse: function() {
        return ScaleBy.create({duration: this.duration, scaleX:1/this.endScaleX, scaleY:1/this.endScaleY});
    }
});


/**
 * @class cocos.actions.RotateTo
 *
 * Rotates a cocos.Node object to a certain angle by modifying its rotation
 * attribute. The direction will be decided by the shortest angle.
 *
 * @extends cocos.actions.ActionInterval
 *
 * @constructor
 * @param {Float} duration Number of seconds to run action for
 * @param {Float} angle Angle in degrees to rotate to
 */
var RotateTo = ActionInterval.extend({
    /**
     * Final angle
     * @type Float
     */
    dstAngle: 0,

    /**
     * Initial angle
     * @type Float
     */
    startAngle: 0,

    /**
     * Angle delta
     * @type Float
     */
    diffAngle: 0,

    init: function(opts) {
        @super;

        this.dstAngle = opts['angle'];
    },

    startWithTarget: function(target) {
        @super;

        this.startAngle = target.get('rotation');

        if (this.startAngle > 0) {
            this.startAngle = (this.startAngle % 360);
        } else {
            this.startAngle = (this.startAngle % -360);
        }

        this.diffAngle = this.dstAngle - this.startAngle;
        if (this.diffAngle > 180) {
            this.diffAngle -= 360;
        } else if (this.diffAngle < -180) {
            this.diffAngle += 360;
        }
    },

    /** @ignore */
    update: function(t) {
        this.target.set('rotation', this.startAngle + this.diffAngle * t);
    }
});

/**
 * @class cocos.actions.RotateBy
 *
 * Rotates a cocos.Node object to a certain angle by modifying its rotation
 * attribute. The direction will be decided by the shortest angle.
 *
 * @extends cocos.actions.RotateTo
 *
 * @constructor
 * @param {Float} duration Number of seconds to run action for
 * @param {Float} angle Angle in degrees to rotate by
 */
var RotateBy = RotateTo.extend({
    /**
     * Number of degrees to rotate by
     * @type Float
     */
    angle: 0,

    init: function(opts) {
        @super;

        this.angle = opts['angle'];
    },

    startWithTarget: function(target) {
        @super;

        this.startAngle = this.target.get('rotation');
    },

    update: function(t) {
        this.target.set('rotation', this.startAngle + this.angle *t);
    },

    reverse: function() {
        return RotateBy.create({duration: this.duration, angle: -this.angle});
    },

    copy: function() {
        return RotateBy.create({duration: this.duration, angle: this.angle});
    }
});



/**
 * @class cocos.actions.Sequence
 *
 * Runs a number of actions sequentially, one after another
 *
 * @extends cocos.actions.ActionInterval
 *
 * @constructor
 * @param {Float} duration Number of seconds to run action for
 * @param {Array:cocos.Action} Array of actions to run in sequence
 */
var Sequence = ActionInterval.extend({
    /**
     * Array of actions to run
     * @type cocos.Node[]
     */
    actions: null,

    /**
     * The array index of the currently running action
     * @type Integer
     */
    currentActionIndex: 0,

    /**
     * The duration when the current action finishes
     * @type Float
     */
    currentActionEndDuration: 0,

    init: function(opts) {
        @super;

        this.actions = util.copy(opts['actions']);
        this.actionSequence = {};
        
        util.each(this.actions, util.callback(this, function(action) {
            this.duration += action.duration;
        }));
    },

    startWithTarget: function(target) {
        @super;
        this.currentActionIndex = 0;
        this.currentActionEndDuration = this.actions[0].get('duration');
        this.actions[0].startWithTarget(this.target);
    },

    stop: function() {
        util.each(this.actions, function(action) {
            action.stop();
        });

        @super;
    },

    step: function(dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.actions[this.currentActionIndex].step(dt);
        this.update(Math.min(1, this.elapsed/this.duration));
    },

    update: function(dt) {
        // Action finished onto the next one
        if (this.elapsed > this.currentActionEndDuration) {
            var previousAction = this.actions[this.currentActionIndex];
            previousAction.update(1.0);
            previousAction.stop();


            this.currentActionIndex++;

            if (this.currentActionIndex < this.actions.length) {
                var currentAction = this.actions[this.currentActionIndex];
                currentAction.startWithTarget(this.target);

                this.currentActionEndDuration += currentAction.duration;
            }
        }
    }
});

/**
 * @class cocos.actions.Animate
 *
 * Animates a sprite given the name of an Animation 
 *
 * @extends cocos.actions.ActionInterval
 *
 * @constructor
 * @param {Float} duration Number of seconds to run action for
 * @param {cocos.Animation} animation Animation to run
 * @param {Boolean} restoreOriginalFrame (Optional) Return to first frame when finished
 */
var Animate = ActionInterval.extend({
    animation: null,
    restoreOriginalFrame: true,
    origFrame: null,

    init: function(opts) {
        this.animation = opts['animation'];
        this.restoreOriginalFrame = opts['restoreOriginalFrame'] !== false;
        opts['duration'] = this.animation.frames.length * this.animation.delay;

        @super;
    },

    startWithTarget: function(target) {
        @super;

        if (this.restoreOriginalFrame) {
            this.set('origFrame', this.target.get('displayedFrame'));
        }
    },

    stop: function() {
        if (this.target && this.restoreOriginalFrame) {
            var sprite = this.target;
            sprite.set('displayFrame', this.origFrame);
        }

        @super;
    },

    update: function(t) {
        var frames = this.animation.get('frames'),
            numberOfFrames = frames.length,
            idx = Math.floor(t * numberOfFrames);

        if (idx >= numberOfFrames) {
            idx = numberOfFrames -1;
        }

        var sprite = this.target;
        if (!sprite.isFrameDisplayed(frames[idx])) {
            sprite.set('displayFrame', frames[idx]);
        }
    },

    copy: function() {
        return Animate.create({animation: this.animation, restoreOriginalFrame: this.restoreOriginalFrame});
    }

});

exports.ActionInterval = ActionInterval;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.RotateTo = RotateTo;
exports.RotateBy = RotateBy;
exports.Sequence = Sequence;
exports.Animate = Animate;
