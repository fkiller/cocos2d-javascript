var sys = require('sys'),
	SpriteSheet = require('./SpriteSheet').SpriteSheet;
	Node = require('./Node').Node;

var TMXLayer = SpriteSheet.extend({
	layerSize: null,
	layerName: '',
	tiles: null,
	tilset: null,
	layerOrientation: 0,
	mapTileSize: null,
	properties: null,

	init: function(opts) {
		var tilesetInfo = opts['tilesetInfo'],
			layerInfo = opts['layerInfo'],
			mapInfo = opts['mapInfo'];

		var size = layerInfo.get('layerSize'),
			totalNumberOfTiles = size.width * size.height;

		var tex = null;
		if (tilesetInfo) {
			tex = resource(tilesetInfo.sourceImage);
		}

		@super({texture: tex});

	},

	setupTiles: function() {
		// TODO
	}
});

exports.TMXLayer = TMXLayer;
