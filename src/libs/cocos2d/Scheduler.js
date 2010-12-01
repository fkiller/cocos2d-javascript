var util = require('util'),
    Thing = require('thing').Thing;

/** @ignore */
function HashUpdateEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

/** @ignore */
function HashMethodEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

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

    update: function(dt) {
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
    updates0: null,
    updatesNeg: null,
    updatesPos: null,
    hashForUpdates: null, // <-- TODO
    hashForMethods: null,
    timeScale: 1.0,

    init: function() {
        this.updates0 = [];
        this.updatesNeg = [];
        this.updatesPos = [];
        this.hashForUpdates = {};
        this.hashForMethods = {};
    },

    schedule: function(opts) {
        var target   = opts['target'],
            method   = opts['method'],
            interval = opts['interval'],
            paused   = opts['paused'] || false;

        var element = this.hashForMethods[target.get('id')];

        if (!element) {
            element = new HashMethodEntry;
            this.hashForMethods[target.get('id')] = element;
            element.target = target;
            element.paused = paused;
        } else if (element.paused != paused) {
            throw "cocos.Scheduler. Trying to schedule a method with a pause value different than the target";
        }

        var timer = Timer.create({callback: util.callback(target, method), interval: interval});
        element.timers.push(timer);
    },

    scheduleUpdate: function(opts) {
        var target   = opts['target'],
            priority = opts['priority'],
            paused   = opts['paused'];

        var entry = {target: target, priority: priority, paused: paused};
        var added = false;

        if (priority == 0) {
            this.updates0.push(entry);
        } else if (priority < 0) {
            for (var i = 0, len = this.updatesNeg.length; i < len; i++) {
                if (priority < this.updatesNeg[i].priority) {
                    this.updatesNeg.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesNeg.push(entry);
            }
        } else /* priority > 0 */{
            for (var i = 0, len = this.updatesPos.length; i < len; i++) {
                if (priority < this.updatesPos[i].priority) {
                    this.updatesPos.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesPos.push(entry);
            }
        }

        this.hashForUpdates[target.get('id')] = entry;
    },

    tick: function(dt) {
        if (this.timeScale != 1.0) {
            dt *= this.timeScale;
        }

        var entry;
        for (var i = 0, len = this.updatesNeg.length; i < len; i++) {
            entry = this.updatesNeg[i];
            if (!entry.paused) entry.target.update(dt);
        }

        for (var i = 0, len = this.updates0.length; i < len; i++) {
            entry = this.updates0[i];
            if (!entry.paused) entry.target.update(dt);
        }

        for (var i = 0, len = this.updatesPos.length; i < len; i++) {
            entry = this.updatesPos[i];
            if (!entry.paused) entry.target.update(dt);
        }

        for (var x in this.hashForMethods) {
            var entry = this.hashForMethods[x];
            for (var i = 0, len = entry.timers.length; i < len; i++) {
                var timer = entry.timers[i];
                timer.update(dt);
            }
        }

	},

    unscheduleAllSelectorsForTarget: function(target) {
    },

    pauseTarget: function(target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.pause = true;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        if (elementUpdate) {
            elementUpdate.paused = true;
        }
    },

	resumeTarget: function(target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.pause = false;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        if (elementUpdate) {
            elementUpdate.paused = false;
        }
	}
});

util.extend(Scheduler, /** @scope cocos.Scheduler */{
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
