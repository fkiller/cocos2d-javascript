var sys = require('sys'),
    Director = require('./Director').Director,
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

/** @member cocos
 * @class
 */
var Sprite = Node.extend(/** @scope cocos.Sprite# */{
    texture: null,
    rect: null,
    dirty: true,
    recursiveDirty: true,
    quad: null,

    /** 
     * @param {String} opts.file Path to image to use as sprite atlas
     * @param {Rect} opts.rect The rect in the sprite atlas image file to use as the sprite
     */
    init: function(opts) {
        @super;

        var file = opts['file'],
            texture = opts['texture'],
            spritesheet = opts['spritesheet'],
            rect = opts['rect'];

        if (file) {
            texture = TextureAtlas.create({file:file});
        } else if (spritesheet) {
            texture = spritesheet.get('textureAtlas');
            this.set('useSpriteSheet', true);
        } else if (!texture && !file) {
            //throw "Sprite has no texture or file";
        }

        if (!rect && texture) {
            rect = {origin: ccp(0,0), size:{width: texture.texture.size.width, height: texture.texture.size.height}};
        }

        if (rect) {
            this.set('rect', rect);
            this.set('contentSize', rect.size);
        }

        this.quad = {
            drawRect: {origin: ccp(0, 0), size: rect.size},
            textureRect: rect
        };

        this.set('textureAtlas', texture);
    },

    _updateTextureQuad: function(obj, key, texture, oldTexture) {
        if (oldTexture) {
            oldTexture.removeQuad({quad: this.get('quad')})
        }

        if (texture) {
            texture.insertQuad({quad: this.get('quad')});
        }
    }.observes('textureAtlas'),

    _updateQuad: function() {
        if (!this.quad) {
            return;
        }

        this.quad.drawRect.size = {width: this.rect.size.width, height: this.rect.size.height};
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


        // TextureAtlas has hard reference to this quad so we can just update it directly
        this.quad.drawRect.origin = {
            x: this.position.x - this.anchorPointInPixels.x * this.scaleX,
            y: this.position.y - this.anchorPointInPixels.y * this.scaleY
        }
        this.quad.drawRect.size = {
            width: this.rect.size.width * this.scaleX,
            height: this.rect.size.height * this.scaleY
        }

        this.set('dirty', false);
        this.set('recursiveDirty', false);
    },

    draw: function(ctx) {
        this.get('textureAtlas').drawQuad(ctx, this.quad);
    }
});

module.exports.Sprite = Sprite;
