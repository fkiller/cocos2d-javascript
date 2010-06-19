var sys = require('sys'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var IntervalAction = act.FiniteTimeAction.extend({
    elapsed: 0.0,

    _firstTick: true,

    init: function(opts) {
        @super;

        var dur = opts['duration'];
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


exports.IntervalAction = IntervalAction;
exports.ScaleTo = ScaleTo;
