var sys = require('sys'),
    cocos = require('cocos'),
    ccp = require('geometry').ccp;

var SpriteDemo = cocos.Layer.extend({
    title: 'Sprite Test',
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


		var item1 = cocos.MenuItemImage.create({normalImage:__dirname + "/resources/b1.png", selectedImage:__dirname + "/resources/b2.png", callback:sys.callback(this, 'backCallback')});
		var item2 = cocos.MenuItemImage.create({normalImage:__dirname + "/resources/r1.png", selectedImage:__dirname + "/resources/r2.png", callback:sys.callback(this, 'restartCallback')});
		var item3 = cocos.MenuItemImage.create({normalImage:__dirname + "/resources/f1.png", selectedImage:__dirname + "/resources/f2.png", callback:sys.callback(this, 'nextCallback')});

        var menu = cocos.Menu.create({items: [item1, item2, item3]});
        menu.set('position', ccp(0,0));
        item1.set('position', ccp(s.width /2 -100, s.height -60));
        item2.set('position', ccp(s.width /2,      s.height -60));
        item3.set('position', ccp(s.width /2 +100, s.height -60));

        this.addChild({child: menu, z:1});
        
    }
});

SpriteDemo.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(SpriteDemo.get('scene'));
    }
}));
