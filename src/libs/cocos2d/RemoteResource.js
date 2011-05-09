/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    events = require('events');

var RemoteResource = BObject.extend(/** @lends cocos.RemoteResource# */{
    /**
     * The URL to the remote resource
     * @type String
     */
    url: null,

    /**
     * The path used to reference the resource in the app
     * @type String
     */
    path: null,

    /**
     * @memberOf cocos
     * @extends BObject
     * @constructs
     */
    init: function (opts) {
        RemoteResource.superclass.init.call(this, opts);

        this.set('url', opts.url);
        this.set('path', opts.path);
        
    },

    /**
     * Load the remote resource via ajax
     */
    load: function () {
        var xhr = new XMLHttpRequest();
        var self = this;
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var path = self.get('path');

                var r = __remote_resources__[path];
                __resources__[path] = util.copy(r);
                __resources__[path].data = xhr.responseText;
                __resources__[path].meta.remote = true;

                events.trigger(self, 'load', self);
            }
        };

        xhr.open('GET', this.get('url'), true);  
        xhr.send(null);
    }
});


exports.RemoteResource = RemoteResource;
