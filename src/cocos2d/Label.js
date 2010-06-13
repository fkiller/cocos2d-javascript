CC.Label = CC.Node.extend({
    string:   '',
    fontName: 'Helvetica',
    fontSize: 16,
    fontColor: 'black',

    init: function(args) {
        @super;

        this.set('fontSize', args.fontSize);
        this.set('fontName', args.fontName);
        this.set('string', args.string);
    },

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

    _updateLabelContentSize: function() {
        var ctx = CC.Director.get('sharedDirector.context');
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
