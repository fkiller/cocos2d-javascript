/**
 * Thin wrapper around JXG's GZip utils
 */

var JXG = require('JXGUtil');

exports.unzip = function(input) {
	return (new JXG.Util.Unzip(input)).unzip()[0][0]
};
exports.unzipBase64 = function(input) {
	return (new JXG.Util.Unzip(JXG.Util.Base64.decodeAsArray(input))).unzip()[0][0]
};
exports.unzipBase64AsArray = function(input) {
	var dec = this.unzipBase64(input),
		ar = [], i;
	for (i=0;i<dec.length;i++){
		ar[i]=dec.charCodeAt(i);
	}
	return ar;
};
exports.unzipAsArray = function (input){
	var dec = this.unzip(input),
		ar = [], i;
	for (i=0;i<dec.length;i++){
		ar[i]=dec.charCodeAt(i);
	}
	return ar;
};

