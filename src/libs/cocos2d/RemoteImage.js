/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    events = require('events');

var RemoteImage = BObject.extend(/** @lends RemoteImage# */{
    url: null,

    /**
     * @extends BObject
     * @constructs
     */
    init: function (opts) {
        RemoteImage.superclass.init.call(this);
        this.set('url', opts.url);
    },

    loadImage: function () {
        var img = new Image();
        var self = this;
        img.onload = function () {
            var url = self.get('url');

            var r = __remote_resources__[url];
            __resources__[url] = util.copy(r);
            __resources__[url].data = img;

            events.trigger(self, 'load', self);
        };
        
        img.src = 'resources' + this.url;

        return img;
    }
});

exports.RemoteImage = RemoteImage;
