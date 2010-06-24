exports.ccp = function(x, y) {
    return exports.pointMake(x, y);
};

PointZero = function() {
    return ccp(0,0);
};

exports.rectMake = function(x, y, w, h) {
    return {origin: exports.pointMake(x, y), size: exports.sizeMake(w, h)};
};

exports.sizeMake = function(w, h) {
    return {width: w, height: h};
};

exports.pointMake = function(x, y) {
    return {x: x, y: y};
};
