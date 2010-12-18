var util = require('util'),
    console = require('system').console,
    Timer = require('./Scheduler').Timer,
    Scheduler = require('./Scheduler').Scheduler;

/**
 * @class cocos.ActionManager
 * @extends BObject
 *
 * <p>A singleton that manages all the actions. Normally you
 * won't need to use this singleton directly. 99% of the cases you will use the
 * cocos.Node interface, which uses this singleton. But there are some cases where
 * you might need to use this singleton. Examples:</p>
 *
 * <ul>
 * <li>When you want to run an action where the target is different from a cocos.Node</li>
 * <li>When you want to pause / resume the actions</li>
 * </ul>
 *
 * @singleton
 */
var ActionManager = BObject.extend({
    targets: null,
    currentTarget: null,
    currentTargetSalvaged: null,

    init: function() {
        @super;

        Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: 0, paused: false});
        this.targets = [];
    },

    addAction: function(opts) {

        var targetID = opts['target'].get('id');
        var element = this.targets[targetID];

        if (!element) {
            element = this.targets[targetID] = {
                paused: false,
                target: opts['target'],
                actions: []
            };
        }

        element.actions.push(opts['action']);

        opts['action'].startWithTarget(opts['target']);
    },

    removeAction: function(action) {
        var targetID = action.originalTarget.get('id'),
            element = this.targets[targetID],
            actionIndex = element.actions.indexOf(action);

        if (element && actionIndex > -1) {

            if (this.currentTarget == element) {
                element.currentActionSalvaged = true;
            } 
            
            element.actions[actionIndex] = null;
            element.actions.splice(actionIndex, 1); // Delete array item

            if (element.actions.length == 0) {
                if (this.currentTarget == element) {
                    this.set('currentTargetSalvaged', true);
                }
            }
        } else {
            console.log('cocos2d: removeAction: Target not found');
        }
    },

    removeAllActionsFromTarget: function(target) {
        var targetID = target.get('id');

        var element = this.targets[targetID];
        if (!element) {
            return;
        }

        // Delete everything in array but don't replace it incase something else has a reference
        element.actions.splice(0, element.actions.length-1);
    },

    update: function(dt) {
        var self = this;
        util.each(this.targets, function(currentTarget, i) {

            if (!currentTarget) return;
            self.currentTarget = currentTarget;

            if (!currentTarget.paused) {
                util.each(currentTarget.actions, function(currentAction, j) {
                    if (!currentAction) return;

                    currentTarget.currentAction = currentAction;
                    currentTarget.currentActionSalvaged = false;

                    currentTarget.currentAction.step(dt);

                    if (currentTarget.currentAction.get('isDone')) {
                        currentTarget.currentAction.stop();

                        var a = currentTarget.currentAction;
                        currentTarget.currentAction = null;
                        self.removeAction(a);
                    }

                    currentTarget.currentAction = null;

                });
            }

            if (self.currentTargetSalvaged && currentTarget.actions.length == 0) {
                self.targets[i] = null;
                delete self.targets[i];
            }
        });

        delete self;
    },

    pauseTarget: function(target) {
    },

	resumeTarget: function(target) {
		// TODO
	}
});

util.extend(ActionManager, {
    /**
     * @property ActionManager.sharedManager A shared singleton instance of cocos.ActionManager
     * @type cocos.ActionManager
     */
    get_sharedManager: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.ActionManager = ActionManager;
