var util = require('util'),
    Plist = require('Plist').Plist;

var AnimationCache = BObject.extend(/** @lends cocos.AnimationCache# */{
    /**
     * Cached animations
     * @type Object
     */
    animations: null,

    /**
     * @memberOf cocos
     * @extends BObject
     * @constructs
     */
    init: function() {
        @super;

        this.set('animations', {});
    },

    addAnimation: function(opts) {
        var name = opts['name'],
            animation = opts['animation'];

        this.get('animations')[name] = animation;
    },

    removeAnimation: function(opts) {
        var name = opts['name'];

        delete this.get('animations')[name];
    },

    getAnimation: function(opts) {
        var name = opts['name'];

        return this.get('animations')[name];
    }
});

/**
 * Class methods
 */
util.extend(AnimationCache, /** @lends cocos.AnimationCache */{
    /**
     * @field
     * @name cocos.AnimationCache.sharedAnimationCache
     * @type cocos.AnimationCache
     */
    get_sharedAnimationCache: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.AnimationCache = AnimationCache;
