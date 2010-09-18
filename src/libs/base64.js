/**
 * Thin wrapper around JXG's Base64 utils
 */

var JXG = require('JXGUtil');

exports.decode = function(input) {
	return JXG.Util.Base64.decode(input);
};
exports.decodeAsArray = function(input, bytes) {
	var bytes = bytes || 1;

	var dec = JXG.Util.Base64.decode(input),
		ar = [], i, j, len;
	for (i = 0, len = dec.length/bytes; i < len; i++){
		ar[i] = 0;
		for (j = bytes-1; j >= 0; --j){
			ar[i] += dec.charCodeAt((i *bytes) +j) << j;
		}
	}
	return ar;
};

exports.encode = function(input) {
	return JXG.Util.Base64.encode(input);
};
