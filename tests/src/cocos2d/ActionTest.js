/* module exports resource require*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util      = require('util'),
    Texture2D = require('cocos2d/Texture2D').Texture2D,
    cocos     = require('cocos2d'),
    events    = require('events'),
    nodes     = cocos.nodes,
    actions   = cocos.actions,
    geo       = require('geometry'),
    ccp       = geo.ccp;

var sceneIdx = -1;
var transitions = [
    "Jump"
];

var tests = {};

var kTagSprite1 = 1,
    kTagSprite2 = 2,
    kTagSprite3 = 3;

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

        this.set('isMouseEnabled', true);

        var s = cocos.Director.get('sharedDirector').get('winSize');
        this.addNewSprite(ccp(s.width / 2, s.height / 2));
    },

    addNewSprite: function (point) {
        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx % 5) * 85,
            y = (idx % 3) * 121;

        var sprite = nodes.Sprite.create({file: module.dirname + "/resources/grossini_dance_atlas.png", rect: new geo.Rect(x, y, 85, 121)});
        this.addChild({child: sprite, z: 0});
        sprite.set('position', ccp(point.x, point.y));

		return sprite;
    },

	onEnter: function() {
		tests.Jump.superclass.onEnter.call(this);
		
		var action, actionBack, seq;
        var rand = Math.random();
		
		var s = cocos.Director.get('sharedDirector').get('winSize');
		
       	var action1 = actions.JumpTo.create({duration: 2, delta: ccp(300, 300), height: 50, jumps: 4});
		var action2 = actions.JumpBy.create({duration: 2, delta: ccp(300, 0), height: 50, jumps: 4});
		var action3 = actions.JumpBy.create({duration: 2, delta: ccp(0, 0), height: 80, jumps: 4});
        actionBack = action2.reverse();

		var s1 = this.addNewSprite(ccp(s.width/2, s.height/2));
		var s2 = this.addNewSprite(ccp(s.width/2, s.height/2));
		var s3 = this.addNewSprite(ccp(s.width/2, s.height/2));
        
		s1.runAction(action1);
		s2.runAction(actions.Sequence.create({actions: [action2, actionBack]}));
		s3.runAction(actions.RepeatForever.create(action3));
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
