var sys = require('sys'),
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
	Node = require('./Node').Node;

/** @member cocos
 * @class
 *
 * @extends cocos.Node
 */
var SpriteSheet = Node.extend(/** @scope cocos.SpriteSheet# */{
	textureAtlas: null,
	descendants: null,

	init: function(opts) {
		@super;

        var file = opts['file'],
            textureAtlas = opts['textureAtlas'];

        if (!textureAtlas && file) {
            textureAtlas = TextureAtlas.create({file:file});
        } else if (!textureAtlas && !file) {
            throw "SpriteSheet has no texture or file";
        }

		this.textureAtlas = textureAtlas;

		this.descendants = [];
	},

	// Don't call visit on child nodes
    visit: function(context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        this.draw(context);

        context.restore();
	},

	addChild: function(opts) {
        if (opts.isCocosNode) {
            return arguments.callee.call(this, {child:opts, z:0});
        }

		var ret = @super;

		opts['child'].set('textureAtlas', this.get('textureAtlas'));
		var index = this.atlasIndexForChild({child: opts['child'], z:opts['z']});
		this.insertChild({child: opts['child'], index:index});

		return ret;
	},

	insertChild: function(opts) {
		var sprite = opts['child'],
			index = opts['index'];

		sprite.set('useSpriteSheet', true);
		sprite.set('atlasIndex', index);
		sprite.set('dirty', true);

		this.descendants[index] = sprite;

		// Update indices
		sys.each(this.descendants, function(child, i) {
			if (i > index) {
				child.inc('atlastIndex');
			}
		});

		// Add children
		sys.each(sprite.children, sys.callback(this, function(child, i) {
			if (!child) {
				return;
			}
			var index = this.atlasIndexForChild({child:child, z:child.zOrder});
			this.insertChild({child: child, index: index});
		}));
	},


	highestAtlasIndexInChild: function(sprite) {
		var children = sprite.get('children');
		if (children.length == 0) {
			return sprite.get('atlasIndex');
		} else {
			return this.highestAtlasIndexInChild(children[children.length-1]);
		}
	},

	lowestAtlasIndexInChild: function(sprite) {
		var children = sprite.get('children');
		if (children.length == 0) {
			return sprite.get('atlasIndex');
		} else {
			return this.highestAtlasIndexInChild(children[0]);
		}
	},
	

	atlasIndexForChild: function(opts) {
		var sprite = opts['child'],
			z = opts['z'];

		var siblings = sprite.get('parent.children'),
			childIndex = siblings.indexOf(sprite);

		var ignoreParent = (sprite.get('parent') == this),
			previous;

		if (childIndex > 0) {
			previous = siblings[childIndex -1];
		}

		if (ignoreParent) {
			if (childIndex == 0) {
				return 0;
			} else {
				return this.highestAtlasIndexInChild(previous) +1;
			}
		}

		// Parent is a Sprite
		if (childIndex == 0) {
			var p = sprite.parent;

			if (z < 0) {
				return p.atlasIndex;
			} else {
				return p.atlasIndex + 1;
			}
		} else {
			// Previous and Sprite belong to same branch
			if ((previous.zOrder < 0 && z < 0) || (previous >= 0 && z >= 0)) {
				return this.highestAtlasIndexInChild(previous) +1;
			}

			var p = sprite.parent;
			return p.atlasIndex +1;
		}

		throw "Should not happen. Error calculating Z on SpriteSheet";
	},

	draw: function(ctx) {
		sys.each(this.descendants, function(child, i) {
			child.updateTransform(ctx);
		});

		this.textureAtlas.drawQuads(ctx);
	},

	texture: function() {
		return this.textureAtlas.texture;
	}.property()
});

exports.SpriteSheet = SpriteSheet;
