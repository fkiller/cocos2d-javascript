exports.dirname = function(path) {
	var tokens = path.split('/');
	tokens.pop();
	return tokens.join('/');
};

exports.join = function() {
	var tokens = [];
	for (var i = 0; i < arguments.length; i++) {
		var path = arguments[i].split('/');
		// Loop path rather than concat so we can skip empty components
		for (var j = 0; j < path.length; j++) {
			if (path[j] != '') {
				tokens.push(path[j]);
			}
		};
	};
	return tokens.join('/');
};
