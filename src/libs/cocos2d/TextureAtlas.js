var util = require('util'),
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
		util.each(this.quads, util.callback(this, function(quad) {
			if (!quad) return;

			this.drawQuad(ctx, quad);
		}));
	},

	drawQuad: function(ctx, quad) {
        var sx = quad.textureRect.origin.x,
            sy = quad.textureRect.origin.y,
            sw = quad.textureRect.size.width, 
            sh = quad.textureRect.size.height;

        var dx = quad.drawRect.origin.x,
            dy = quad.drawRect.origin.y,
            dw = quad.drawRect.size.width, 
            dh = quad.drawRect.size.height;

        var scaleX = 1;
        var scaleY = 1;
            
        if (dw < 0) {
            dw *= -1
            scaleX = -1;
        }
            
        if (dh < 0) {
            dh *= -1
            scaleY = -1;
        }

        ctx.scale(scaleX, scaleY);

		ctx.drawImage(this.get('imgElement'), 
			sx, sy, // Draw slice from x,y
			sw, sh, // Draw slice size
			dx, dy, // Draw at 0, 0
			dw, dh  // Draw size
		);
        ctx.scale(1, 1);
	}
});

exports.TextureAtlas = TextureAtlas
