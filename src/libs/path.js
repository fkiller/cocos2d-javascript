exports.dirname = function(path) {
	var tokens = path.split('/');
	tokens.pop();
	return tokens.join('/');
};

exports.join = function() {
	var tokens = [];
	for (var i = 0; i < arguments.length; i++) {
		var path = arguments[i];
		tokens = tokens.concat(path.split('/'));
	};
	return tokens.join('/');
};
