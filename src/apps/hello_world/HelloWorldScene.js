var sys = require('sys'),
    cocos = require('cocos'),
    ccp = require('geometry').ccp;

var HelloWorld = cocos.Layer.extend({
    label: null,
    sprite: null,

    init: function() {
        @super;

        var label = this.set('label', cocos.Label.create({string: 'Hello, World', fontName: 'Marker Felt', fontSize: 64}));
        var size = cocos.Director.get('sharedDirector.winSize');
        label.set('position', ccp(size.width / 2, size.height / 2));
        this.addChild(label);


        var sprite = this.set('sprite', cocos.Sprite.create(@base64('resources/firefox-icon.png')));
        var size = cocos.Director.get('sharedDirector.winSize');
        sprite.set('position', ccp(100, 100));
        this.addChild(sprite);

        var sprite = this.set('sprite', cocos.Sprite.create(@base64('resources/firefox-icon.png')));
        var size = cocos.Director.get('sharedDirector.winSize');
        sprite.set('position', ccp(200, 200));
        sprite.set('scale', 2);
        this.addChild(sprite);

        var sprite = this.set('sprite', cocos.Sprite.create(@base64('resources/firefox-icon.png')));
        var size = cocos.Director.get('sharedDirector.winSize');
        sprite.set('position', ccp(300, 200));
        this.addChild(sprite);
        sprite.set('scale', 0.5);
    },

    draw: function(context) {
    },
    visit: function() {
        @super;

        var r = this.get('label.rotation');

        sys.each(this._children, sys.callback(this, function(obj) {
            obj.set('rotation', r + 0.1);
        }));
    }
});

HelloWorld.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

exports.HelloWorld = HelloWorld;
