var sys = require('sys'),
    Obj = require('object').Object,
    Scheduler = require('./Scheduler').Scheduler,
    Scene = require('./Scene').Scene;

var Director = Obj.extend({
    canvas: null,
    context: null,
    sceneStack: null,
    winSize: null,
    isPaused: false,

    // Time delta
    dt: 0,
    nextDeltaTimeZero: false,
    lastUpdate: 0,

    _nextScene:null,

    init: function() {
        this.set('sceneStack', []);
    },

    attachInView: function(view) {
        if (!view.tagName) {
            throw "Director.attachInView must be given a HTML DOM Node";
        }

        while (view.firstChild) {
            view.removeChild(view.firstChild);
        }

        var canvas = this.set('canvas', document.createElement('canvas'));
        canvas.setAttribute('width', view.clientWidth);
        canvas.setAttribute('height', view.clientHeight);

        var context = this.set('context', canvas.getContext('2d'));

        view.appendChild(canvas);

        this.set('winSize', {width: view.clientWidth, height: view.clientHeight});

        // Move origin to bottom left
        //context.translate(0, view.clientHeight);
    },
    runWithScene: function(scene) {
        if (!(scene instanceof Scene)) {
            throw "Director.runWithScene must be given an instance of Scene";
        }

        this.pushScene(scene);
        this.startAnimation();
    },

    replaceScene: function(scene) {
    },

    popScene: function(scene) {
    },

    pushScene: function(scene) {
        this._nextScene = scene;
    },

    startAnimation: function() {
        animationInterval = 1.0/30;
        this._animationTimer = setInterval(sys.callback(this, 'mainLoop'), animationInterval * 1000);
    },

    calculateDeltaTime: function() {
        var now = (new Date).getTime();

        if (this.nextDeltaTimeZero) {
            this.dt = 0;
            this.nextDeltaTimeZero = false;
        }

        this.dt = Math.max(0, now - this.lastUpdate);

        this.lastUpdate = now;
    },

    mainLoop: function() {
        this.calculateDeltaTime();

        if (!this.isPaused) {
            Scheduler.get('sharedScheduler').tick(this.dt);
        }


        var context = this.get('context');
        context.fillStyle = 'rgb(0, 0, 0)';
        context.fillRect(0, 0, this.winSize.width, this.winSize.height);

        if (this._nextScene) {
            this.setNextScene();
        }

        this._runningScene.visit(context);

        this.displayFPS();
    },

    setNextScene: function() {
        // TODO tranistions

        this._runningScene = this._nextScene;

        this._nextScene = null;
    },

    displayFPS: function() {
    }

});

/**
 * Class methods
 */
sys.extend(Director, {
    sharedDirector: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.Director = Director;
