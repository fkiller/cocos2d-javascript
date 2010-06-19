var sys = require('sys'),
    Obj = require('object').Object;

var Action = Obj.extend({
    target: null,
    originalTarget: null,

    step: function(dt) {
        console.log('Action.step() Override me');
    },
    update: function() {
        console.log('Action.update() Override me');
    },
    startWithTarget: function(target) {
        this.target = this.originalTarget = target;
    },
    stop: function() {
        console.log('Stopping action:', this);
        this.target = null;
    },

    isDone: function(key) {
        return true;
    }.property()
});

var RepeatForever = Action.extend({
    other: null,

    init: function(action) {
        @super();

        this.other = action;
    },
    startWithTarget: function(target) {
        @super;

        this.other.startWithTarget(this.target);
    },
    step :function(dt) {
        this.other.step(dt);
        if (this.other.get('isDone')) {
            var diff = dt - this.other.get('duration') - this.other.get('elapsed');
            this.other.startWithTarget(this.target);

            this.other.step(diff);
        }
    },
    isDone: function() {
        return false;
    },
    reverse: function() {
        return RepeatForever.create(this.other.reverse());
    }
});

var FiniteTimeAction = Action.extend({
    duration: 2,

    reverse: function() {
        console.log('FiniteTimeAction.reverse() Override me');
    }
});

exports.Action = Action;
exports.RepeatForever = RepeatForever;
exports.FiniteTimeAction = FiniteTimeAction;
