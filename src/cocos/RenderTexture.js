var sys = require('sys'),
    Node = require('./Node').Node,
    Sprite = require('./Sprite').Sprite,
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
    ccp = require('geometry').ccp;

exports.RenderTexture = Node.extend({
    canvas: null,
    context: null,
    sprite: null,

    init: function(opts) {
        @super;

        var width = opts['width'],
            height = opts['height'];

        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');

        var atlas = TextureAtlas.create({canvas: this.canvas});
        this.sprite = Sprite.create({texture: atlas, rect: {origin: ccp(0,0), size: {width: width, height: height}}});

        this.addChild(this.sprite);
    }
});
