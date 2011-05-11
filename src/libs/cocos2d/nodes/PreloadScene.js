/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Scene       = require('./Scene').Scene,
    Director    = require('../Director').Director,
    Label       = require('./Label').Label,
    ProgressBar = require('./ProgressBar').ProgressBar,
    Preloader   = require('../Preloader').Preloader,
    RemoteResource = require('../RemoteResource').RemoteResource,
    geo         = require('geometry'),
    util        = require('util'),
    events      = require('events');

var PreloadScene = Scene.extend(/** @lends cocos.nodes.PreloadScene# */{
    progressBar: null,
    label: null,
    preloader: null,
    isReady: false, // True when both progress bar images have loaded
    emptyImage: "/__builtin__/libs/cocos2d/resources/progress-bar-empty.png",
    fullImage:  "/__builtin__/libs/cocos2d/resources/progress-bar-full.png",

    /**
     * @memberOf cocos.nodes
     * @extends cocos.nodes.Scene
     * @constructs
     */
    init: function (opts) {
        PreloadScene.superclass.init.call(this, opts);
        var size = Director.get('sharedDirector').get('winSize');

        // Setup 'please wait' label
        var label = Label.create({
            fontSize: 14,
            fontName: 'Helvetica',
            fontColor: '#ffffff',
            string: 'Please wait...'
        });
        label.set('position', new geo.Point(size.width / 2, (size.height / 2) + 32));
        this.set('label', label);
        this.addChild({child: label});

        // Setup preloader
        var preloader = Preloader.create();
        this.set('preloader', preloader);
        var self = this;

        // Listen for preload events
        events.addListener(preloader, 'load', function (uri, preloader) {
            var loaded = preloader.get('loaded'),
                count = preloader.get('count');
            //console.log("Loaded: %d%% -- %d of %d -- %s", (loaded / count) * 100, loaded, count, uri);
            events.trigger(self, 'load', uri, preloader);
        });

        events.addListener(preloader, 'complete', function (preloader) {
            events.trigger(self, 'complete', preloader);
        });


        // Load the images used by the progress bar
        var emptyImage = resource(this.get('emptyImage')),
            fullImage  = resource(this.get('fullImage'));


        var loaded = 0;
        function imageLoaded() {
            if (loaded == 2) {
                this.isReady = true;
                this.createProgressBar();
                if (this.get('isRunning')) {
                    preloader.load();
                }
            }
        }

        if (emptyImage instanceof RemoteResource) {
            events.addListener(emptyImage, 'load', util.callback(this, function() {
                loaded++;
                imageLoaded.call(this);
            }));
            emptyImage.load();
        } else {
            loaded++;
            imageLoaded.call(this);
        }
        if (fullImage instanceof RemoteResource) {
            events.addListener(fullImage, 'load', util.callback(this, function() {
                loaded++;
                imageLoaded.call(this);
            }));
            fullImage.load();
        } else {
            loaded++;
            imageLoaded.call(this);
        }

    },

    createProgressBar: function () {
        var preloader = this.get('preloader'),
            size = Director.get('sharedDirector').get('winSize');

        var progressBar = ProgressBar.create({
            emptyImage: "/__builtin__/libs/cocos2d/resources/progress-bar-empty.png",
            fullImage:  "/__builtin__/libs/cocos2d/resources/progress-bar-full.png"
        });

        progressBar.set('position', new geo.Point(size.width / 2, size.height / 2));

        this.set('progressBar', progressBar);
        this.addChild({child: progressBar});

        progressBar.bindTo('maxValue', preloader, 'count');
        progressBar.bindTo('value',    preloader, 'loaded');
    },

    onEnter: function () {
        PreloadScene.superclass.onEnter.call(this);
        var preloader = this.get('preloader');

        // Preload everything
        if (this.isReady) {
            preloader.load();
        }
    }
});

exports.PreloadScene = PreloadScene;
