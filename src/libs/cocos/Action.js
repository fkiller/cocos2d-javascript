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
    }
});

var FiniteTimeAction = Action.extend({
    duration: 2,

    reverse: function() {
        console.log('FiniteTimeAction.reverse() Override me');
    }
});

exports.Action = Action;
exports.FiniteTimeAction = FiniteTimeAction;
