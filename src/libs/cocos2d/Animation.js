var util = require('util');

/** 
 * @class cocos.Animation
 * @extends BObject
 *
 * <p>A Animation object is used to perform animations on the Sprite objects.
 * 
 * The Animation object contains SpriteFrame objects, and a possible delay between the frames.
 * You can animate a Animation object by using the Animate action. Example:</p>
 * 
 *  <pre>sprite.runAction(Animate.create({animation: animation}));</pre>
 * 
 */
var Animation = BObject.extend({
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
