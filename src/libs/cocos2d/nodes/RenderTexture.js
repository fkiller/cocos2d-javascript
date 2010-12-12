var util = require('util'),
    event = require('event'),
    Node = require('./Node').Node,
    geo = require('geometry'),
    Sprite = require('./Sprite').Sprite,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    ccp = geo.ccp;

/** 
 * @class cocos.nodes.RenderTexture An in-memory canvas which can be drawn to in the background before drawing on screen
 * @extends cocos.nodes.Node
 *
 * @constructor
 * @namedparams
 * @param {Integer} width The width of the canvas
 * @param {Integer} height The height of the canvas
 */
var RenderTexture = Node.extend({
    canvas: null,
    context: null,
    sprite: null,

    init: function(opts) {
        @super;

        var width = opts['width'],
            height = opts['height'];

        event.addListener(this, 'contentsize_changed', util.callback(this, this._resizeCanvas));

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        var atlas = TextureAtlas.create({canvas: this.canvas});
        this.sprite = Sprite.create({textureAtlas: atlas, rect: {origin: ccp(0,0), size: {width: width, height: height}}});

        this.set('contentSize', geo.sizeMake(width, height));
        this.addChild(this.sprite);
        this.set('anchorPoint', ccp(0, 0));
        this.sprite.set('anchorPoint', ccp(0, 0));



    },

    _resizeCanvas: function() {
        var size = this.get('contentSize'),
            canvas = this.get('canvas');

        canvas.width  = size.width;
        canvas.height = size.height;

        var s = this.get('sprite');
        if (s) {
            s.set('rect', geo.rectMake(0, 0, size.width, size.height));
        }
    },

    clear: function() {
        this.canvas.width = this.canvas.width;
    }
});

module.exports.RenderTexture = RenderTexture;
