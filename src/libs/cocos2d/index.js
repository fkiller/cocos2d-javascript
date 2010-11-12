var sys = require('sys'),
    path = require('path');

var modules = 'Node Layer Scene Label Sprite SpriteFrame Director Action IntervalAction Animation Scheduler ActionManager TMXTiledMap TMXXMLParser BatchNode SpriteSheet RenderTexture Menu MenuItem AppDelegate KeyboardDispatcher'.split(' ');

/** @namespace */
var cocos = {};

sys.each(modules, function(mod, i) {
    sys.extend(cocos, require('./' + mod));
});

module.exports = cocos;
