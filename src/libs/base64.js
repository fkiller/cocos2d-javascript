/**
 * Thin wrapper around JXG's Base64 utils
 */

var JXG = require('JXGUtil');

exports.decode = function(input) {
	return JXG.Util.Base64.decode(input);
};
exports.decodeAsArray = function(input) {
	return JXG.Util.Base64.decodeAsArray(input);
};

exports.encode = function(input) {
	return JXG.Util.Base64.encode(input);
};
