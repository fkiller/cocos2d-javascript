var sys = require('sys'),
    path = require('path'),
    ccp = require('geometry').ccp,
    base64 = require('base64'),
    gzip   = require('gzip'),
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso = require('./TMXOrientation').TMXOrientationIso,
    Thing = require('thing').Thing;

/** @member cocos
 * @class
 */
var TMXMapInfo = Thing.extend(/** @scope cocos.TMXMapInfo# */{
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
        this.filename = tmxFile;

        this.parseXMLFile(tmxFile);
    },

    parseXMLFile: function(xmlFile) {
        var parser = new DOMParser();
        doc = parser.parseFromString(resource(xmlFile), 'text/xml');

        // PARSE <map>
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
        this.mapSize = {width: parseInt(map.getAttribute('width'), 10), height: parseInt(map.getAttribute('height'), 10)}
        this.tileSize = {width: parseInt(map.getAttribute('tilewidth'), 10), height: parseInt(map.getAttribute('tileheight'), 10)}


        // PARSE <tilesets>
        var tilesets = map.getElementsByTagName('tileset');
        for (var i = 0, len = tilesets.length; i < len; i++) {
            var t = tilesets[i];

            var tileset = TMXTilesetInfo.create();
            tileset.set('name', t.getAttribute('name'));
            tileset.set('firstGID', parseInt(t.getAttribute('firstgid'), 10));
            if (t.getAttribute('spacing')) {
                tileset.set('spacing', parseInt(t.getAttribute('spacing'), 10));
            }
            if (t.getAttribute('margin')) {
                tileset.set('margin', parseInt(t.getAttribute('margin'), 10));
            }

            var s = {};
            s.width = parseInt(t.getAttribute('tilewidth'), 10)
            s.height = parseInt(t.getAttribute('tileheight'), 10)
            tileset.set('tileSize', s);

            // PARSE <image> We assume there's only 1
            var image = t.getElementsByTagName('image')[0];
            tileset.set('sourceImage', path.join(path.dirname(this.filename), image.getAttribute('source')));

            this.tilesets.push(tileset);
            delete tileset;
        }

        // PARSE <layers>
        var layers = map.getElementsByTagName('layer');
        for (var i = 0, len = layers.length; i < len; i++) {
            var l = layers[i];
            var data = l.getElementsByTagName('data')[0];
            var layer = TMXLayerInfo.create();

            layer.set('name', l.getAttribute('name'));
            if (l.getAttribute('visible') == undefined) {
                layer.set('visible', true);
            } else {
                layer.set('visible', !!parseInt(l.getAttribute('visible')));
            }

            var s = {};
            s.width = parseInt(l.getAttribute('width'), 10)
            s.height = parseInt(l.getAttribute('height'), 10)
            layer.set('layerSize', s);

            var opacity = l.getAttribute('opacity');
            if (opacity == undefined) {
                layer.set('opacity', 255);
            } else {
                layer.set('opacity', 255 * parseFloat(opacity));
            }

            var x = parseInt(l.getAttribute('x'), 10),
                y = parseInt(l.getAttribute('y'), 10);
            if (isNaN(x)) x = 0;
            if (isNaN(y)) y = 0;
            layer.set('offset', ccp(x, y));


            // Unpack the tilemap data
            if (data.getAttribute('compression') == 'gzip') {
                layer.set('tiles', gzip.unzipBase64AsArray(data.firstChild.nodeValue, 4));
            } else {
                layer.set('tiles', base64.decodeAsArray(data.firstChild.nodeValue, 4));
            }

            this.layers.push(layer);
            delete layer;

        }

        // TODO PARSE <tile>

    }
});

/** @member cocos
 * @class
 */
var TMXLayerInfo = Thing.extend(/** @scope cocos.TMXLayerInfo# */{
    name: '',
    layerSize: null,
    tiles: null,
    visible: true,
    opacity: 255,
    minGID: 100000,
    maxGID: 0,
    properties: null,
    offset: null,

    init: function() {
        @super;

        this.properties = {};
        this.offset = ccp(0, 0);
    }
});

/** @member cocos
 * @class
 */
var TMXTilesetInfo = Thing.extend(/** @scope cocos.TMXTilesetInfo# */{
    name: '',
    firstGID: 0,
    tileSize: null,
    spacing: 0,
    margin: 0,
    sourceImage: null,
    imageSize: null,

    init: function() {
        @super;
    },

    rectForGID: function(gid) {
        var rect = {size:{}, origin:ccp(0,0)};
        rect.size = sys.copy(this.tileSize);
        
        gid = gid - this.firstGID;
        
        var max_x = Math.floor((this.imageSize.width - this.margin*2 + this.spacing) / (this.tileSize.width + this.spacing));
        
        rect.origin.x = (gid % max_x) * (this.tileSize.width + this.spacing) + this.margin;
        rect.origin.y = Math.floor(gid / max_x) * (this.tileSize.height + this.spacing) + this.margin;
        
        return rect;
    }
});

exports.TMXMapInfo = TMXMapInfo;
exports.TMXLayerInfo = TMXLayerInfo;
exports.TMXTilesetInfo = TMXTilesetInfo;
