var util = require('util');

/**
 * @class cocos.Texture2D
 * @extends BObject
 *
 * @constructor
 * @namedparams
 * @param {String} file (Optional) The file path of the image to use as a texture
 * @param {Texture2D} data (Optional) Another Texture2D to use the image data from
 * @param {HTMLImageElement} data (Optional) The image resource to use as a texture
 **/
var Texture2D = BObject.extend({
	imgElement: null,
	size: null,
    name: null,

	init: function(opts) {
		var file = opts['file'],
			data = opts['data'],
			texture = opts['texture'];

		if (file) {
            this.name = file;
			data = resource(file);
		} else if (texture) {
            this.name = texture.get('name');
			data = texture.get('imgElement');
		}

		this.size = {width: 0, height: 0};

		this.set('imgElement', data);
		this.set('size', {width:this.imgElement.width, height: this.imgElement.height});
	},

	drawAtPoint: function(ctx, point) {
		ctx.drawImage(this.imgElement, point.x, point.y);
	},
	drawInRect: function(ctx, rect) {
		ctx.drawImage(this.imgElement,
			rect.origin.x, rect.origin.y,
			rect.size.width, rect.size.height
		);
	},

    get_data: function() {
        return this.imgElement ? this.imgElement.src : null;
	},

    get_contentSize: function() {
		return this.size;
    }
});

exports.Texture2D = Texture2D;
