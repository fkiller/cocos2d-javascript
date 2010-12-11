var util = require('util'),
    console = require('system').console,
    geo = require('geometry'),
    ccp = geo.ccp,
    Node = require('./Node').Node,
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('./TMXOrientation').TMXOrientationIso,
    TMXLayer   = require('./TMXLayer').TMXLayer,
    TMXMapInfo = require('./TMXXMLParser').TMXMapInfo;

/** @member cocos
 * @class
 *
 * @extends cocos.Node
 */
var TMXTiledMap = Node.extend(/** @scope cocos.TMXTiledMap# */{
    mapSize: null,
    tileSize: null,
    mapOrientation: 0,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    init: function(opts) {
        @super;

        this.set('anchorPoint', ccp(0, 0));

        var mapInfo = TMXMapInfo.create(opts['file']);

        this.mapSize        = mapInfo.get('mapSize');
        this.tileSize       = mapInfo.get('tileSize');
        this.mapOrientation = mapInfo.get('orientation');
        this.objectGroups   = mapInfo.get('objectGroups');
        this.properties     = mapInfo.get('properties');
        this.tileProperties = mapInfo.get('tileProperties');

        // Add layers to map
        var idx = 0;
        util.each(mapInfo.layers, util.callback(this, function(layerInfo) {
            if (layerInfo.get('visible')) {
                var child = this.parseLayer({layerInfo: layerInfo, mapInfo: mapInfo});
                this.addChild({child:child, z:idx, tag:idx});

                var childSize   = child.get('contentSize');
                var currentSize = this.get('contentSize');
                currentSize.width  = Math.max(currentSize.width,  childSize.width);
                currentSize.height = Math.max(currentSize.height, childSize.height);
                this.set('contentSize', currentSize);

                idx++;
            }
        }));
    },
    
    parseLayer: function(opts) {
        var tileset = this.tilesetForLayer(opts);
        var layer = TMXLayer.create({tilesetInfo: tileset, layerInfo: opts['layerInfo'], mapInfo: opts['mapInfo']});

        layer.setupTiles();

        return layer;
    },

    tilesetForLayer: function(opts) {
        var layerInfo = opts['layerInfo'],
            mapInfo = opts['mapInfo'],
            size = layerInfo.get('layerSize');

        // Reverse loop
        for (var i = mapInfo.tilesets.length -1; i >= 0; i--) {
            var tileset = mapInfo.tilesets[i];

            for (var y=0; y < size.height; y++ ) {
                for (var x=0; x < size.width; x++ ) {
                    var pos = x + size.width * y, 
                        gid = layerInfo.tiles[pos];

                    if (gid != 0 && gid >= tileset.firstGID) {
                        return tileset;
                    }
                } // for (var x
            } // for (var y
        } // for (var i

        console.warn("cocos2d: Warning: TMX Layer '%s' has no tiles", layerInfo.name)
        return tileset;
    }
});

exports.TMXTiledMap = TMXTiledMap;

