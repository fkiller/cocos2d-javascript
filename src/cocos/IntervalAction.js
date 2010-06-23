var sys = require('sys'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var IntervalAction = act.FiniteTimeAction.extend({
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

    isDone: function() {
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

var ScaleTo = IntervalAction.extend({
    scaleX: 1,
    scaleY: 1,
    startScaleX: 1,
    startScaleY: 1,
    endScaleX: 1,
    endScaleY: 1,
    deltaX: 0.0,
    deltaY: 0.0,

    init: function(opts) {
        @super;

        if (opts['scale'] != undefined) {
            this.endScaleX = this.endScaleY = opts['scale'];
        } else {
            this.endScaleX = opts['scaleX'];
            this.endScaleY = opts['scaleY'];
        }


    },

    startWithTarget: function(target) {
        @super;

        this.startScaleX = this.target.get('scaleX');
        this.startScaleY = this.target.get('scaleY');
        this.deltaX = this.endScaleX - this.startScaleX;
        this.deltaY = this.endScaleY - this.startScaleY;
    },

    update: function(t) {
        if (!this.target) {
            return;
        }
        
        this.target.set('scaleX', this.startScaleX + this.deltaX * t);
        this.target.set('scaleY', this.startScaleY + this.deltaY * t);
    }
});

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

var Sequence = IntervalAction.extend({
    actions: null,
    currentActionIndex: 0,
    currentActionEndDuration: 0,

    init: function(opts) {
        @super;

        this.actions = sys.copy(opts['actions']);
        this.actionSequence = {};
        
        sys.each(this.actions, sys.callback(this, function(action) {
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
        sys.each(this.actions, function(action) {
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


exports.IntervalAction = IntervalAction;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.Sequence = Sequence;
