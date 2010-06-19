var sys    = require('sys'),
    cocos  = require('cocos'),
    ccp    = require('geometry').ccp;

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


        var tmx = cocos.TMXTiledMap.create(__dirname + "/resources/TileMaps/orthogonal-test2.tmx");

        console.log(tmx);
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
