var sys = require('sys'),
	Texture2D = require('./Texture2D').Texture2D,
    Thing = require('thing').Thing;


/* QUAD STRUCTURE
 quad = {
	 drawRect: <rect>, // Where the quad is drawn to
	 textureRect: <rect>  // The slice of the texture to draw in drawRect
 }
*/

/** @member cocos
 * @class
 */
var TextureAtlas = Thing.extend(/** @scope cocos.TextureAtlas */{
	quads: null,
	imgElement: null,
	texture: null,

	init: function(opts) {
		var file = opts['file'],
			data = opts['data'],
			texture = opts['texture'],
			canvas = opts['canvas'];

        if (canvas) {
            // If we've been given a canvas element then we'll use that for our image
            this.imgElement = canvas;
        } else {
			var texture = this.set('texture', Texture2D.create({texture: texture, file: file, data: data}));
			this.imgElement = texture.get('imgElement');
        }

		this.quads = [];
	},

	insertQuad: function(opts) {
		var quad = opts['quad'],
			index = opts['index'] || 0;

		this.quads.splice(index, 0, quad);
	},
	removeQuad: function(opts) {
		var index = opts['index'];

		this.quads.splice(index, 1);
	},


	drawQuads: function(ctx) {
		sys.each(this.quads, sys.callback(this, function(quad) {
			if (!quad) return;

			this.drawQuad(ctx, quad);
		}));
	},

	drawQuad: function(ctx, quad) {
		ctx.drawImage(this.get('imgElement'), 
			quad.textureRect.origin.x, quad.textureRect.origin.y, // Draw slice from x,y
			quad.textureRect.size.width, quad.textureRect.size.height, // Draw slice size
			quad.drawRect.origin.x, quad.drawRect.origin.y, // Draw at 0, 0
			quad.drawRect.size.width, quad.drawRect.size.height // Draw size
		);
	}

});

exports.TextureAtlas = TextureAtlas
