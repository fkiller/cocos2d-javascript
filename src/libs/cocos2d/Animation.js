var sys = require('sys'),
    Thing = require('thing').Thing;

/** @member cocos
 * @class
 *
 * A Animation object is used to perform animations on the Sprite objects.
 * 
 * The Animation object contains SpriteFrame objects, and a possible delay between the frames.
 * You can animate a Animation object by using the Animate action. Example:
 * 
 *  sprite.runAction(Animate.create({animation: animation}));
 * 
 */
var Animation = Thing.extend(/** @scope cocos.Animation# */{
    name: null,
    delay: 0.0,
    frames: null,

    init: function(opts) {
        @super;

        this.frames = opts['frames'] || [];
        this.delay  = opts['delay']  || 0.0;
    }
});

exports.Animation = Animation;
