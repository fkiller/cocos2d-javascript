var util = require('util'),
    path = require('path');

var modules = 'SpriteFrame SpriteFrameCache Director Animation AnimationCache Scheduler ActionManager TMXXMLParser'.w()

/**
 * @namespace All cocos2d objects live in this namespace
 */
var cocos = {
    nodes: require('./nodes'),
    actions: require('./actions')
};

util.each(modules, function(mod, i) {
    util.extend(cocos, require('./' + mod));
});

module.exports = cocos;
