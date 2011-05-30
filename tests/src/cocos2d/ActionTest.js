/* module exports resource require*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util      = require('util'),
    Texture2D = require('cocos2d/Texture2D').Texture2D,
    Scheduler = require('cocos2d/Scheduler').Scheduler,
    cocos     = require('cocos2d'),
    events    = require('events'),
    nodes     = cocos.nodes,
    actions   = cocos.actions,
    geo       = require('geometry'),
    ccp       = geo.ccp;

var sceneIdx = -1;
var transitions = [
/*
    "Manual",
    "Move",
    "Jump",
    "Spawn", 
    "Reverse",
    "Delay",
    */
    "Repeat" /*,
    "RepeatForever",
    "ReverseSequence",
    "Speed"
    */
];

var tests = {};

var kTagSprite1 = 1,
    kTagSprite2 = 2,
    kTagSprite3 = 3;

var kTagAction1 = 1,
    kTagAction2 = 2,
    kTagSlider = 1;
    
function nextAction() {
    sceneIdx++;
    sceneIdx = sceneIdx % transitions.length;

    var r = transitions[sceneIdx];
    return tests[r];
}
function backAction() {
    sceneIdx--;
    if (sceneIdx < 0) {
        sceneIdx += transitions.length;
    }

    var r = transitions[sceneIdx];
    return tests[r];
}
function restartAction() {
    var r = transitions[sceneIdx];
    return tests[r];
}

var ActionDemo = nodes.Layer.extend({
    title: 'No title',
    subtitle: null,

    init: function () {
        ActionDemo.superclass.init.call(this);
        
        this.set('isMouseEnabled', true);
        var s = cocos.Director.get('sharedDirector').get('winSize');

        var label = nodes.Label.create({string: this.get('title'), fontName: 'Arial', fontSize: 26});
        this.addChild({child: label, z: 1});
        label.set('position', ccp(s.width / 2, s.height - 50));


        var subtitle = this.get('subtitle');
        if (subtitle) {
            var l = nodes.Label.create({string: subtitle, fontName: "Thonburi", fontSize: 16});
            this.addChild({child: l, z: 1});
            l.set('position', ccp(s.width / 2, s.height - 80));
        }


        var item1 = nodes.MenuItemImage.create({normalImage: module.dirname + "/resources/b1.png", selectedImage: module.dirname + "/resources/b2.png", callback: util.callback(this, 'backCallback')});
        var item2 = nodes.MenuItemImage.create({normalImage: module.dirname + "/resources/r1.png", selectedImage: module.dirname + "/resources/r2.png", callback: util.callback(this, 'restartCallback')});
        var item3 = nodes.MenuItemImage.create({normalImage: module.dirname + "/resources/f1.png", selectedImage: module.dirname + "/resources/f2.png", callback: util.callback(this, 'nextCallback')});

        var menu = nodes.Menu.create({items: [item1, item2, item3]});

        menu.set('position', ccp(0, 0));
        item1.set('position', ccp(s.width / 2 - 100, 30));
        item2.set('position', ccp(s.width / 2, 30));
        item3.set('position', ccp(s.width / 2 + 100, 30));
        this.addChild({child: menu, z: 1});
    },

    restartCallback: function () {
        var director = cocos.Director.get('sharedDirector');

        var scene = nodes.Scene.create();
        scene.addChild({child: restartAction().create()});

        director.replaceScene(scene);
    },

    backCallback: function () {
        var director = cocos.Director.get('sharedDirector');

        var scene = nodes.Scene.create();
        scene.addChild({child: backAction().create()});

        director.replaceScene(scene);
    },

    nextCallback: function () {
        var director = cocos.Director.get('sharedDirector');

        var scene = nodes.Scene.create();
        scene.addChild({child: nextAction().create()});

        director.replaceScene(scene);
    },
    
    addNewSprite: function (point, tag) {
        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx % 5) * 85,
            y = (idx % 3) * 121;

        var sprite = nodes.Sprite.create({file: module.dirname + "/resources/grossini_dance_atlas.png", rect: new geo.Rect(x, y, 85, 121)});
        this.addChild({child: sprite, z: 0, tag: tag});
        sprite.set('position', ccp(point.x, point.y));

		return sprite;
    }
});

/**
 * @class
 *
 * Example Jump Action
 */
tests.Jump = ActionDemo.extend(/** @lends Jump.prototype# */{
    title: 'JumpTo / JumpBy',
    subtitle: '',

    init: function () {
        tests.Jump.superclass.init.call(this);
        
        var s = cocos.Director.get('sharedDirector').get('winSize');
        
        this.addNewSprite(ccp(s.width/2, s.height/2), kTagSprite1);
		this.addNewSprite(ccp(s.width/2, s.height/2), kTagSprite2);
		this.addNewSprite(ccp(s.width/2, s.height/2), kTagSprite3);
    },

	onEnter: function() {
		tests.Jump.superclass.onEnter.call(this);
		
		var action, actionBack, seq;
        var rand = Math.random();
		
		var s = cocos.Director.get('sharedDirector').get('winSize');
		
       	var action1 = actions.JumpTo.create({duration: 2, delta: ccp(s.width/2, 300), height: 50, jumps: 4});
		var action2 = actions.JumpBy.create({duration: 2, delta: ccp(300, 0), height: 50, jumps: 4});
		var action3 = actions.JumpBy.create({duration: 2, delta: ccp(0, 0), height: 80, jumps: 4});
        actionBack = action2.reverse();
        
		this.getChild({tag: kTagSprite1}).runAction(action1);
		this.getChild({tag: kTagSprite2}).runAction(actions.Sequence.create({actions: [action2, actionBack]}));
		this.getChild({tag: kTagSprite3}).runAction(actions.RepeatForever.create(action3));
	}
});

/**
 * @class
 *
 * Example Spawn Action
 */
tests.Spawn = ActionDemo.extend(/** @lends Spawn.prototype# */{
    title: 'Spawn: Jump + Rotate',
    subtitle: '',
    
    onEnter: function() {
        tests.Sequence2.superclass.onEnter.call(this);
        
        this.alignSpritesLeft(1);
        
        var action = actions.Sequence.create({actions: [
            actions.Place.create({position: ccp(200, 200)}),
            actions.MoveBy.create({duration: 1, position: ccp(100, 0)}),
            actions.CallFunc.create({target: this, method: 'callback1'}),
            actions.CallFunc.create({target: this, method: 'callback2'}),
            actions.CallFunc.create({target: this, method: 'callback3'})
            ]});
        this.get('grossini').runAction(action);
    },
    
    callback1: function(target) {
        var s = cocos.Director.get('sharedDirector').get('winSize');
        var label = cocos.nodes.Label.create({string: "callback 1 called", fontName: 'Marker Felt', fontSize: 16});
        label.set('position', ccp(s.width / 4, s.height / 2));
        this.addChild({child: label});
    },
    
    callback2: function(target) {
>>>>>>> Stashed changes
        var s = cocos.Director.get('sharedDirector').get('winSize');
        
        this.addNewSprite(ccp(0, s.height/2), kTagSprite1);
    },
    
    onEnter: function() {
        tests.Spawn.superclass.onEnter.call(this);
        
        var action = actions.Spawn.initWithActions({actions: [
            actions.JumpBy.create({duration: 2, delta: ccp(300, 0), height: 50, jumps: 4}),
            actions.RotateBy.create({duration: 2, angle: 720})
            ]});
        this.getChild({tag: kTagSprite1}).runAction(action);
    }
});

/**
 * @class
 *
 * Example Reverse Action
 */
tests.Reverse = ActionDemo.extend(/** @lends Reverse.prototype# */{
    title: 'Reverse an action',
    subtitle: '',
    
    onEnter: function() {
        tests.Reverse.superclass.onEnter.call(this);
        
        this.alignSpritesLeft(1);
        
        var jump = actions.JumpBy.create({duration: 2, delta: ccp(300, 0), height: 50, jumps: 4});
        var action = actions.Sequence.create({actions: [jump, jump.reverse()]});

        this.get('grossini').runAction(action);
    }
});

/**
 * @class
 *
 * Example Delay Action
 */
tests.Delay = ActionDemo.extend(/** @lends Delay.prototype# */{
    title: 'DelayTime: m + delay + m',
    subtitle: '',
    
    onEnter: function() {
        tests.Delay.superclass.onEnter.call(this);
        
        this.alignSpritesLeft(1);
        
        var move = actions.MoveBy.create({duration: 1, position: ccp(150, 0)});
        var action = actions.Sequence.create({actions: [move,
            actions.DelayTime.create({duration: 2}),
            move]});

        this.get('grossini').runAction(action);
    }
});

/**
 * @class
 *
 * Example ReverseSequence Action
 */
tests.ReverseSequence = ActionDemo.extend(/** @lends ReverseSequence.prototype# */{
    title: 'Reverse a sequence',
    subtitle: '',
    
    onEnter: function() {
        tests.ReverseSequence.superclass.onEnter.call(this);
        
        this.alignSpritesLeft(1);
        
        var move1 = actions.MoveBy.create({duration: 1, position: ccp(250, 0)});
        var move2 = actions.MoveBy.create({duration: 1, position: ccp(0, 50)});
        var seq = actions.Sequence.create({actions: [move1, move2, move1.reverse()]});
        var action = actions.Sequence.create({actions: [seq, seq.reverse()]});

        this.get('grossini').runAction(action);
    }
});

/**
 * @class
 *
 * Example Repeat Action
 */
tests.Repeat = ActionDemo.extend(/** @lends Repeat.prototype# */{
    title: 'Repeat / RepeatForever actions',
    subtitle: '',
    
    onEnter: function() {
        tests.Repeat.superclass.onEnter.call(this);
        
        this.alignSpritesLeft(2);
        
        var a1 = actions.MoveBy.create({duration: 1, position: ccp(150, 0)});
        var action1 = actions.Repeat.create({action: actions.Sequence.create({actions: [
            a1,
            actions.Place.create({position: ccp(60, 60)})
            ]}), 
            times: 3});
            /*
        var action2 = actions.RepeatForever.create(actions.Sequence.create({actions: [
            a1.copy(), a1.reverse()
            ]}));
        */
        this.get('kathia').runAction(action1);
        //this.get('tamara').runAction(action2);
    }
});

/**
 * @class
 *
 * Example RepeatForever Action
>>>>>>> Stashed changes
 */
tests.Speed = ActionDemo.extend(/** @lends Speed.prototype# */{
    title: 'Speed',
    subtitle: '',
    
    init: function() {
        tests.Speed.superclass.init.call(this);
        
        var s = cocos.Director.get('sharedDirector').get('winSize');
        
        this.addNewSprite(ccp(0, s.height/2), kTagSprite1);
		this.addNewSprite(ccp(0, s.height/2), kTagSprite2);
		this.addNewSprite(ccp(0, s.height/2), kTagSprite3);
    },
    
    onEnter: function() {
        tests.Speed.superclass.onEnter.call(this);
    
        var s = cocos.Director.get('sharedDirector').get('winSize');
        // rotate and jump
        var jump1 = actions.JumpBy.create({duration: 4, delta: ccp(-s.width+80, 0), height: 100, jumps: 4});
        var jump2 = jump1.reverse();
        var rot1 = actions.RotateBy.create({duration: 4, angle: 720});
        var rot2 = rot1.reverse();
        
        var seq3_1 = actions.Sequence.create({actions: [jump2, jump1]});
        var seq3_2 = actions.Sequence.create({actions: [rot1, rot2]});
        var spawn = actions.Spawn.create({one: seq3_1, two: seq3_2});
        var action = actions.Speed.create({action: actions.RepeatForever.create(spawn), speed: 1.0});
        action.set('tag', kTagAction1);
        
        var action2 = action.copy();
        var action3 = action.copy();
        action2.set('tag', kTagAction1);
        action3.set('tag', kTagAction1);
        
		this.getChild({tag: kTagSprite1}).runAction(action2);
		this.getChild({tag: kTagSprite2}).runAction(action3);
		this.getChild({tag: kTagSprite3}).runAction(action);
		
	    Scheduler.get('sharedScheduler').schedule({target: this, method: 'update', interval: 1.0, paused: !this.get('isRunning')});
    },
    
    update: function(t) {
        var action1 = this.getChild({tag: kTagSprite1}).getAction({tag: kTagAction1});
        var action2 = this.getChild({tag: kTagSprite2}).getAction({tag: kTagAction1});
        var action3 = this.getChild({tag: kTagSprite3}).getAction({tag: kTagAction1});
        
        action1.setSpeed(Math.random() * 2);
        action2.setSpeed(Math.random() * 2);
        action3.setSpeed(Math.random() * 2);
    }
});

exports.main = function () {
    // Initialise test
    var director = cocos.Director.get('sharedDirector');

    director.attachInView(document.getElementById('cocos2d-tests'));
    director.set('displayFPS', true);

    events.addListener(director, 'ready', function (director) {
        var scene = nodes.Scene.create();
        scene.addChild({child: nextAction().create()});
        director.replaceScene(scene);
    });

    director.runPreloadScene();
};
