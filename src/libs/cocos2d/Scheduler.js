var sys = require('sys'),
    Thing = require('thing').Thing;


/** @member cocos
 * @class
 */
var Timer = Thing.extend(/** @scope cocos.Timer# */{
    callback: null,
    interval: 0,
    elapsed: -1,

    init: function(opts) {
        @super;

        this.set('callback', opts['callback']);
        this.set('elapsed', -1);
        this.set('interval', opts['interval'] || 0);
    },

    fire: function(dt) {
        if (this.elapsed == -1) {
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        if (this.elapsed >= this.interval) {
            this.callback(this.elapsed);
            this.elapsed = 0;
        }
    }
});


/** @member cocos
 * @class
 */
var Scheduler = Thing.extend(/** @scope cocos.Scheduler# */{
    scheduledMethods: null,
    methodsToAdd: null,
    methodsToRemove: null,
    timeScale: 1.0,

    init: function() {
        this.scheduledMethods = [];
        this.methodsToAdd     = [];
        this.methodsToRemove  = [];
    },

    scheduleTimer: function(timer) {
        var i;
        if (i = this.methodsToRemove.indexOf(timer) > -1) {
            this.methodsToRemove.splice(i, 1); // Remove timer
            return;
        }

        if (this.scheduledMethods.indexOf(timer) > -1 || this.methodsToAdd.indexOf(timer) > -1) {
            throw "Scheduler.scheduleTimer: timer already scheduled";
        }

        this.methodsToAdd.push(timer);
    },

    tick: function(dt) {
        if (this.timeScale != 1.0) {
            dt *= this.timeScale;
        }

        sys.each(this.methodsToRemove, sys.callback(this, function(timer) {
            var i = this.scheduledMethods.indexOf(timer);
            if (i == -1) {
                return;
            }

            this.scheduledMethods.splice(i, 1);
        }));
        this.methodsToRemove = [];

        sys.each(this.methodsToAdd, sys.callback(this, function(timer) {
            this.scheduledMethods.push(timer);
        }));
        this.methodsToAdd = [];

        sys.each(this.scheduledMethods, function(obj) {
            obj.fire(dt);
        });
	},

    unscheduleAllSelectorsForTarget: function(target) {
    },

    pauseTarget: function(target) {
    },

	resumeTarget: function(target) {
		// TODO
	}
});

sys.extend(Scheduler, /** @scope cocos.Scheduler */{
    /** @field */
    sharedScheduler: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.Timer = Timer;
exports.Scheduler = Scheduler;
