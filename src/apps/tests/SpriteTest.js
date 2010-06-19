var sys = require('sys'),
    cocos = require('cocos'),
    ccp = require('geometry').ccp;

var SpriteTestDemo = cocos.Layer.extend({
    title: 'Sprite Test',
    subtitle: 'Click to add more',

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
        sprite.runAction(seq);
        //sprite.runAction(action);
        
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

SpriteTestDemo.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(SpriteTestDemo.get('scene'));
    }
}));
