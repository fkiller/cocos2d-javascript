var sys = require('sys'),
	Node = require('./Node').Node;

var SpriteSheet = Node.extend({
	texture: null,
	descendants: null,

	init: function(opts) {
		@super;

		if (opts['file']) {
			this.texture = resource(opts['file']);
		} else {
			this.texture = opts['texture'];
		}

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
		var ret = @super;

		var index = this.atlasIndexForChild({child: opts['child'], z:opts['z']});
		this.insertChild({child: opts['child'], atlasIndex:index});
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
		var sprite = opts['sprite'],
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
	}
});

exports.SpriteSheet = SpriteSheet;
