var sys = require('sys'),
    Obj = require('object').Object;

var Texture2D = Obj.extend({
	imgElement: null,
	size: null,

	init: function(opts) {
		var file = opts['file'],
			data = opts['data'],
			texture = opts['texture'];

		if (file) {
			data = resource(file);
		} else if (texture) {
			data = texture.get('data');
		}

		this.size = {width: 0, height: 0};

		this.imgElement = new Image;
		this.imgElement.onload = sys.callback(this, function() {
			this.set('size', {width:this.imgElement.width, height: this.imgElement.height});
		});
		this.imgElement.src = data;
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
