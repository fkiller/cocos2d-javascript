CC.Director = CC.Object.extend({
    canvas: null,
    context: null,
    sceneStack: null,
    winSize: null,

    _nextScene:null,

    init: function() {
        this.set('sceneStack', []);
    },

    attachInView: function(view) {
        if (!view.tagName) {
            throw "CC.Director.attachInView must be given a HTML DOM Node";
        }

        while (view.firstChild) {
            view.removeChild(view.firstChild);
        }

        var canvas = this.set('canvas', document.createElement('canvas'));
        canvas.setAttribute('width', view.clientWidth);
        canvas.setAttribute('height', view.clientHeight);

        this.set('context', canvas.getContext('2d'));

        view.appendChild(canvas);

        this.set('winSize', {width: view.clientWidth, height: view.clientHeight});
    },
    runWithScene: function(scene) {
        if (!(scene instanceof CC.Scene)) {
            throw "CC.Director.runWithScene must be given an instance of CC.Scene";
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
        this._animationTimer = setInterval(CC.callback(this, 'mainLoop'), animationInterval * 1000);
    },

    mainLoop: function() {
        var context = this.get('context');
        context.clearRect(0, 0, this.winSize.width, this.winSize.height);

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
CC.extend(CC.Director, {
    sharedDirector: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});
