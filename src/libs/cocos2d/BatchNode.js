var sys = require('sys'),
    geo = require('geometry'),
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
	Node = require('./Node').Node;

/** @member cocos
 * @class
 *
 * @extends cocos.Node
 */
var BatchNode = Node.extend(/** @scope cocos.BatchNode# */{
    contentRect: null,
    renderTextre: null,
	descendants: null,
    dynamicResize: false,

    /** @private
     * Areas that need redrawing
     */
    _dirtyRects: null,

	init: function(opts) {
		@super;

        var size = opts['size'];

		this.descendants = [];
		this._dirtyRects = [];

        this.contentRect = geo.rectMake(0, 0, 0, 0);
	},

    addChild: function(opts) {
        @super;

        var child = opts['child'];

        // TODO create or enlarge renderTexture to accommodate new child
        if (this.children.length == 1) {
            // Only 1 child, so content rect is exactly that
            this.set('contentRect', {size: sys.copy(child.get('contentSize')), origin: sys.copy(child.get('position'))});
        }
        
    },

    _didUpdateContentRect: function(obj, key, val, oldVal) {
        if (geo.rectEqualToRect(val, oldVal)) {
            return; // No change
        }
        this.set('contentSize', this.contentRect.size);

        // Resize render texture
        // TODO Copy current renderTexture image
        // TODO Clear renderTexture
        // TODO Resize renderTexture
        // TODO Draw previous image -- adjust origin if it changed
    }.observes('contentRect'),

    update: function() {

    },

	// Don't call visit/draw on child nodes
    visit: function(context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Adjust origin to account of contentRect.origin
        context.translate(this.contentRect.origin.x, this.contentRect.origin.y);

        this.draw(context);

        context.restore();
	},

	draw: function(ctx) {
        @super;
    }
});

exports.BatchNode = BatchNode;
