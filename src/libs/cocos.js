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

    require('cocos/AppDelegate')
);

