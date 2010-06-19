var sys = require('sys'),
	Node = require('./Node').Node,
	TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
	TMXOrientationHex = require('./TMXOrientation').TMXOrientationHex,
	TMXOrientationIso = require('./TMXOrientation').TMXOrientationIso,
	TMXMapInfo = require('./TMXXMLParser').TMXMapInfo;

var TMXTiledMap = Node.extend({
	init: function(tmxFile) {
		@super;

		var mapInfo = TMXMapInfo.create(tmxFile);
		console.log('MapInfo:', mapInfo);
	}
});

exports.TMXTiledMap = TMXTiledMap;

