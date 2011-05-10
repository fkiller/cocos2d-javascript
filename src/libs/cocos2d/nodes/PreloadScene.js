/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Scene       = require('./Scene').Scene,
    Director    = require('../Director').Director,
    Label       = require('./Label').Label,
    ProgressBar = require('./ProgressBar').ProgressBar,
    Preloader   = require('../Preloader').Preloader,
    geo         = require('geometry'),
    events      = require('events');

var PreloadScene = Scene.extend(/** @lends cocos.nodes.PreloadScene# */{
    progressBar: null,
    label: null,

    /**
     * @memberOf cocos.nodes
     * @extends cocos.nodes.Scene
     * @constructs
     */
    init: function (opts) {
        PreloadScene.superclass.init.call(this, opts);

        var pb = ProgressBar.create();
        this.set('progressBar', pb);
        this.addChild({child: pb});

        var label = Label.create({
            fontSize: 14,
            fontName: 'Helvetica',
            fontColor: '#ffffff',
            string: 'Please wait...'
        });
        this.set('label', label);
        this.addChild({child: label});
    },

    onEnter: function () {
        PreloadScene.superclass.onEnter.call(this);
        var size = Director.get('sharedDirector').get('winSize'),
            preloader = Preloader.create(),
            progressBar = this.get('progressBar'),
            label = this.get('label');

        // Position and size label and progress bar
        label.set('position', new geo.Point(size.width / 2, (size.height / 2) + 32));
        progressBar.set('position', new geo.Point(size.width / 2, size.height / 2));
        progressBar.set('contentSize', new geo.Size(size.width / 2, 32));





        progressBar.bindTo('maxValue', preloader, 'count');
        progressBar.bindTo('value',    preloader, 'loaded');

        var self = this;
        events.addListener(preloader, 'load', function (uri, preloader) {
            var loaded = preloader.get('loaded'),
                count = preloader.get('count');
            console.log("Loaded: %d%% -- %d of %d -- %s", (loaded / count) * 100, loaded, count, uri);

            events.trigger(self, 'load', uri, preloader);
        });

        events.addListener(preloader, 'complete', function (preloader) {
            events.trigger(self, 'complete', preloader);
        });

        preloader.load();
    }
});

exports.PreloadScene = PreloadScene;
