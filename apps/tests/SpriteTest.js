var sys = require('sys'),
    cocos = require('cocos'),
    ccp = require('geometry').ccp;

var SpriteDemo = cocos.Layer.extend({
    title: 'No title',
    subtitle: null,

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
        item1.set('position', ccp(s.width /2 -100, s.height -30));
        item2.set('position', ccp(s.width /2,      s.height -30));
        item3.set('position', ccp(s.width /2 +100, s.height -30));

        this.addChild({child: menu, z:1});
        
	},

	restartCallback: function() {
	},

	backCallback: function() {
	},

	nextCallback: function() {
	}
});

SpriteDemo.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();


var Sprite1 = SpriteDemo.extend({
	title: 'Sprite (tap screen)',

	init: function() {
		@super;
		this.set('isTouchEnabled', true);

        var s = cocos.Director.get('sharedDirector.winSize');
        this.addNewSprite(ccp(s.width /2, s.height /2));
	},

	addNewSprite: function(point) {
        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx%5) * 85,
            y = (idx%3) * 121;

        //CCSprite *sprite = [CCSprite spriteWithFile:@"grossini_dance_atlas.png" rect:CGRectMake(x,y,85,121)];
        var sprite = cocos.Sprite.create({file: __dirname + "/resources/grossini_dance_atlas.png", rect:{origin:ccp(x, y), size:{width: 85, height: 121}}})
        this.addChild(sprite);
        sprite.set('position', ccp(point.x, point.y));

        var action, actionBack, seq;

        action = cocos.ScaleBy.create({duration:3, scale:2});
        actionBack = action.reverse();
        seq = cocos.Sequence.create({actions:[action, actionBack]});
        sprite.runAction(cocos.RepeatForever.create(seq));
        
        /*
        id action;
        float rand = CCRANDOM_0_1();
        
        if( rand < 0.20 )
            action = [CCScaleBy actionWithDuration:3 scale:2];
        else if(rand < 0.40)
            action = [CCRotateBy actionWithDuration:3 angle:360];
        else if( rand < 0.60)
            action = [CCBlink actionWithDuration:1 blinks:3];
        else if( rand < 0.8 )
            action = [CCTintBy actionWithDuration:2 red:0 green:-255 blue:-255];
        else 
            action = [CCFadeOut actionWithDuration:2];
        id action_back = [action reverse];
        id seq = [CCSequence actions:action, action_back, nil];
        
        [sprite runAction: [CCRepeatForever actionWithAction:seq]];
        */
	}
});













sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(Sprite1.get('scene'));
    }
}));
