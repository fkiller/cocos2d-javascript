var sys    = require('sys'),
    cocos  = require('cocos'),
    path   = require('path'),
    ccp    = require('geometry').ccp;

var r = 0.0;
var TileMapTestDemo = cocos.Layer.extend({
    title: 'Tile Map Test',
    subtitle: '',

    init: function() {
        @super;

        var s = cocos.Director.get('sharedDirector.winSize');
        var label = cocos.Label.create({string: this.get('title'), fontName: 'Arial', fontSize: 32});
        this.addChild(label);
        label.set('position', ccp(s.width / 2, 50));


        var subtitle = this.get('subtitle');
        if (subtitle) {
            var l = cocos.Label.create({string:subtitle, fontName: "Thonburi", fontSize: 16});
            this.addChild(l);
            l.set('position', ccp(s.width/2, 80));
        }


        var tmx = cocos.TMXTiledMap.create({file: path.join(__dirname, "/resources/TileMaps/orthogonal-test2.tmx")});
        tmx.set('anchorPoint', ccp(0, 0));
        tmx.set('position', ccp(0, 0));

        var rt = cocos.RenderTexture.create({width: tmx.mapSize.width * tmx.tileSize.width, height: tmx.mapSize.height * tmx.tileSize.height});
        rt.set('position', ccp(Math.round(s.width/2), Math.round(s.height/2)));

        rt.set('scale', 0.25);
        tmx.visit(rt.context);

        this.addChild(rt);

        var action, actionBack, seq;
        action = cocos.ScaleBy.create({duration:3, scale:2});
        actionBack = action.reverse();
        seq = cocos.Sequence.create({actions:[action, actionBack]});
        rt.runAction(cocos.RepeatForever.create(seq));

        console.log('Tilemap: ', tmx);
    },

});

TileMapTestDemo.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(TileMapTestDemo.get('scene'));
    }
}));
