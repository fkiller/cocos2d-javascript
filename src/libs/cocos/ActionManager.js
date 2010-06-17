var sys = require('sys'),
    Obj = require('object').Object;

var ActionManager = Obj.extend({
    addAction: function(opts) {
        console.log('Adding action with opts: ', opts);
    }
});

sys.extend(ActionManager, {
    sharedManager: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.ActionManager = ActionManager;
