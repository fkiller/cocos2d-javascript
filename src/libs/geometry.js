var util = require('util');

var RE_PAIR = /{\s*([\d.-]+)\s*,\s*([\d.-]+)\s*}/,
    RE_DOUBLE_PAIR = /{\s*({[\s\d,.-]+})\s*,\s*({[\s\d,.-]+})\s*}/;

/** @namespace */
var geometry = {
    /**
     * @class
     * A 2D point in space
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     */
    Point: function(x, y) {
        /**
         * X coordinate
         * @type Float
         */
        this.x = x;

        /**
         * Y coordinate
         * @type Float
         */
        this.y = y;
    },

    /**
     * @class
     * A 2D size
     *
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Size: function(w, h) {
        /**
         * Width
         * @type Float
         */
        this.width = w;

        /**
         * Height
         * @type Float
         */
        this.height = h;
    },

    /**
     * @class
     * A rectangle
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Rect: function(x, y, w, h) {
        /**
         * Coordinate in 2D space
         * @type {geometry.Point}
         */
        this.origin = new geometry.Point(x, y);

        /**
         * Size in 2D space
         * @type {geometry.Size}
         */
        this.size   = new geometry.Size(w, h);
    },

    /**
     * Creates a geometry.Point instance
     *
     * @param {Float} x X coordinate
     * @param {Float} y Y coordinate
     * @returns {geometry.Point} 
     */
    ccp: function(x, y) {
        return module.exports.pointMake(x, y);
    },

    /**
     * Add the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpAdd: function(p1, p2) {
        return geometry.ccp(p1.x + p2.x, p1.y + p2.y);
    },

    /**
     * Subtract the values of two points
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpSub: function(p1, p2) {
        return geometry.ccp(p1.x - p2.x, p1.y - p2.y);
    },

    /**
     * Muliply the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpMult: function(p1, p2) {
        return geometry.ccp(p1.x * p2.x, p1.y * p2.y);
    },


    /**
     * Invert the values of a geometry.Point
     *
     * @param {geometry.Point} p Point to invert
     * @returns {geometry.Point} New point
     */
    ccpNeg: function(p) {
        return geometry.ccp(-p.x, -p.y);
    },

    /**
     * Round values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpRound: function(p) {
        return geometry.ccp(Math.round(p.x), Math.round(p.y));
    },

    /**
     * Round up values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpCeil: function(p) {
        return geometry.ccp(Math.ceil(p.x), Math.ceil(p.y));
    },

    /**
     * Round down values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpFloor: function(p) {
        return geometry.ccp(Math.floor(p.x), Math.floor(p.y));
    },

    /**
     * A point at 0x0
     *
     * @returns {geometry.Point} New point at 0x0
     */
    PointZero: function() {
        return geometry.ccp(0,0);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectMake: function(x, y, w, h) {
        return new geometry.Rect(x, y, w, h);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectFromString: function(str) {
        var matches = str.match(RE_DOUBLE_PAIR),
            p = geometry.pointFromString(matches[1]),
            s = geometry.sizeFromString(matches[2]);

        return geometry.rectMake(p.x, p.y, s.width, s.height);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeMake: function(w, h) {
        return new geometry.Size(w, h);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeFromString: function(str) {
        var matches = str.match(RE_PAIR),
            w = parseFloat(matches[1]),
            h = parseFloat(matches[2]);

        return geometry.sizeMake(w, h);
    },

    /**
     * @returns {geometry.Point}
     */
    pointMake: function(x, y) {
        return new geometry.Point(x, y);
    },

    /**
     * @returns {geometry.Point}
     */
    pointFromString: function(str) {
        var matches = str.match(RE_PAIR),
            x = parseFloat(matches[1]),
            y = parseFloat(matches[2]);

        return geometry.pointMake(x, y);
    },

    /**
     * @returns {Boolean}
     */
    rectContainsPoint: function(r, p) {
        return ((p.x >= r.origin.x && p.x <= r.origin.x + r.size.width)
                && (p.y >= r.origin.y && p.y <= r.origin.y + r.size.height));
    },

    /**
     * @returns {Boolean}
     */
    pointEqualToPoint: function(point1, point2) {
        return (point1.x == point2.x && point1.y == point2.y);
    },

    /**
     * @returns {Boolean}
     */
    sizeEqualToSize: function(size1, size2) {
        return (size1.width == size2.width && size1.height == size2.height);
    },

    /**
     * @returns {Boolean}
     */
    rectEqualToRect: function(rect1, rect2) {
        return (module.exports.sizeEqualToSize(rect1.size, rect2.size) && module.exports.pointEqualToPoint(rect1.origin, rect2.origin));
    },

    /**
     * @returns {Float}
     */
    rectGetMinX: function(rect) {
        return rect.origin.x;
    },

    /**
     * @returns {Float}
     */
    rectGetMinY: function(rect) {
        return rect.origin.y;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxX: function(rect) {
        return rect.origin.x + rect.size.width;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxY: function(rect) {
        return rect.origin.y + rect.size.height;
    },

    boundingRectMake: function(p1, p2, p3, p4) {
        var minX = Math.min(p1.x, Math.min(p2.x, Math.min(p3.x, p4.x)));
        var minY = Math.min(p1.y, Math.min(p2.y, Math.min(p3.y, p4.y)));
        var maxX = Math.max(p1.x, Math.max(p2.x, Math.max(p3.x, p4.x)));
        var maxY = Math.max(p1.y, Math.max(p2.y, Math.max(p3.y, p4.y)));

        return geometry.rectMake(minX, minY, (maxX - minX), (maxY - minY));
    },

    /**
     * @returns {geometry.Point}
     */
    pointApplyAffineTransform: function(p, trans) {
        var newPoint = geometry.ccp(0, 0);
        
        newPoint.x = p.x * trans[0][0] + p.y * trans[1][0] + trans[2][0];
        newPoint.y = p.x * trans[0][1] + p.y * trans[1][1] + trans[2][1];

        return newPoint;
    },

    /**
     * @returns {geometry.Rect}
     */
    rectApplyAffineTransform: function(rect, trans) {

        var p1 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMinY(rect));
        var p2 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMinY(rect));
        var p3 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMaxY(rect));
        var p4 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMaxY(rect));

        p1 = geometry.pointApplyAffineTransform(p1, trans);
        p2 = geometry.pointApplyAffineTransform(p2, trans);
        p3 = geometry.pointApplyAffineTransform(p3, trans);
        p4 = geometry.pointApplyAffineTransform(p4, trans);

        return geometry.boundingRectMake(p1, p2, p3, p4);
    },

    /**
     * @returns {Float}
     */
    affineTransformDeterminant: function(trans) {
        var det = 1,
            t = util.copy(trans);

        var k, i, j, q, tkk;
        for (k = 0; k < 3; k++) {
            tkk = t[k][k];

            if (tkk == 0) {
                i = k;
                while (t[i][k] == 0) {
                    if (i++ > 3) {
                        return 0;
                    }
                }

                // Swap t[i] and t[k]
                t[i] = t[i] + t[k]; t[k] = t[i] - t[k]; t[i] = t[i] - t[k];

                tkk = t[k][k];

                det *= -1;
            }

            for (i = k+1; i < 3; i++) {
                q = t[i][k] / tkk;
                for (j = k+1; j < 3; j++) {
                    t[i][j] -= t[k][j] * q
                }
            }

            det *= tkk;
        }

        return det;
    },

    /**
     * @returns {Float[]}
     */
    affineTransformInvert: function(trans) {
        var newTrans = module.exports.affineTransformIdentity();

        var t = util.copy(trans);

        var k, i, j, q, tkk;
        for (k = 0; k < 3; k++) {
            tkk = t[k][k];

            if (tkk == 0) {
                i = k;
                do {
                    if (i++ > 3) {
                        throw "Matrix not regular size";
                    }
                } while (t[i][k] == 0);

                // Swap t[i] and t[k]
                t[i] = t[i] + t[k];
                t[k] = t[i] - t[k];
                t[i] = t[i] - t[k];
                newTrans[i] = newTrans[i] + newTrans[k];
                newTrans[k] = newTrans[i] - newTrans[k];
                newTrans[i] = newTrans[i] - newTrans[k];

                tkk = t[k][k];
            }

            for (i = 0; i < 3; i++) {
                if (i == k) {
                    continue
                }

                q = t[i][k] / tkk;
                t[i][k] = 0;

                for (j = k+1; j < 3; j++) {
                    t[i][j] -= t[k][j] * q;
                }
                for (j = 0; j < 3; j++) {
                    newTrans[i][j] -= newTrans[k][j] * q;
                }
            }

            for (j = k+1; j < 3; j++) {
                t[k][j] /= tkk;
            }
            for (j = 0; j < 3; j++) {
                newTrans[k][j] /= tkk;
            }

        }

        return newTrans;
       
    },

    /**
     * Multiply 2 transform (3x3) matrices together
     * @returns {Float[]} New transform matrix
     */
    affineTransformConcat: function(trans1, trans2) {
        var newTrans = module.exports.affineTransformIdentity();

        var x, y, i;
        for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
                newTrans[y][x] = 0;
                for (i = 0; i < 3; i++) {
                    newTrans[y][x] += trans1[y][i] * trans2[i][x];
                }
            }
        }

        return newTrans;
    },

    /**
     * @returns {Float}
     */
    degressToRadians: function(angle) {
        return angle / 180.0 * Math.PI;
    },

    /**
     * @returns {Float[]}
     */
    affineTransformTranslate: function(trans, x, y) {
        // tx = 6, ty = 7

        var newTrans = util.copy(trans);
        newTrans[2][0] += x;
        newTrans[2][1] += y;

        return newTrans;
    },

    affineTransformRotate: function(trans, angle) {
        // TODO
        return trans;
    },

    affineTransformScale: function(trans, scale) {
        // TODO
        return trans;
    },

    /**
     * @returns {Float[]} 3x3 identity matrix
     */
    affineTransformIdentity: function() {
        return [[1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]];
    }
};

module.exports = geometry;
