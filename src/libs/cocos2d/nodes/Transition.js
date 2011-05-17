/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var geo = require('geometry'), 
	actions = require('../actions'),
	Scene = require('./Scene').Scene,
	Director = require('../Director').Director,
	EventDispatcher = require('../EventDispatcher').EventDispatcher,
	Scheduler = require('../Scheduler').Scheduler;

	var tOrientation = {
		kOrientationLeftOver: 0,
		kOrientationRightOver: 1,
		kOrientationUpOver: 0,
		kOrientationDownOver: 1
	};

/** Base class for CCTransition scenes
 */
var TransitionScene = Scene.extend(/** @lends cocos.nodes.TransitionScene */{
	/* Incoming scene */
	inScene: null,
	
	/* Outgoing (current) scene */
	outScene: null,
	
	/* transition duration
	 * Float
	 */
	duration: null,
	
	inSceneOnTop: null,
	sendCleanupToScene: null,
	
	/** initializes a transition with duration and incoming scene */
	init: function(opts) {
		TransitionScene.superclass.init.call(this, opts);
		
		this.set('duration', opts.duration);		
		if (!opts.scene) {
			throw "TransitionScene requires scene property";
		}
		this.set('inScene', opts.scene);
		this.set('outScene', Director.get('sharedDirector')._runningScene);
		
		if (this.inScene == this.outScene) {
			throw "Incoming scene must be different from the outgoing scene";
		}
		EventDispatcher.get('sharedDispatcher').set('dispatchEvents', false);
		this.sceneOrder();
	},
	
	sceneOrder: function() {
		this.set('inSceneOnTop', true);
	},
	
	draw: function(context, rect) {
		if (this.get('inSceneOnTop')) {
			this.get('outScene').visit(context, rect);
			this.get('inScene').visit(context, rect);
		} else {
			this.get('inScene').visit(context, rect);
			this.get('outScene').visit(context, rect);
		}
	},
	
	/** called after the transition finishes */
	finish: function() {
		var is = this.get('inScene'), 
			os = this.get('outScene');
		
		is.set('visible', true);
		is.set('position', geo.PointZero());
		is.set('scale', 1.0);
		is.set('rotation', 0);
		
		os.set('visible', false);
		os.set('position', geo.PointZero());
		os.set('scale', 1.0);
		os.set('rotation', 0);
		
		Scheduler.get('sharedScheduler').schedule({target: this, method: this.setNewScene, interval: 0});
	},
	
	setNewScene: function(dt) {
		var dir = Director.get('sharedDirector');
		
		// Save 'send cleanup to scene' for some reason..
		// Not sure if it's cool to be accessing all these Director privates like this...
		this.set('sendCleanupToScene', dir._sendCleanupToScene);
		dir.replaceScene(this.get('inScene'));
		EventDispatcher.get('sharedDispatcher').set('dispatchEvents', true);
		
		// issue #267 
		this.get('outScene').set('visible', true);
	},
	
	/** used by some transitions to hide the outter scene */
	hideOutShowIn: function() {
		this.get('inScene').set('visible', true);
		this.get('outScene').set('visible', false);
	},
	
	/** custom onEnter */
	onEnter: function() {
		TransitionScene.superclass.onEnter.call(this);
		this.get('inScene').onEnter();
		// outScene_ should not receive the onEnter callback
	},
	
	/** custom onExit */
	onExit: function() {
		TransitionScene.superclass.onExit.call(this);
		this.get('outScene').onExit();
		// inScene_ should not receive the onExit callback
		// only the onEnterTransitionDidFinish
		if (this.get('inScene').onEnterTransitionDidFinish) {
			this.get('inScene').onEnterTransitionDidFinish();
		}
	},
	
	// custom cleanup
	cleanup: function() {
		TransitionScene.superclass.cleanup.call(this);
		
		if (this.get('sendCleanupToScene')) {
			this.get('outScene').cleanup();
		}
	}
});

/** TransitionSlideInL:
 Slide in the incoming scene from the left border.
 */
var TransitionSlideInL = TransitionScene.extend(/** @lends cocos.nodes.TransitionSlideInL */{
	onEnter: function() {
		TransitionSlideInL.superclass.onEnter.call(this);
		
		var s = Director.get('sharedDirector').get('winSize');
		
		this.initScenes();
		
		var movein = actions.MoveBy.create({
			position: geo.ccp(-s.width, 0),
			duration: this.get('duration')
		});
		var moveout = actions.MoveBy.create({
			position: geo.ccp(-s.width, 0),
			duration: this.get('duration')
		});
		var outAction = actions.Sequence.create({actions: [
			moveout, 
			actions.CallFunc.create({target: this, method: this.finish})
		]});
		this.get('inScene').runAction(movein);
		this.get('outScene').runAction(outAction);
	},
	
	sceneOrder: function() {
		this.set('inSceneOnTop', false);
	},
	
	initScenes: function() {
		var s = Director.get('sharedDirector').get('winSize');
		this.get('inScene').set('position', geo.ccp(-s.width, 0));
	}
});


exports.TransitionScene = TransitionScene;
exports.TransitionSlideInL = TransitionSlideInL;