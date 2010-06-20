var sys = require('sys'),
    SpriteSheet = require('./SpriteSheet').SpriteSheet;
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('./TMXOrientation').TMXOrientationIso,
    ccp    = require('geometry').ccp,
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

        this.layerName = layerInfo.get('name');
        this.layerSize = layerInfo.get('layerSize');
        this.tiles = layerInfo.get('tiles');
        this.minGID = layerInfo.get('minGID');
        this.maxGID = layerInfo.get('maxGID');
        this.opacity = layerInfo.get('opacity');
        this.properties = sys.copy(layerInfo.properties);

        this.tilesetInfo = tilesetInfo;
        this.mapTileSize = mapInfo.get('tileSize');
        this.layerOrientation = mapInfo.get('orientation');

        var offset = this.calculateLayerOffset(layerInfo.get('offset'));
        this.set('position', offset);

        this.set('contentSize', {width: this.layerSize.width * this.mapTileSize.width, height: this.layerSize.height * this.mapTileSize.height});
    },

    calculateLayerOffset: function(pos) {
        var ret = ccp(0, 0);

        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            ret = ccp(pos.x * this.mapTileSize.width, pos.y * this.mapTileSize.height);
            break;
        case TMXOrientationIso:
            // TODO
            break;
        case TMXOrientationHex:
            // TODO
            break;
        }

        return ret;
    },

    setupTiles: function() {
        // TODO
    }
});

exports.TMXLayer = TMXLayer;
