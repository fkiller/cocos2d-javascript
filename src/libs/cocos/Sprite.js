var sys = require('sys'),
    Director = require('./Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

exports.Sprite = Node.extend({
	texture: null,
	img: null,

    /**
     * opts: {
     *     file: Path to image to use as sprite atlas
     *     rect: The rect in the sprite atlas image file to use as the sprite
     * }
     */
	init: function(opts) {
		@super;

        var texture = this.set('texture', resource(opts['file'])),
            img = this.set('img', new Image);

        img.onload = sys.callback(this, function() {
            if (opts['rect']) {
                //this.set('contentSize', opts['rect'].size);
                this.set('contentSize', {width:img.width, height: img.height});
            } else {
                this.set('contentSize', {width:img.width, height: img.height});
            }
        });

        img.src = texture;


	},

	draw: function(ctx) {
		ctx.drawImage(this.get('img'), 0, 0, this.contentSize.width * this.scale, this.contentSize.height * this.scale);
	}
});
