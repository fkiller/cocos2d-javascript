var sys = require('sys'),
    cocos = require('cocos'),
    ccp = require('geometry').ccp;

var HelloWorld = cocos.Layer.extend({
    init: function() {
        @super;

        var label = cocos.Label.create({string: 'Hello, World', fontName: 'Marker Felt', fontSize: 64});

        var size = cocos.Director.get('sharedDirector.winSize');
        label.set('position', ccp(size.width / 2, size.height / 2));
        this.addChild(label);
    }
});

HelloWorld.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

exports.HelloWorld = HelloWorld;
