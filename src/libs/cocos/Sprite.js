var sys = require('sys'),
    Director = require('./Director').Director,
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

exports.Sprite = Node.extend({
    texture: null,
    rect: null,
    dirty: true,
    recursiveDirty: true,
    quad: null,

    /**
     * opts: {
     *     file: Path to image to use as sprite atlas
     *     rect: The rect in the sprite atlas image file to use as the sprite
     * }
     */
    init: function(opts) {
        @super;

        var file = opts['file'],
            texture = opts['texture'],
            rect = opts['rect'];

        if (!texture && file) {
            texture = TextureAtlas.create({file:file});
        } else if (!texture && !file) {
            throw "Sprite has no texture or file";
        }

        this.set('texture', texture);
        if (rect) {
            this.set('rect', rect);
            this.set('contentSize', rect.size);
        }

        this.quad = {
            drawRect: {origin: ccp(0, 0), size: rect.size},
            textureRect: rect
        };

        texture.insertQuad({quad: this.get('quad')});
    },

    _updateQuad: function() {
        if (!this.quad) {
            return;
        }

        this.quad.drawRect.size = {width: this.rect.size.width * this.scaleX, height: this.rect.size.height * this.scaleY};
    }.observes('scale', 'scaleX', 'scaleY', 'rect'),

    updateTransform: function(ctx) {
        if (!this.useSpriteSheet) {
            throw "updateTransform is only valid when Sprite is being rendered using a SpriteSheet"
        }

        if (!this.visible) {
            this.set('dirty', false);
            this.set('recursiveDirty', false);
            return;
        }


        this.transform(ctx);

        this.set('dirty', false);
        this.set('recursiveDirty', false);
    },

    draw: function(ctx) {
        var rect = this.get('rect');
        var texture = this.get('texture');

        texture.drawQuads(ctx);

        /*
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
        */
    }
});
