var sys = require('sys'),
    Obj = require('object'),
    Scheduler = require('./Scheduler').Scheduler,
    ActionManager = require('./ActionManager').ActionManager,
    ccp = require('geometry').ccp;

exports.Node = Obj.Object.extend({
    isCocosNode: true,
    visible: true,
    position: null,
    parent: null,
    contentSize: null,
    zOrder: 0,
    anchorPoint: null,
    anchorPointInPixels: null,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    isRunning: false,
    isRelativeAnchorPoint: true,

    children: null,

    init: function() {
        this.contentSize = {width: 0, height: 0};
        this.anchorPoint = ccp(0.5, 0.5);
        this.anchorPointInPixels = ccp(0, 0);
        this.position = ccp(0,0);
        this.children = [];
    },

    _updateAnchorPointInPixels: function() {
        this.anchorPointInPixels = ccp(this.contentSize.width * this.anchorPoint.x, this.contentSize.height * this.anchorPoint.y);
    }.observes('anchorPoint', 'contentSize'),

    addChild: function(opts) {
        if (opts.isCocosNode) {
            return arguments.callee.call(this, {child:opts, z:0});
        }
        var child = opts['child'];

        //console.log('Adding child node:', child);
        child.set('parent', this);
        this.children.push(child);

        return child;
    },

    draw: function(context) {
        // All draw code goes here
    },

    scale: function(key, val) {
        if (val != undefined) {
            this.set('scaleX', val);
            this.set('scaleY', val);
        }

        if (this.scaleX != this.scaleY) {
            throw "scaleX and scaleY aren't identical"
        }

        return this.scaleX;
    }.property(),

    onEnter: function() {
        this.resumeSchedulerAndActions();
        this.set('isRunning', true);
    },
    onExit: function() {
        this.pauseSchedulerAndActions();
        this.set('isRunning', false);
    },
    resumeSchedulerAndActions: function() {
        Scheduler.get('sharedScheduler').resumeTarget(this);
        ActionManager.get('sharedManager').resumeTarget(this);
    },
    pauseSchedulerAndActions: function() {
        Scheduler.get('sharedScheduler').pauseTarget(this);
        ActionManager.get('sharedManager').pauseTarget(this);
    },

    visit: function(context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Draw background nodes
        sys.each(this.children, function(child, i) {
            if (child.zOrder < 0) {
                child.visit(context);
            }
        });

        this.draw(context);

        // Draw foreground nodes
        sys.each(this.children, function(child, i) {
            if (child.zOrder >= 0) {
                child.visit(context);
            }
        });

        context.restore();
    },
    transform: function(context) {
        // Translate
        if (this.isRelativeAnchorPoint && (this.anchorPointInPixels.x != 0 || this.anchorPointInPixels != 0)) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }

        if (this.anchorPointInPixels.x != 0 || this.anchorPointInPixels != 0) {
            context.translate(this.position.x + this.anchorPointInPixels.x, this.position.y + this.anchorPointInPixels.y);
        } else {
            context.translate(this.position.x, this.position.y);
        }

        // Rotate
        context.rotate(this.get('rotation'));

        // Scale
        context.scale(this.scaleX, this.scaleY);
 
        if (this.anchorPointInPixels.x != 0 || this.anchorPointInPixels != 0) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }
    },

    runAction: function(action) {
        ActionManager.get('sharedManager').addAction({action: action, target: this, paused: this.get('isRunning')});
    }
});

