var util = require('util'),
    path = require('path');

var modules = 'Node Layer Scene Label Sprite TMXTiledMap BatchNode RenderTexture Menu MenuItem'.w()

/** 
 * @memberOf cocos
 * @namespace All cocos2d nodes. i.e. anything that can be added to a Scene
 */
var nodes = {};

util.each(modules, function(mod, i) {
    util.extend(nodes, require('./' + mod));
});

module.exports = nodes;
