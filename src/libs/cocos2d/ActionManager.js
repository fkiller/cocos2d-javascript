var sys = require('sys'),
    console = require('system').console,
    Thing = require('thing').Thing,
    Timer = require('./Scheduler').Timer,
    Scheduler = require('./Scheduler').Scheduler;

/** @member cocos
 * @class
 *
 * cocos.ActionManager is a singleton that manages all the actions. Normally you
 * won't need to use this singleton directly. 99% of the cases you will use the
 * cocos.Node interface, which uses this singleton. But there are some cases where
 * you might need to use this singleton. Examples:
 *
 * - When you want to run an action where the target is different from a cocos.Node</li>
 * - When you want to pause / resume the actions
 * 
 *
 */
var ActionManager = Thing.extend(/** @scope cocos.ActionManager# */{
    targets: null,
    currentTarget: null,
    currentTargetSalvaged: null,

    init: function() {
        @super;

        this.targets = [];

        Scheduler.get('sharedScheduler')
          .scheduleTimer(Timer.create({ callback: sys.callback(this, 'tick') }));
    },

    addAction: function(opts) {
        console.log('Adding action with opts: ', opts);

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
        var targetID = action.originalTarget.id,
            element = this.targets[targetID],
            actionIndex = element.actions.indexOf(action);

        console.log('Removing action:', element);
        if (element && actionIndex > -1) {

            if (this.currentTarget == element) {
                element.currentActionSalvaged = true;
            } 
            
            element.actions[actionIndex] = null;
            element.actions.splice(actionIndex, 1); // Delete array item
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

    tick: function(dt) {

        var self = this;
        sys.each(this.targets, function(currentTarget, i) {
            if (!currentTarget) return;
            self.currentTarget = currentTarget;

            if (!currentTarget.paused) {
                sys.each(currentTarget.actions, function(currentAction, j) {
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

sys.extend(ActionManager, /** @scope cocos.ActionManager */{
    /** @field
     * A shared singleton instance of cocos.ActionManager
     * @type cocos.ActionManager
     */
    sharedManager: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.ActionManager = ActionManager;
