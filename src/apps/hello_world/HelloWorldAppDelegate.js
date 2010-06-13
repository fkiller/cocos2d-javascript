@require 'HelloWorldScene.js';

var HelloWorldAppDelegate = CC.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = CC.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(HelloWorld.get('scene'));
    }
});
