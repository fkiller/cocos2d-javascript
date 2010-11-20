var sys = require('sys'),
    geo = require('geometry'),
    ccp = geo.ccp,
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
    RenderTexture = require('./RenderTexture').RenderTexture,
	Node = require('./Node').Node;

/** @member cocos
 * @class
 *
 * @extends cocos.Node
 */
var BatchNode = Node.extend(/** @scope cocos.BatchNode# */{
    contentRect: null,
    renderTexture: null,
    dirty: true,
    dynamicResize: false,

    /** @private
     * Areas that need redrawing
     *
     * Not implemented
     */
    _dirtyRects: null,


	init: function(opts) {
		@super;

        var size = opts['size'] || geo.sizeMake(1, 1);
        
		this._dirtyRects = [];
        this.contentRect = geo.rectMake(0, 0, size.width, size.height);
        this.renderTexture = RenderTexture.create(size);
        this.renderTexture.sprite.set('isRelativeAnchorPoint', false);
        this.addChild({child: this.renderTexture});
	},

    addChild: function(opts) {
        var ret = @super;

        var child = opts['child'],
            z     = opts['z'];

        if (child == this.renderTexture) {
            return ret;
        }

        // TODO handle texture resize

        // Watch for changes in child
        child.addObserver('isTransformDirty visible'.w(), sys.callback(this, function() {
            this.set('dirty', true);
        }));
        this.set('dirty', true);

        return ret;
    },

    _resizeCanvas: function(obj, key, val, oldVal) {
        if (geo.sizeEqualToSize(val, oldVal)) {
            return; // No change
        }

        this.renderTexture.set('contentSize', val);
        this.set('dirty', true);
    }.observes('contentSize'),

    update: function() {

    },

    visit: function(context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Only redraw if something changed
        if (this.dirty) {
            this.renderTexture.clear();
            for (var i = 0, childLen = this.children.length; i < childLen; i++) {
                var c = this.children[i];
                if (c == this.renderTexture) {
                    continue;
                }
                c.visit(this.renderTexture.context);
            }
            this.set('dirty', false);
        }

        this.renderTexture.visit(context);

        this.draw(context);

        context.restore();
	},

	draw: function(ctx) {
    }
});

/** @member cocos
 * @class
 *
 * @extends cocos.BatchNode
 */
var SpriteBatchNode = BatchNode.extend(/** @scope cocos.SpriteBatchNode# */{
    textureAtlas: null,

    /** 
     * @param {String} opts.file Path to image to use as sprite atlas
     * @param {Rect} opts.rect The rect in the sprite atlas image file to use as the sprite
     */
    init: function(opts) {
        @super;

        var file         = opts['file'],
            textureAtlas = opts['textureAtlas'],
            texture      = opts['texture'];

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        }

        this.textureAtlas = textureAtlas;
    },

	texture: function() {
		return this.textureAtlas.texture;
	}.property()

});

exports.BatchNode = BatchNode;
exports.SpriteBatchNode = SpriteBatchNode;
