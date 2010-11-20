var sys = require('sys'),
    path = require('path');

var modules = ('Node Layer Scene Label Sprite SpriteFrame Director Action ' +
               'ActionInterval Animation Scheduler ActionManager TMXTiledMap ' +
               'TMXXMLParser BatchNode RenderTexture Menu ' +
               'MenuItem AppDelegate KeyboardDispatcher ActionInstant').split(' ');

/** @namespace */
var cocos = {};

sys.each(modules, function(mod, i) {
    sys.extend(cocos, require('./' + mod));
});

module.exports = cocos;
