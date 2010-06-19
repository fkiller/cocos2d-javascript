var sys = require('sys'),
	ccp = require('geometry').ccp,
    base64 = require('base64'),
    gzip   = require('gzip'),
	TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
	TMXOrientationHex = require('./TMXOrientation').TMXOrientationHex,
	TMXOrientationIso = require('./TMXOrientation').TMXOrientationIso,
	Obj = require('object').Object;

var TMXMapInfo = Obj.extend({
	filename: '',
	orientation: 0,
	mapSize: null,
	tileSize: null,
	layer: null,
	tilesets: null,
	objectGroups: null,
	properties: null,
	tileProperties: null,

	init: function(tmxFile) {
		this.tilesets = [];
		this.layers = [];
		this.objectGroups = [];
		this.properties = {};
		this.tileProperties = {};

		this.parseXMLFile(tmxFile);
	},

	parseXMLFile: function(xmlFile) {
		var parser = new DOMParser();
		doc = parser.parseFromString(resource(xmlFile), 'text/xml');

		var map = doc.documentElement;

		// Set Orientation
		switch (map.getAttribute('orientation')) {
		case 'orthogonal':
			this.orientation = TMXOrientationOrtho;
			break;
		/*
		case 'isometric':
			this.orientation = TMXOrientationIso;
			break;
		case 'hexagonal':
			this.orientation = TMXOrientationHex;
			break;
		*/
		default:
			throw "cocos2d: TMXFomat: Unsupported orientation: " + map.getAttribute('orientation');
		}

		// Set map site
		this.mapSize = {width: parseInt(map.getAttribute('width'), 10), height: parseInt(map.getAttribute('height'), 10)}
		this.tileSize = {width: parseInt(map.getAttribute('tilewidth'), 10), height: parseInt(map.getAttribute('tileheight'), 10)}


		// Parse tilesets

		// Parse tile

		// Parse layers
		var layers = map.getElementsByTagName('layer');
		for (var i = 0, len = layers.length; i < len; i++) {
			var layer = layers[i];
			var data = layer.getElementsByTagName('data')[0];

			if (data.getAttribute('compression') == 'gzip') {
				this.tiles = gzip.unzipBase64AsArray(data.firstChild.nodeValue, 4);
			} else {
				this.tiles = base64.decodeAsArray(data.firstChild.nodeValue, 4);
			}

			console.log('Number of tiles in map:', this.tiles.length);
		}

		//
	}
});

var TMXLayerInfo = Obj.extend({
	name: '',
	layerSize: null,
	tiles: null,
	visible: true,
	opacity: 255,
	ownTiles: true,
	minGID: 100000,
	maxGID: 0,
	properties: null,
	offset: null,

	init: function() {
		this.properties = {};
		this.offset = ccp(0, 0);
	}
});

exports.TMXMapInfo = TMXMapInfo;
exports.TMXLayerInfo = TMXLayerInfo;
