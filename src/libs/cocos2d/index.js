var util = require('util'),
    path = require('path');

var modules = ('Node Layer Scene Label Sprite SpriteFrame Director Action ' +
               'ActionInterval Animation Scheduler ActionManager TMXTiledMap ' +
               'TMXXMLParser BatchNode RenderTexture Menu ' +
               'MenuItem ActionInstant').split(' ');

/** @namespace */
var cocos = {};

util.each(modules, function(mod, i) {
    util.extend(cocos, require('./' + mod));
});

module.exports = cocos;
