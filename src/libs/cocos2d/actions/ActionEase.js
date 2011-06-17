/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    ActionInterval = require('./ActionInterval').ActionInterval,
    geo = require('geometry'),
    ccp = geo.ccp;

var ActionEase = ActionInterval.extend(/** @lends cocos.actions.ActionEase# */{
    other: null,
    
    /**
     * @class Base class for Easing actions
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionEase
     *
     * @opt {cocos.actions.ActionInterval} action
     */
    init: function(opts) {
        if (!opts.action) {
            throw "Ease: action argument must be non-nil";
        }
        ActionEase.superclass.init.call(this, {duration: opts.action.duration});
        
        this.other = opts.action;
    },
    
    startWithTarget: function(target) {
        ActionEase.superclass.startWithTarget.call(this, target);
        this.other.startWithTarget(this.target);
    },
    
    stop: function() {
        this.other.stop();
        ActionEase.superclass.stop.call(this);
    },
    /*
    update: function(t) {
        this.other.update(t);
    },
    */
    copy: function() {
        return ActionEase.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return ActionEase.create({action: this.other.reverse()});
    }
});

var EaseRate = ActionEase.extend(/** @lends cocos.actions.EaseRate# */{
    /**
     * rate value for the actions 
     * @type {Float} 
     */
    rate: 0,
    
    /**
    * @class EaseRate Base class for Easing actions with rate parameter
    *
    * @memberOf cocos.actions
    * @constructs
    * @extends cocos.actions.ActionEase
    *
    * @opt {cocos.actions.ActionInterval} action
    * @opt {Float} rate
    */
    init: function(opts) {
        EaseRate.superclass.init.call(this, opts);

        this.rate = opts.rate;
    },
    
    copy: function() {
        return EaseRate.create({action: this.other.copy(), rate: this.rate});
    },
    
    reverse: function() {
        return EaseRate.create({action: this.other.reverse(), rate: 1 / this.rate});
    }
});

var EaseIn = EaseRate.extend(/** @lends cocos.actions.EaseIn# */{
    /**
     * @class EaseIn EaseIn action with a rate
     */
    update: function(t) {
        this.other.update(Math.pow(t, this.rate));
    },
    
    copy: function() {
        return EaseIn.create({action: this.other.copy(), rate: this.rate});
    },
    
    reverse: function() {
        return EaseIn.create({action: this.other.reverse(), rate: 1 / this.rate});
    }
});

var EaseOut = EaseRate.extend(/** @lends cocos.actions.EaseOut# */{
    /**
     * @class EaseOut EaseOut action with a rate
     */
    update: function(t) {
        this.other.update(Math.pow(t, 1/this.rate));
    },
    
    copy: function() {
        return EaseOut.create({action: this.other.copy(), rate: this.rate});
    },
    
    reverse: function() {
        return EaseOut.create({action: this.other.reverse(), rate: 1 / this.rate});
    }
});

var EaseInOut = EaseRate.extend(/** @lends cocos.actions.EaseInOut# */{
    /**
     * @class EaseInOut EaseInOut action with a rate
     */
    update: function(t) {
        var sign = 1;
        var r = Math.floor(this.rate);
        if (r % 2 == 0) {
            sign = -1;
        }
        t *= 2;
        if (t < 1) {
            this.other.update(0.5 * Math.pow(t, this.rate));
        } else {
            this.other.update(sign * 0.5 * (Math.pow(t-2, this.rate) + sign * 2));
        }
    },
    
    copy: function() {
        return EaseInOut.create({action: this.other.copy(), rate: this.rate});
    },
    
    reverse: function() {
        return EaseInOut.create({action: this.other.reverse(), rate: this.rate});
    }
});

var EaseExponentialIn = ActionEase.extend(/** @lends cocos.actions.EaseExponentialIn# */{
    /**
     * @class EaseExponentialIn EaseExponentialIn action
     */
    update: function(t) {
        this.other.update((t == 0) ? 0 : (Math.pow(2, 10 * (t/1 - 1)) - 1 * 0.001));
    },
    
    copy: function() {
        return EaseExponentialIn.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseExponentialOut.create({action: this.other.reverse()});
    }
});

var EaseExponentialOut = ActionEase.extend(/** @lends cocos.actions.EaseExponentialOut# */{
    /**
     * @class EaseExponentialOut EaseExponentialOut action
     */
    update: function(t) {
        this.other.update((t == 1) ? 1 : (-Math.pow(2, -10 * t/1) + 1));
    },
    
    copy: function() {
        return EaseExponentialOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseExponentialIn.create({action: this.other.reverse()});
    }
});

var EaseExponentialInOut = ActionEase.extend(/** @lends cocos.actions.EaseExponentialInOut# */{
    /**
     * @class EaseExponentialInOut EaseExponentialInOut action
     */
    update: function(t) {
        t /= 0.5;
        if (t < 1) {
            t = 0.5 * Math.pow(2, 10 * (t - 1));
        } else {
            t = 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
        }
        this.other.update(t);
    },
    
    copy: function() {
        return EaseExponentialInOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return EaseExponentialInOut.create({action: this.other.reverse()});
    }
});

var EaseSineIn = ActionEase.extend(/** @lends cocos.actions.EaseSineIn# */{
    /**
     * @class EaseSineIn EaseSineIn action
     */
    update: function(t) {
        this.other.update(-1 * Math.cos(t * Math.PI_2) + 1);
    },
    
    copy: function() {
        return EaseSineIn.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseSineOut.create({action: this.other.reverse()});
    }
});

var EaseSineOut = ActionEase.extend(/** @lends cocos.actions.EaseSineOut# */{
    /**
     * @class EaseSineOut EaseSineOut action
     */
    update: function(t) {
        this.other.update(Math.sin(t * Math.PI_2));
    },
    
    copy: function() {
        return EaseSineOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseSineIn.create({action: this.other.reverse()});
    }
});

var EaseSineInOut = ActionEase.extend(/** @lends cocos.actions.EaseSineInOut# */{
    /**
     * @class EaseSineInOut EaseSineInOut action
     */
    update: function(t) {
        this.other.update(-0.5 * (Math.cos(t * Math.PI) - 1));
    },
    
    copy: function() {
        return EaseSineInOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return EaseSineInOut.create({action: this.other.reverse()});
    }
});

var EaseElastic = ActionEase.extend(/** @lends cocos.actions.EaseElastic# */{
    /**
    * period of the wave in radians. default is 0.3
    * @type {Float}
    */
    period: 0.3,

    /**
    * @class EaseElastic Ease Elastic abstract class
    *
    * @memberOf cocos.actions
    * @constructs
    * @extends cocos.actions.ActionEase
    *
    * @opt {cocos.actions.ActionInterval} action
    * @opt {Float} period
    */
    init: function(opts) {
        EaseElastic.superclass.init.call(this, {action: opts.action});

        if (opts.period !== undefined) {
            this.period = opts.period;
        }
    },

    copy: function() {
        return EaseElastic.create({action: this.other.copy(), period: this.period});
    },

    reverse: function() {
        window.console.warn("EaseElastic reverse(): Override me");
        return null;
    }
});

var EaseElasticIn = EaseElastic.extend(/** @lends cocos.actions.EaseElasticIn# */{
    /** 
     * @class EaseElasticIn Ease Elastic In action
     */
    update: function(t) {
        var newT = 0;
        if (t == 0 || t == 1) {
            newT = t;
        } else {
            var s = this.period / 4;
            t -= 1;
            newT = -Math.pow(2, 10 * t) * Math.sin((t - s) * Math.PI*2 / this.period);
        }
        this.other.update(newT);
    },
    
    // Wish we could use base class's copy
    copy: function() {
        return EaseElasticIn.create({action: this.other.copy(), period: this.period});
    },
    
    reverse: function() {
        return exports.EaseElasticOut.create({action: this.other.reverse(), period: this.period});
    }
});

var EaseElasticOut = EaseElastic.extend(/** @lends cocos.actions.EaseElasticOut# */{
    /** 
     * @class EaseElasticOut Ease Elastic Out action
     */
    update: function(t) {
        var newT = 0;
        if (t == 0 || t == 1) {
            newT = t;
        } else {
            var s = this.period / 4;
            newT = Math.pow(2, -10 * t) * Math.sin((t - s) * Math.PI*2 / this.period) + 1;
        }
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseElasticOut.create({action: this.other.copy(), period: this.period});
    },
    
    reverse: function() {
        return exports.EaseElasticIn.create({action: this.other.reverse(), period: this.period});
    }
});

var EaseElasticInOut = EaseElastic.extend(/** @lends cocos.actions.EaseElasticInOut# */{
    /** 
     * @class EaseElasticInOut Ease Elastic InOut action
     */
    update: function(t) {
        var newT = 0;
        if (t == 0 || t == 1) {
            newT = t;
        } else {
            t *= 2;
            if (this.period == 0) {
                this.period = 0.3 * 1.5;
            }
            var s = this.period / 4;
            
            t -= 1;
            if (t < 0) {
                newT = -0.5 * Math.pow(2, 10 * t) * Math.sin((t - s) * Math.PI*2 / this.period);
            } else {
                newT = Math.pow(2, -10 * t) * Math.sin((t - s) * Math.PI*2 / this.period) * 0.5 + 1;
            }
        }
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseElasticInOut.create({action: this.other.copy(), period: this.period});
    },
    
    reverse: function() {
        return EaseElasticInOut.create({action: this.other.reverse(), period: this.period});
    }
});

var EaseBounce = ActionEase.extend(/** @lends cocos.actions.EaseBounce# */{
    /** 
     * @class EaseBounce abstract class
     */
    bounceTime: function(t) {
        // Direct cut & paste from CCActionEase.m, obviously.
        // Glad someone else figured out all this math...
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        }
        else if (t < 2 / 2.75) {
            t -= 1.5 / 2.75;
            return 7.5625 * t * t + 0.75;
        }
        else if (t < 2.5 / 2.75) {
            t -= 2.25 / 2.75;
            return 7.5625 * t * t + 0.9375;
        }

        t -= 2.625 / 2.75;
        return 7.5625 * t * t + 0.984375;
    }
});

var EaseBounceIn = EaseBounce.extend(/** @lends cocos.actions.EaseBounceIn# */{
    /** 
     * @class EaseBounceIn EaseBounceIn action
     */
    update: function(t) {
        var newT = 1 - this.bounceTime(1-t);
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseBounceIn.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseBounceOut.create({action: this.other.reverse()});
    }
});

var EaseBounceOut = EaseBounce.extend(/** @lends cocos.actions.EaseBounceOut# */{
    /** 
     * @class EaseBounceOut EaseBounceOut action
     */
    update: function(t) {
        var newT = this.bounceTime(t);
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseBounceOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseBounceIn.create({action: this.other.reverse()});
    }
});

var EaseBounceInOut = EaseBounce.extend(/** @lends cocos.actions.EaseBounceInOut# */{
    /** 
     * @class EaseBounceInOut EaseBounceInOut action
     */
    update: function(t) {
        var newT = 0;
        if (t < 0.5) {
            t *= 2;
            newT = (1 - this.bounceTime(1 - t)) * 0.5;
        } else {
            newT = this.bounceTime(t * 2 - 1) * 0.5 + 0.5;
        }
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseBounceInOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return EaseBounceInOut.create({action: this.other.reverse()});
    }
});

var EaseBackIn = ActionEase.extend(/** @lends cocos.actions.EaseBackIn# */{
    /** 
     * @class EaseBackIn EaseBackIn action
     */
    update: function(t) {
        var overshoot = 1.70158;
        this.other.update(t * t * ((overshoot + 1) * t - overshoot));
    },
    
    copy: function() {
        return EaseBackIn.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseBackOut.create({action: this.other.reverse()});
    }
});

var EaseBackOut = ActionEase.extend(/** @lends cocos.actions.EaseBackOut# */{
    /** 
     * @class EaseBackOut EaseBackOut action
     */
    update: function(t) {
        var overshoot = 1.70158;
        t -= 1;
        this.other.update(t * t * ((overshoot + 1) * t + overshoot) + 1);
    },
    
    copy: function() {
        return EaseBackOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseBackIn.create({action: this.other.reverse()});
    }
});

var EaseBackInOut = ActionEase.extend(/** @lends cocos.actions.EaseBackInOut# */{
    /** 
     * @class EaseBackInOut EaseBackInOut action
     */
    update: function(t) {
        // Where do these constants come from?
        var overshoot = 1.70158 * 1.525;
        t *= 2;
        if (t < 1) {
            this.other.update((t * t * ((overshoot + 1) * t - overshoot)) / 2);
        } else {
            t -= 2;
            this.other.update((t * t * ((overshoot + 1) * t + overshoot)) / 2 + 1);
        }
    },
    
    copy: function() {
        return EaseBackInOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return EaseBackInOut.create({action: this.other.reverse()});
    }
});

exports.ActionEase = ActionEase;
exports.EaseRate = EaseRate;
exports.EaseIn = EaseIn;
exports.EaseOut = EaseOut;
exports.EaseInOut = EaseInOut;
exports.EaseExponentialIn = EaseExponentialIn;
exports.EaseExponentialOut = EaseExponentialOut;
exports.EaseExponentialInOut = EaseExponentialInOut;
exports.EaseSineIn = EaseSineIn;
exports.EaseSineOut = EaseSineOut;
exports.EaseSineInOut = EaseSineInOut;
exports.EaseElastic = EaseElastic;
exports.EaseElasticIn = EaseElasticIn;
exports.EaseElasticOut = EaseElasticOut;
exports.EaseElasticInOut = EaseElasticInOut;
exports.EaseBounce = EaseBounce;
exports.EaseBounceIn = EaseBounceIn;
exports.EaseBounceOut = EaseBounceOut;
exports.EaseBounceInOut = EaseBounceInOut;
exports.EaseBackIn = EaseBackIn;
exports.EaseBackOut = EaseBackOut;
exports.EaseBackInOut = EaseBackInOut;

