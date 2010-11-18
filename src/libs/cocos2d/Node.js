var sys = require('sys'),
    Thing = require('thing').Thing,
    Scheduler = require('./Scheduler').Scheduler,
    ActionManager = require('./ActionManager').ActionManager,
    geom = require('geometry'), ccp = geom.ccp;

/** @member cocos
 * @class
 *
 * The base class all visual elements extend from
 */
var Node = Thing.extend(/** @scope cocos.Node# */{
    isCocosNode: true,
    visible: true,
    position: null,
    parent: null,
    tag: null,
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
     * @param {Object} params Parameters
     * @param {cocos.Node} params.child The child node to add
     *
     * @returns {cocos.Node} The parent node; 'this'.
     */
    addChild: function(params) {
        if (params.isCocosNode) {
            return arguments.callee.call(this, {child:params});
        }

        var child = params['child'],
            z = params['z'],
            tag = params['tag'];

        if (z == undefined) {
            z = child.get('zOrder');
        }

        //this.insertChild({child: child, z:z});
        var added = false;

        
        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }

        child.set('tag', tag);
        child.set('zOrder', z);
        child.set('parent', this);

        if (this.isRunning) {
            child.onEnter();
        }

        return this;
    },
    getChild: function(opts) {
        var tag = opts['tag'];

        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].tag == tag) {
                return this.children[i];
            }
        }

        return null;
    },

    removeChild: function(opts) {
        // TODO
    },

    reorderChild: function(opts) {
        var child = opts['child'],
            z     = opts['z'];

        var pos = this.children.indexOf(child);
        if (pos == -1) {
            throw "Node isn't a child of this node";
        }

        child.set('zOrder', z);

        // Remove child
        this.children.splice(pos, 1);

        // Add child back at correct location
        var added = false;
        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }
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

    cleanup: function() {
        this.stopAllActions();
        this.unscheduleAllSelectors();
        sys.each(this.children, function(child) { child.cleanup(); });
    },

    resumeSchedulerAndActions: function() {
        Scheduler.get('sharedScheduler').resumeTarget(this);
        ActionManager.get('sharedManager').resumeTarget(this);
    },
    pauseSchedulerAndActions: function() {
        Scheduler.get('sharedScheduler').pauseTarget(this);
        ActionManager.get('sharedManager').pauseTarget(this);
    },
    unscheduleAllSelectors: function() {
        Scheduler.get('sharedScheduler').unscheduleAllSelectorsForTarget(this);
    },
    stopAllActions: function() {
        ActionManager.get('sharedManager').removeAllActionsFromTarget(this);
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
