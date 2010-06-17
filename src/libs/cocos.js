var sys = require('sys');

exports = sys.mergeObjects(
    exports,
    require('cocos/AppDelegate'),
    require('cocos/Node'),
    require('cocos/Layer'),
    require('cocos/Scene'),
    require('cocos/Label'),
    require('cocos/Sprite'),
    require('cocos/Director')
);

