/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node   = require('./Node').Node,
    util   = require('util'),
    geo    = require('geometry'),
    events = require('events');

var ProgressBar = Node.extend(/** @lends cocos.nodes.ProgressBar# */{
	maxValue: 100,
	value: 0,

	/**
	 * @memberOf cocos.nodes
	 * @extends cocos.nodes.Node
	 * @constructs
	 */
	init: function (opts) {
		ProgressBar.superclass.init.call(this, opts);
	},

	draw: function (ctx) {
		var size = this.get('contentSize'),
			value = this.get('value'),
			maxValue = this.get('maxValue');


		// Outline
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, size.width, size.height);
		ctx.fillStyle = '#000000';
		ctx.fillRect(3, 3, size.width - 6, size.height - 6);
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(6, 6, (size.width - 12) * (value / maxValue), size.height - 12);
	}
});

exports.ProgressBar = ProgressBar;
