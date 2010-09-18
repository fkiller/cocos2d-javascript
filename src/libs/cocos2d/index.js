var sys = require('sys')
    path = require('path');

var modules = 'Node Layer Scene Label Sprite Director Action IntervalAction Scheduler ActionManager TMXTiledMap TMXXMLParser SpriteSheet RenderTexture Menu MenuItem AppDelegate'.split(' ');

sys.each(modules, function(mod, i) {
    //exports[mod] = require('./' + mod);
    module.exports = sys.merge(module.exports, require('./' + mod));
});
