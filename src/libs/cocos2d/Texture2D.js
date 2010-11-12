var sys = require('sys'),
    Thing = require('thing').Thing;

/** @member cocos
 * @class */
var Texture2D = Thing.extend(/** @scope cocos.Texture2D# */{
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

		this.imgElement = data;
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

	data: function() {
		return this.imgElement.src;
	}.property(),

	contentSize: function() {
		return this.size;
    }.property()
});

exports.Texture2D = Texture2D;
