var sys    = require('sys'),
    cocos  = require('cocos'),
    ccp    = require('geometry').ccp;


var kTagSpriteSheet = 1;

var SpriteSheetTestDemo = cocos.Layer.extend({
    title: 'SpriteSheet Test',
    subtitle: '',
    sheet: null,

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


        var sheet = this.set('sheet', cocos.SpriteSheet.create({file: __dirname + "/resources/grossini_dance_atlas.png"}));
        this.addChild({child: sheet, z:0, tag:kTagSpriteSheet});

        this.addNewSprite(ccp(s.width /2, s.height /2));
    },

    addNewSprite: function(point) {
        var sheet = this.get('sheet');

        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx%5) * 85,
            y = (idx%3) * 121;

        var sprite = cocos.Sprite.create({texture: sheet.get('texture'), rect:{origin:ccp(x, y), size:{width: 85, height: 121}}})
        sheet.addChild(sprite);
        sprite.set('position', ccp(point.x, point.y));



        var action, actionBack, seq;

        action = cocos.ScaleBy.create({duration:3, scale:2});
        actionBack = action.reverse();
        seq = cocos.Sequence.create({actions:[action, actionBack]});
        sprite.runAction(cocos.RepeatForever.create(seq));
    }

});

SpriteSheetTestDemo.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(SpriteSheetTestDemo.get('scene'));
    }
}));
