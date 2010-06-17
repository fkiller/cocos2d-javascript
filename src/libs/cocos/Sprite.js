var sys = require('sys'),
    Director = require('./Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

exports.Sprite = Node.extend({
    texture: null,
    img: null,
    rect: null,

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

        if (opts['rect']) {
            this.set('rect', opts['rect']);
            this.set('contentSize', opts['rect'].size);
        } else {
            img.onload = sys.callback(this, function() {
                this.set('contentSize', {width:img.width, height: img.height});
            });
        }

        img.src = texture;
    },

    draw: function(ctx) {
        var rect = this.get('rect');
        if (rect) {
            ctx.drawImage(this.get('img'), 
                rect.origin.x, rect.origin.y, // Draw slice from x,y
                rect.size.width, rect.size.height, // Draw slice size
                0, 0, // Draw at 0, 0
                this.contentSize.width * this.scaleX, this.contentSize.height * this.scaleY // Draw size
            );
        } else {
            ctx.drawImage(this.get('img'),
                0, 0, // Draw at 0, 0 (translate will move to the real position)
                this.contentSize.width * this.scaleX, this.contentSize.height * this.scaleY // Draw size
            );
        }
    }
});
