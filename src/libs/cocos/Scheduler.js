var sys = require('sys'),
    Obj = require('object').Object;

var Scheduler = Obj.extend({
});

sys.extend(Scheduler, {
    sharedScheduler: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.Scheduler = Scheduler;
