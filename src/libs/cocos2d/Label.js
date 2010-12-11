var util = require('util'),
    console = require('system').console,
    Director = require('./Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

/**
 * @class cocos.Label Renders a simple text label
 * @extends cocos.Node
 *
 * @constructor
 * @namedparams
 * @param {Float} fontSize (Optional) The size of the font
 * @param {String} fontName (Optional) The name of the font to use
 * @param {String} fontColor (Optional) The color of the text
 * @param {String} string The text string to draw
 */
var Label = Node.extend({
    string:   '',
    fontName: 'Helvetica',
    fontSize: 16,
    fontColor: 'white',

    init: function(args) {
        @super;

        util.each('fontSize fontName fontColor string'.w(), util.callback(this, function(name) {
            // Set property on init
            if (args[name]) {
                this.set(name, args[name]);
            }

            // Update content size
            this._updateLabelContentSize();
        }));
    },

    /** 
     * @property font The font to use
     * @type String
     */
    get_font: function(key) {
        return this.get('fontSize') + 'px ' + this.get('fontName');
    },

    draw: function(context) {
        context.fillStyle = this.get('fontColor');
        context.font = this.get('font');
        context.textBaseline = 'top';
        if (context.fillText) {
            context.fillText(this.get('string'), 0, 0);
        } else if (context.mozDrawText) {
            context.mozDrawText(this.get('string'));
        }
    },

    /**
     * @private
     */
    _updateLabelContentSize: function() {
        var ctx = Director.get('sharedDirector').get('context');
        var size = {width: 0, height: this.get('fontSize')};

        var prevFont = ctx.font;
        ctx.font = this.get('font');

        if (ctx.measureText) {
            var txtSize = ctx.measureText(this.get('string'));
            size.width = txtSize.width;
        } else if (ctx.mozMeasureText) {
            size.width = ctx.mozMeasureText(this.get('string'));
        }

        ctx.font = prevFont;

        this.set('contentSize', size);
    }
});

module.exports.Label = Label;
