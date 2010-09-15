var sys = require('sys');

exports = sys.merge(
    exports,
    require('cocos/Node'),
    require('cocos/Layer'),
    require('cocos/Scene'),
    require('cocos/Label'),
    require('cocos/Sprite'),
    require('cocos/Director'),
    require('cocos/Action'),
    require('cocos/IntervalAction'),
    require('cocos/Scheduler'),
    require('cocos/ActionManager'),
    require('cocos/TMXTiledMap'),
    require('cocos/TMXXMLParser'),
    require('cocos/SpriteSheet'),
    require('cocos/RenderTexture'),
    require('cocos/Menu'),
    require('cocos/MenuItem'),
    require('cocos/KeyboardDispatcher'),
    require('cocos/TouchDispatcher'),
    require('cocos/TouchHandler'),

    require('cocos/AppDelegate')
);

