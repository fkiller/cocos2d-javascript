var util = require('util'),
    path = require('path');

var modules = 'Action ActionInterval ActionInstant'.w();

/**
 * @memberOf cocos
 * @namespace Actions used to animate or change a Node
 */
var actions = {};

util.each(modules, function(mod, i) {
    util.extend(actions, require('./' + mod));
});

module.exports = actions;
