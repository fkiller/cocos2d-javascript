var sys = require('sys'),
    Obj = require('object').Object,
    Scheduler = require('./Scheduler').Scheduler,
    ActionManager = require('./ActionManager').ActionManager,
    geom = require('geometry'), ccp = geom.ccp;

/** @member cocos
 * @class
 *
 * The base class all visual elements extend from
 */
var Node = Obj.extend(/** @scope cocos.Node# */{
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

    isTransformDirty: true,
    isInverseDirty: true,
    inverse: null,
    transformMatrix: null,

    /**
     * The child Nodes
     * @property {cocos.Node[]}
     */
    children: null,

    /**
     * Initializes the object
     */
    init: function() {
        this.contentSize = {width: 0, height: 0};
        this.anchorPoint = ccp(0.5, 0.5);
        this.anchorPointInPixels = ccp(0, 0);
        this.position = ccp(0,0);
        this.children = [];
    },

    /** @private
     * Calculates the anchor point in pixels and updates the
     * anchorPointInPixels property
     */
    _updateAnchorPointInPixels: function() {
        this.anchorPointInPixels = ccp(this.contentSize.width * this.anchorPoint.x, this.contentSize.height * this.anchorPoint.y);
    }.observes('anchorPoint', 'contentSize'),

    /**
     * Add a child Node
     * @param {Node} opts.child The child node to add
     *
     * @returns {Node} The parent node; 'this'.
     */
    addChild: function(opts) {
        if (opts.isCocosNode) {
            return arguments.callee.call(this, {child:opts, z:0});
        }

        var child = opts['child'],
            z = opts['z'],
            tag = opts['tag'];

        //this.insertChild({child: child, z:z});
        var added = false;

        sys.each(this.children, sys.callback(this, function(a, i) {
            if (a.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                return;
            }
        }));

        if (!added) {
            this.children.push(child);
        }

        child.set('zOrder', z);

        child.set('parent', this);

        if (this.isRunning) {
            child.onEnter();
        }

        return this;
    },

    removeChild: function(opts) {
        // TODO
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
        sys.each(this.children, function(child) { child.onEnter(); });

        this.resumeSchedulerAndActions();
        this.set('isRunning', true);
    },
    onExit: function() {
        this.pauseSchedulerAndActions();
        this.set('isRunning', false);

        sys.each(this.children, function(child) { child.onExit(); });
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
            context.translate(Math.round(this.position.x + this.anchorPointInPixels.x), Math.round(this.position.y + this.anchorPointInPixels.y));
        } else {
            context.translate(Math.round(this.position.x), Math.round(this.position.y));
        }

        // Rotate
        context.rotate(geom.degressToRadians(this.get('rotation')));

        // Scale
        context.scale(this.scaleX, this.scaleY);
 
        if (this.anchorPointInPixels.x != 0 || this.anchorPointInPixels != 0) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }
    },

    runAction: function(action) {
        ActionManager.get('sharedManager').addAction({action: action, target: this, paused: this.get('isRunning')});
    },

    nodeToParentTransform: function() {
        if (this.isTransformDirty) {
            this.transformMatrix = geom.affineTransformIdentity();

            if (!this.isRelativeAnchorPoint && !geom.pointEqualToPoint(this.anchorPointInPixels, ccp(0,0))) {
                this.transformMatrix = geom.affineTransformTranslate(this.transformMatrix, this.anchorPointInPixels.x, this.anchorPointInPixels.y);
            }
            
            if(!geom.pointEqualToPoint(this.position, ccp(0,0))) {
                this.transformMatrix = geom.affineTransformTranslate(this.transformMatrix, this.position.x, this.position.y);
            }

            if(this.rotation != 0) {
                this.transformMatrix = geom.affineTransformRotate(this.transformMatrix, -geom.degressToRadians(this.rotation));
            }
            if(!(this.scaleX == 1 && this.scaleY == 1)) {
                this.transformMatrix = geom.affineTransformScale(this.transformMatrix, this.scaleX, this.scaleY);
            }
            
            if(!geom.pointEqualToPoint(this.anchorPointInPixels, ccp(0,0))) {
                this.transformMatrix = geom.affineTransformTranslate(this.transformMatrix, -this.anchorPointInPixels.x, -this.anchorPointInPixels.y);
            }
            
            this.isTransformDirty = false;
                
        }

        return this.transformMatrix;
    },

    parentToNodeTransform: function() {
        // TODO
    },

    nodeToWorldTransform: function() {
        var t = this.nodeToParentTransform();

        var p;
        for (p = this.get('parent'); p; p = p.get('parent')) {
            t = geom.affineTransformConcat(t, p.nodeToParentTransform());
        }

        return t;
    },

    worldToNodeTransform: function() {
        return geom.affineTransformInvert(this.nodeToWorldTransform());
    },

    convertToNodeSpace: function(worldPoint) {
        return geom.pointApplyAffineTransform(worldPoint, this.worldToNodeTransform());
    },

    acceptsFirstResponder: function() {
        return false;
    }.property(),

    becomeFirstResponder: function() {
        return true;
    },

    resignFirstResponder: function() {
        return true;
    }
});

module.exports.Node = Node;
