var sys = require('sys'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

/** @member cocos
 * @class
 *
 * Base class actions that do have a finite time duration. 
 *
 * Possible actions:
 *
 * - An action with a duration of 0 seconds
 * - An action with a duration of 35.5 seconds Infinite time actions are valid
 *
 * @extends cocos.FiniteTimeAction
 */
var IntervalAction = act.FiniteTimeAction.extend(/** @scope cocos.IntervalAction# */{
    /**
     * Number of seconds that have elapsed
     * @type Float
     */
    elapsed: 0.0,

    /** @private
     * @ignore
     */
    _firstTick: true,

    /** @ignore */
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

    /** @ignore */
    isDone: function() {
        return (this.elapsed >= this.duration);
    },

    /** @ignore */
    step: function(dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.update(Math.min(1, this.elapsed/this.duration));
    },

    /** @ignore */
    startWithTarget: function(target) {
        @super;

        this.elapsed = 0.0;
        this._firstTick = true;
    },

    /** @ignore */
    reverse: function() {
        throw "Reverse Action not implemented"
    }
});

/** @member cocos
 * @class
 *
 * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
 *
 * @extends cocos.IntervalAction
 */
var ScaleTo = IntervalAction.extend(/** @scope cocos.ScaleTo# */{
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

/** @member cocos
 * @class
 *
 * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
 *
 * @extends cocos.ScaleTo
 */
var ScaleBy = ScaleTo.extend(/** @scope cocos.ScaleBy# */{
    /** @ignore */
    startWithTarget: function(target) {
        @super;

        this.deltaX = this.startScaleX * this.endScaleX - this.startScaleX;
        this.deltaY = this.startScaleY * this.endScaleY - this.startScaleY;
    },

    /** @ignore */
    reverse: function() {
        return ScaleBy.create({duration: this.duration, scaleX:1/this.endScaleX, scaleY:1/this.endScaleY});
    }
});


/** @member cocos
 * @class
 *
 * Rotates a cocos.Node object to a certain angle by modifying its rotation
 * attribute. The direction will be decided by the shortest angle.
 *
 * @extends cocos.IntervalAction
 */
var RotateTo = IntervalAction.extend(/** @scope cocos.RotateTo# */{
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

    /** @ignore */
    init: function(opts) {
        @super;

        this.dstAngle = opts['angle'];
    },

    /** @ignore */
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

/** @member cocos
 * @class
 *
 * Rotates a cocos.Node object to a certain angle by modifying its rotation
 * attribute. The direction will be decided by the shortest angle.
 *
 * @extends cocos.RotateTo
 */
var RotateBy = RotateTo.extend(/** @scope cocos.RotateBy# */{
    /**
     * Number of degrees to rotate by
     * @type Float
     */
    angle: 0,

    /** @ignore */
    init: function(opts) {
        this.angle = opts['angle'];
    },

    /** @ignore */
    startWithTarget: function(target) {
        @super;

        this.startAngle = this.target.get('rotation');
    },

    /** @ignore */
    update: function(t) {
        this.target.set('rotation', this.startAngle + this.angle *t);
    },

    /** @ignore */
    reverse: function() {
        return RotateBy.create({duration: this.duration, angle: -this.angle});
    }
});



/** @member cocos
 * @class
 *
 * Runs actions sequentially, one after another
 *
 * @extends cocos.IntervalAction
 */
var Sequence = IntervalAction.extend(/** @scope cocos.Sequence# */{
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

    /** @ignore */
    init: function(opts) {
        @super;

        this.actions = sys.copy(opts['actions']);
        this.actionSequence = {};
        
        sys.each(this.actions, sys.callback(this, function(action) {
            this.duration += action.duration;
        }));
    },

    /** @ignore */
    startWithTarget: function(target) {
        @super;
        this.currentActionIndex = 0;
        this.currentActionEndDuration = this.actions[0].get('duration');
        this.actions[0].startWithTarget(this.target);
    },

    /** @ignore */
    stop: function() {
        sys.each(this.actions, function(action) {
            action.stop();
        });

        @super;
    },

    /** @ignore */
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

    /** @ignore */
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


exports.IntervalAction = IntervalAction;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.RotateTo = RotateTo;
exports.RotateBy = RotateBy;
exports.Sequence = Sequence;
