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
    }
});

exports.SpriteSheet = SpriteSheet;
