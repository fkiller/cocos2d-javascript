var util = require('util'),
    path = require('path');

var modules = 'Node Layer Scene Label Sprite TMXTiledMap BatchNode RenderTexture Menu MenuItem'.w()

var nodes = {};

util.each(modules, function(mod, i) {
    util.extend(nodes, require('./' + mod));
});

module.exports = nodes;
