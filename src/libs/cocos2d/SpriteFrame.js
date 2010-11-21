var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    Thing = require('thing').Thing;

/** @member cocos
 * @class
 *
 *  A SpriteFrame has:
 *  - texture: A Texture2D that will be used by the Sprite
 *  - rectangle: A rectangle of the texture
 *
 * You can modify the frame of a Sprite by doing:
 * 
 *  var frame = SpriteFrame.create({texture:texture rect:rect offset:offset});
 *  sprite.set('displayFrame', frame);
 */
var SpriteFrame = Thing.extend(/** @scope cocos.SpriteFrame# */{
    rect: null,
    rotated: false,
    offset: null,
    originalSize: null,
    texture: null,

    init: function(opts) {
        @super;

        this.texture      = opts['texture'];
        this.rect         = opts['rect'];
        this.rotated      = !!opts['rotate'];
        this.offset       = opts['offset'] || ccp(0, 0);
        this.originalSize = opts['originalSize'] || util.copy(this.rect.size);
    },

    toString: function() {
        return "[object SpriteFrame | TextureName=" + this.texture.get('name') + ", Rect = (" + this.rect.origin.x + ", " + this.rect.origin.y + ", " + this.rect.size.width + ", " + this.rect.size.height + ")]";
    },

    copy: function() {
        return SpriteFrame.create({rect: this.rect, rotated: this.rotated, offset: this.offset, originalSize: this.originalSize, texture: this.texture});
    }

});

exports.SpriteFrame = SpriteFrame;
