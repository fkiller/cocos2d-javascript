var sys = require('sys'),
    console = require('system').console,
    Director = require('./Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

/** @member cocos
 * @class
 *
 * Renders a text label
 *
 * @extends cocos.Node
 */
var Label = Node.extend(/** @scope cocos.Label# */{
    string:   '',
    fontName: 'Helvetica',
    fontSize: 16,
    fontColor: 'white',

    /** @ignore */
    init: function(args) {
        @super;

        sys.each('fontSize fontName fontColor string'.w(), sys.callback(this, function(name) {
            if (args[name]) {
                this.set(name, args[name]);
            }
        }));
    },

    /** @field
     * The font to use
     * @type String
     */
    font: function(key) {
        return this.get('fontSize') + 'px ' + this.get('fontName');
    }.property(),

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
        var ctx = Director.get('sharedDirector.context');
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

        console.log(size.width, size.height);
    }.observes('string', 'fontName', 'fontSize')
});

module.exports.Label = Label;
