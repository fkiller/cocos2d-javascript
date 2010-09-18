var sys = require('sys'),
    Obj = require('object').Object,
    ccp = require('geometry').ccp,
    Scheduler = require('./Scheduler').Scheduler,
    TouchDispatcher = require('./TouchDispatcher').TouchDispatcher,
    KeyboardDispatcher = require('./KeyboardDispatcher').KeyboardDispatcher,
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


        // Setup event handling

        // Mouse events
        var touchDispatcher = TouchDispatcher.get('sharedDispatcher');
        function mouseDown(evt) {
            var touch = {location: ccp(evt.offsetX, evt.offsetY)};

            function mouseMove(evt) {
                touch.location = ccp(evt.offsetX, evt.offsetY);

                touchDispatcher.touchesMoved({touches: [touch], event:evt});
            };
            function mouseUp(evt) {
                touch.location = ccp(evt.offsetX, evt.offsetY);

                document.body.removeEventListener('mousemove', mouseMove, false);
                document.body.removeEventListener('mouseup',   mouseUp,   false);


                touchDispatcher.touchesEnded({touches: [touch], event:evt});
            };

            document.body.addEventListener('mousemove', mouseMove, false);
            document.body.addEventListener('mouseup',   mouseUp,   false);

            touchDispatcher.touchesBegan({touches: [touch], event:evt});
        };
        canvas.addEventListener('mousedown', mouseDown, false);

        // Keyboard events
        var keyboardDispatcher = KeyboardDispatcher.get('sharedDispatcher');
        function keyDown(evt) {
            keyboardDispatcher.keyDown({event: evt})
        }
        function keyUp(evt) {
            keyboardDispatcher.keyUp({event: evt})
        }
        function keyPress(evt) {
            keyboardDispatcher.keyPress({event: evt})
        }
        document.documentElement.addEventListener('keydown', keyDown, false);
        document.documentElement.addEventListener('keyup', keyUp, false);
        document.documentElement.addEventListener('keypress', keyPress, false);
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
        var now = (new Date).getTime() /1000;

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

        this._runningScene.onEnter();
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
