var HelloWorld = CC.Layer.extend({
    label: null,

    init: function() {
        @super;
        var label = this.set('label', CC.Label.create({string: 'Hello, World', fontName: 'Marker Felt', fontSize: 64}));
        var size = CC.Director.get('sharedDirector.winSize');
        label.set('position', ccp(size.width / 2, size.height / 2));
        this.addChild(label);
    },

    draw: function(context) {
    },
    visit: function() {
        @super;

        var r = this.get('label.rotation');

        this.get('label').set('rotation', r + 0.1);
    }
});

HelloWorld.scene = function(key, val) {
    var scene = CC.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();
