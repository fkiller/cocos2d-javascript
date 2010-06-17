var cocos = require('cocos'),
    HelloWorld = require('./HelloWorldScene').HelloWorld;

exports.HelloWorldAppDelegate = cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(HelloWorld.get('scene'));
    }
});

