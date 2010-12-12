var util = require('util'),
    path = require('path');

var modules = 'Action ActionInterval ActionInstant'.w();

var cocos = {};

util.each(modules, function(mod, i) {
    util.extend(cocos, require('./' + mod));
});

module.exports = cocos;
