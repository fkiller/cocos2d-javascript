var util = require('util'),
    Node = require('./Node').Node,
    geo = require('geometry'),
    Sprite = require('./Sprite').Sprite,
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
    ccp = geo.ccp;

/** @member cocos
 * @class
 *
 * @extends cocos.Node
 */
var RenderTexture = Node.extend(/** @scope cocos.RenderTexture# */{
    canvas: null,
    context: null,
    sprite: null,

    init: function(opts) {
        @super;

        var width = opts['width'],
            height = opts['height'];


        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        var atlas = TextureAtlas.create({canvas: this.canvas});
        this.sprite = Sprite.create({textureAtlas: atlas, rect: {origin: ccp(0,0), size: {width: width, height: height}}});

        this.set('contentSize', geo.sizeMake(width, height));
        this.addChild(this.sprite);
        this.set('anchorPoint', ccp(0, 0));
        this.sprite.set('anchorPoint', ccp(0, 0));
    },

    _resizeCanvas: function(obj, key, size) {
        this.canvas.width = size.width;
        this.canvas.height = size.height;
        if (this.sprite) {
            this.sprite.set('rect', geo.rectMake(0, 0, size.width, size.height));
        }
    }.observes('contentSize'),

    clear: function() {
        this.canvas.width = this.canvas.width;
    }
});

module.exports.RenderTexture = RenderTexture;
