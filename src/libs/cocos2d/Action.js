var util = require('util'),
    console = require('system').console,
    Thing = require('thing').Thing;

/** @member cocos
 * @class
 *
 * Base class for Actions
 */
var Action = Thing.extend(/** @scope cocos.Action# */{
    target: null,
    originalTarget: null,

    /**
     * Called every frame with it's delta time.
     *
     * @param {Float} dt The delta time
     */
    step: function(dt) {
        console.log('Action.step() Override me');
    },

    /**
     * Called once per frame.
     *
     * @param {Float} time How much of the animation has played. 0.0 = just started, 1.0 just finished.
     */
    update: function(time) {
        console.log('Action.update() Override me');
    },

    /**
     * Called before the action start. It will also set the target.
     *
     * @param {cocos.Node} target The Node to run the action on
     */
    startWithTarget: function(target) {
        this.target = this.originalTarget = target;
    },

    /**
     * Called after the action has finished. It will set the 'target' to nil.
     * <strong>Important</strong>: You should never call cocos.Action#stop manually.
     * Instead, use cocos.Node#stopAction(action)
     */
    stop: function() {
        this.target = null;
    },

    /** @field
     * Return true if the action has finished
     * 
     * @returns {Boolean} True if action has finished
     */
    isDone: function(key) {
        return true;
    }.property(),


    /**
     * Returns a copy of this Action but in reverse
     *
     * @returns {cocos.Action} A new Action in reverse
     */
    reverse: function() {
    }
});

/** @member cocos
 * @class
 *
 * Repeats an action forever. To repeat the an action for a limited number of
 * times use the cocos.Repeat action.
 *
 * @extends cocos.Action
 */
var RepeatForever = Action.extend(/** @scope cocos.RepeatForever# */{
    other: null,

    /** @ignore */
    init: function(action) {
        @super();

        this.other = action;
    },

    /** @ignore */
    startWithTarget: function(target) {
        @super;

        this.other.startWithTarget(this.target);
    },

    /** @ignore */
    step :function(dt) {
        this.other.step(dt);
        if (this.other.get('isDone')) {
            var diff = dt - this.other.get('duration') - this.other.get('elapsed');
            this.other.startWithTarget(this.target);

            this.other.step(diff);
        }
    },

    /** @ignore */
    isDone: function() {
        return false;
    },

    /** @ignore */
    reverse: function() {
        return RepeatForever.create(this.other.reverse());
    },

    /** @ignore */
    copy: function() {
        return RepeatForever.create(this.other.copy());
    }
});

/** @member cocos
 * @class
 *
 * Repeats an action a number of times. To repeat an action forever use the
 * cocos.RepeatForever action.
 *
 * @extends cocos.Action
 */
var FiniteTimeAction = Action.extend(/** @scope cocos.FiniteTimeAction# */{
    /**
     * Number of seconds to run the Action for
     * @type Float
     */
    duration: 2,

    /** @ignore */
    reverse: function() {
        console.log('FiniteTimeAction.reverse() Override me');
    }
});

exports.Action = Action;
exports.RepeatForever = RepeatForever;
exports.FiniteTimeAction = FiniteTimeAction;
