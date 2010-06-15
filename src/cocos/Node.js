var sys = require('sys'),
    obj = require('object'),
    ccp = require('geometry').ccp;

exports.Node = obj.Object.extend({
    visible: true,
    position: null,
    parent: null,
    contentSize: null,
    zOrder: 0,
    anchor: null,
    rotation: 0,
    scale: 1,

    _children: null,

    init: function() {
        this.contentSize = {width: 0, height: 0};
        this.anchor = ccp(0.5, 0.5);
        this.position = ccp(0,0);
        this._children = [];
    },

    addChild: function(node) {
        console.log('Adding child node:', node);
        node.set('parent', this);
        this._children.push(node);
    },

    draw: function(context) {
        // All draw code goes here
    },

    visit: function(context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Draw background nodes
        sys.each(this._children, function(child, i) {
            if (child.zOrder < 0) {
                child.visit(context);
            }
        });

        this.draw(context);

        // Draw foreground nodes
        sys.each(this._children, function(child, i) {
            if (child.zOrder >= 0) {
                child.visit(context);
            }
        });

        context.restore();
    },
    transform: function(context) {
        context.translate(this.position.x, this.position.y);
        context.rotate(this.get('rotation'));
        context.translate(-this.anchor.x * this.contentSize.width, -this.anchor.y * this.contentSize.height);
 
    }
});

