var sys = require('sys'),
    Texture2D = require('cocos2d/Texture2D').Texture2D,
    cocos = require('cocos2d'),
    geo = require('geometry'),
    ccp = geo.ccp;

var sceneIdx = -1;
var transitions = [
    "Sprite1",
    "SpriteAnchorPoint",
    "SpriteAnimationFlip"
];

var kTagTileMap = 1,
    kTagSpriteBatchNode = 1,
    kTagNode = 2,
    kTagAnimation1 = 1,
    kTagSpriteLeft = 2,
    kTagSpriteRight = 3;

function nextAction() {
    sceneIdx++;
    sceneIdx = sceneIdx % transitions.length;

    var r = transitions[sceneIdx];
    var c = eval('(' + r + ')');
    return c;
}
function backAction() {
    sceneIdx--;
    if (sceneIdx < 0) {
        sceneIdx += transitions.length;
    }

    var r = transitions[sceneIdx];
    var c = eval('(' + r + ')');
    return c;
}
function restartAction() {
    var r = transitions[sceneIdx];
    var c = eval('(' + r + ')');
    return c;
}

var SpriteDemo = cocos.Layer.extend({
    title: 'No title',
    subtitle: null,

    init: function() {
        @super;

        var s = cocos.Director.get('sharedDirector.winSize');

        var label = cocos.Label.create({string: this.get('title'), fontName: 'Arial', fontSize: 26});
        this.addChild({child: label, z:1});
        label.set('position', ccp(s.width / 2, 50));


        var subtitle = this.get('subtitle');
        if (subtitle) {
            var l = cocos.Label.create({string:subtitle, fontName: "Thonburi", fontSize: 16});
            this.addChild({child: l, z:1});
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
        var director = cocos.Director.get('sharedDirector');

        var scene = cocos.Scene.create();
        scene.addChild({child: restartAction().create()});

        director.replaceScene(scene);
    },

    backCallback: function() {
        var director = cocos.Director.get('sharedDirector');

        var scene = cocos.Scene.create();
        scene.addChild({child: backAction().create()});

        director.replaceScene(scene);
    },

    nextCallback: function() {
        var director = cocos.Director.get('sharedDirector');

        var scene = cocos.Scene.create();
        scene.addChild({child: nextAction().create()});

        director.replaceScene(scene);
    }
});

/**
 * @class
 *
 * Example Sprite 1
 */
var Sprite1 = SpriteDemo.extend(/** @scope Sprite1.prototype# */{
    title: 'Sprite (tap screen)',

    init: function() {
        @super;
        this.set('isMouseEnabled', true);

        var s = cocos.Director.get('sharedDirector.winSize');
        this.addNewSprite(ccp(s.width /2, s.height /2));
    },

    addNewSprite: function(point) {
        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx%5) * 85,
            y = (idx%3) * 121;

        //CCSprite *sprite = [CCSprite spriteWithFile:@"grossini_dance_atlas.png" rect:CGRectMake(x,y,85,121)];
        var sprite = cocos.Sprite.create({file: __dirname + "/resources/grossini_dance_atlas.png", rect:{origin:ccp(x, y), size:{width: 85, height: 121}}})
        this.addChild({child:sprite, z:0});
        sprite.set('position', ccp(point.x, point.y));

        var action, actionBack, seq;
        var rand = Math.random();

        if (rand < 0.2) {
            action = cocos.ScaleBy.create({duration:3, scale:2});
        } else if (rand < 0.4) {
            action = cocos.RotateBy.create({duration:3, angle:360});
        } else if (rand < 0.6) {
            action = cocos.ScaleBy.create({duration:3, scale:2});
            //action = cocos.Blink.create({duration:3, scale:2});
        } else if (rand < 0.8) {
            action = cocos.RotateBy.create({duration:3, angle:360});
            //action = cocos.TintBy.create({duration:3, scale:2});
        } else {
            action = cocos.ScaleBy.create({duration:3, scale:2});
            //action = cocos.FadeOut.create({duration:3, scale:2});
        }




        actionBack = action.reverse();
        seq = cocos.Sequence.create({actions:[action, actionBack]});
        sprite.runAction(cocos.RepeatForever.create(seq));
        
    },
    mouseUp: function(event) {

        var location = cocos.Director.get('sharedDirector').convertEventToCanvas(event);
        this.addNewSprite(location);

        return true;
    }
});



/**
 * @class
 *
 * Example Sprite Batch Node 1
 */
var SpriteBatchNode1 = SpriteDemo.extend(/** @scope SpriteBatchNode1.prototype# */{
    title: 'SpriteBatchNode (tap screen)',

    init: function() {
        @super;
        this.set('isMouseEnabled', true);

        var batch = cocos.BatchNode.create({file: __dirname + "/resources/grossini_dance_atlas.png", capcity: 50});
        this.addChild({child: batch, z: 0, tag: kTagSpriteBatchNode});

        var s = cocos.Director.get('sharedDirector.winSize');
        this.addNewSprite(ccp(s.width /2, s.height /2));
    },

    addNewSprite: function(point) {
        var batch = this.getChild({tag: kTagSpriteBatchNode});

        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx%5) * 85,
            y = (idx%3) * 121;

        var sprite = cocos.Sprite.create({textureAtlas: batch.get('textureAtlas'),
                                                  rect: {origin: ccp(x, y),
                                                           size: {width: 85, height: 121}}})
        batch.addChild({child:sprite});

        sprite.set('position', ccp(point.x, point.y));

        var action;
        var rand = Math.random();

        if (rand < 0.2) {
            action = cocos.ScaleBy.create({duration:3, scale:2});
        } else if (rand < 0.4) {
            action = cocos.RotateBy.create({duration:3, angle:360});
        } else if (rand < 0.6) {
            action = cocos.ScaleBy.create({duration:3, scale:2});
            //action = cocos.Blink.create({duration:3, scale:2});
        } else if (rand < 0.8) {
            action = cocos.RotateBy.create({duration:3, angle:360});
            //action = cocos.TintBy.create({duration:3, scale:2});
        } else {
            action = cocos.ScaleBy.create({duration:3, scale:2});
            //action = cocos.FadeOut.create({duration:3, scale:2});
        }



        var actionBack = action.reverse();
        var seq = cocos.Sequence.create({actions:[action, actionBack]});

        sprite.runAction(cocos.RepeatForever.create(seq));
    },
    mouseUp: function(event) {
        var location = cocos.Director.get('sharedDirector').convertEventToCanvas(event);
        this.addNewSprite(location);

        return true;
    }
});

/**
 * @class
 *
 * Example Sprite Animation and flip
 */
var SpriteAnimationFlip = SpriteDemo.extend(/** @scope SpriteAnimationFlip.prototype# */{
    title: 'Sprite Animation + Flip',

    init: function() {
        @super;

        var s = cocos.Director.get('sharedDirector.winSize');

        var texture = Texture2D.create({file: __dirname + "/resources/animations/dragon_animation.png"});

        var frame0 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132*0, 132*0, 132, 132)}),
            frame1 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132*1, 132*0, 132, 132)}),
            frame2 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132*2, 132*0, 132, 132)}),
            frame3 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132*3, 132*0, 132, 132)}),
            frame4 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132*0, 132*1, 132, 132)}),
            frame5 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132*1, 132*1, 132, 132)});


        var sprite = cocos.Sprite.create({frame: frame0});
        sprite.set('position', ccp(s.width/2 - 80, s.height/2));
        this.addChild(sprite);

        var animFrames = [
            frame0,
            frame1,
            frame2,
            frame3,
            frame4,
            frame5
        ];


        var animation = cocos.Animation.create({frames: animFrames, delay:0.2}),
            animate   = cocos.Animate.create({animation: animation, restoreOriginalFrame:false}),
            seq       = cocos.Sequence.create({actions: [animate,
                                                         cocos.FlipX.create({flipX: true}),
                                                         animate.copy(),
                                                         cocos.FlipX.create({flipX: false})]});

        sprite.runAction(cocos.RepeatForever.create(seq));
    }
});

/**
 * @class
 *
 * Example Sprite Anchor Point
 */
var SpriteAnchorPoint = SpriteDemo.extend(/** @scope SpriteAnchorPoint.prototype# */{
    title: 'Sprite Anchor Point',

    init: function() {
        @super;

        var s = cocos.Director.get('sharedDirector.winSize');

        var rotate = cocos.RotateBy.create({duration: 10, angle: 360});
        var action = cocos.RepeatForever.create(rotate);
        for (var i=0; i<3; i++) {
            var sprite = cocos.Sprite.create({file: __dirname + "/resources/grossini_dance_atlas.png", rect: geo.rectMake(85*i, 121*1, 85, 121)});
            sprite.position = ccp(s.width/4*(i+1), s.height/2);
            
            var point = cocos.Sprite.create({file: __dirname + "/resources/r1.png"});
            point.set('scale', 0.25);
            point.set('position', sprite.get('position'));
            this.addChild({child: point, z: 10});
            
            switch(i) {
                case 0:
                    sprite.set('anchorPoint', ccp(0, 0));
                    break;
                case 1:
                    sprite.set('anchorPoint', ccp(0.5, 0.5));
                    break;
                case 2:
                    sprite.set('anchorPoint', ccp(1, 1));
                    break;
            }
            
            point.set('position', sprite.get('position'));
            
            var copy = action.copy();
            sprite.runAction(copy);
            this.addChild({child: sprite, z: 1});
        }
    }
});
        

sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');

        director.attachInView(document.getElementById('cocos2d-tests'));

        var scene = cocos.Scene.create();
        scene.addChild({child: nextAction().create()});

        director.runWithScene(scene);
    }
}));
