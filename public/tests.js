
if (!window.__resources__) { window.__resources__ = {}; }
if (!__imageResource) { function __imageResource(data) { var img = new Image(); img.src = data; return img; } }

window.__resources__['/libs/base64.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * Thin wrapper around JXG's Base64 utils
 */

/** @ignore */
var JXG = require('JXGUtil');

/** @namespace */
var base64 = {
    decode: function(input) {
        return JXG.Util.Base64.decode(input);
    },

    decodeAsArray: function(input, bytes) {
        var bytes = bytes || 1;

        var dec = JXG.Util.Base64.decode(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << j;
            }
        }
        return ar;
    },

    encode: function(input) {
        return JXG.Util.Base64.encode(input);
    }
};

module.exports = base64;

}};

window.__resources__['/libs/geometry.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys');

/** @namespace */
var geometry = {
    /**
     * Creates a Point instance
     *
     * @param {Number} x X coordinate
     * @param {Number} y Y coordinate
     */
    ccp: function(x, y) {
        return module.exports.pointMake(x, y);
    },

    PointZero: function() {
        return ccp(0,0);
    },

    rectMake: function(x, y, w, h) {
        return {origin: module.exports.pointMake(x, y), size: module.exports.sizeMake(w, h)};
    },

    sizeMake: function(w, h) {
        return {width: w, height: h};
    },

    pointMake: function(x, y) {
        return {x: x, y: y};
    },

    rectContainsPoint: function(r, p) {
        return ((p.x >= r.origin.x && p.x <= r.origin.x + r.size.width)
                && (p.y >= r.origin.y && p.y <= r.origin.y + r.size.height));
    },

    pointEqualToPoint: function(point1, point2) {
        return (point1.x == point2.x && point1.y == point2.y);
    },
    sizeEqualToSize: function(size1, size2) {
        return (size1.width == size2.width && size1.height == size2.height);
    },
    rectEqualToRect: function(rect1, rect2) {
        return (module.exports.sizeEqualToSize(rect1.size, rect2.size) && module.exports.pointEqualToPoint(rect1.origin, rect2.origin));
    },

    pointApplyAffineTransform: function(p, trans) {
        var newPoint = ccp(0, 0);
        
        newPoint.x = p.x * trans[0][0] + p.y * trans[1][0] + trans[2][0];
        newPoint.y = p.x * trans[0][1] + p.y * trans[1][1] + trans[2][1];

        return newPoint;
    },
    affineTransformDeterminant: function(trans) {
        var det = 1,
            t = sys.copy(trans);

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
    affineTransformInvert: function(trans) {
        var newTrans = module.exports.affineTransformIdentity();

        var t = sys.copy(trans);

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

    degressToRadians: function(angle) {
        return angle / 180.0 * Math.PI;
    },
    affineTransformTranslate: function(trans, x, y) {
        // tx = 6, ty = 7

        var newTrans = sys.copy(trans);
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

    affineTransformIdentity: function() {
        return [[1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]];
    }
};

module.exports = geometry;

}};

window.__resources__['/libs/gzip.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * Thin wrapper around JXG's GZip utils
 */

/** @ignore */
var JXG = require('./JXGUtil');

/** @namespace */
var gzip = {
    unzip: function(input) {
        return (new JXG.Util.Unzip(input)).unzip()[0][0];
    },

    unzipBase64: function(input) {
        return (new JXG.Util.Unzip(JXG.Util.Base64.decodeAsArray(input))).unzip()[0][0];
    },

    unzipBase64AsArray: function(input, bytes) {
        var bytes = bytes || 1;

        var dec = this.unzipBase64(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << j;
            }
        }
        return ar;
    },

    unzipAsArray: function (input, bytes) {
        var bytes = bytes || 1;

        var dec = this.unzip(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << j;
            }
        }
        return ar;
    }

};

module.exports = gzip;

}};

window.__resources__['/libs/JXGUtil.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview Utilities for uncompressing and base64 decoding
 */

/** @namespace */
var JXG = {};

/**
  * @class Util class
  * Class for gunzipping, unzipping and base64 decoding of files.
  * It is used for reading GEONExT, Geogebra and Intergeo files.
  *
  * Only Huffman codes are decoded in gunzip.
  * The code is based on the source code for gunzip.c by Pasi Ojala 
  * @see <a href="http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c">http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c</a>
  * @see <a href="http://www.cs.tut.fi/~albert">http://www.cs.tut.fi/~albert</a>
  */
JXG.Util = {};
                                 
/**
 * Unzip zip files
 */
JXG.Util.Unzip = function (barray){
    var outputArr = [],
        output = "",
        debug = false,
        gpflags,
        files = 0,
        unzipped = [],
        crc,
        buf32k = new Array(32768),
        bIdx = 0,
        modeZIP=false,

        CRC, SIZE,
    
        bitReverse = [
        0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0,
        0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
        0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
        0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
        0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4,
        0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
        0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec,
        0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
        0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
        0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
        0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea,
        0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
        0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6,
        0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
        0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
        0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
        0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1,
        0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
        0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9,
        0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
        0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
        0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
        0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed,
        0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
        0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3,
        0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
        0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
        0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
        0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7,
        0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
        0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef,
        0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff
    ],
    
    cplens = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
    ],

    cplext = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99
    ], /* 99==invalid */

    cpdist = [
        0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d,
        0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1,
        0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01,
        0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001
    ],

    cpdext = [
        0,  0,  0,  0,  1,  1,  2,  2,
        3,  3,  4,  4,  5,  5,  6,  6,
        7,  7,  8,  8,  9,  9, 10, 10,
        11, 11, 12, 12, 13, 13
    ],
    
    border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
    
    bA = barray,

    bytepos=0,
    bitpos=0,
    bb = 1,
    bits=0,
    
    NAMEMAX = 256,
    
    nameBuf = [],
    
    fileout;
    
    function readByte(){
        bits+=8;
        if (bytepos<bA.length){
            //if (debug)
            //    document.write(bytepos+": "+bA[bytepos]+"<br>");
            return bA[bytepos++];
        } else
            return -1;
    };

    function byteAlign(){
        bb = 1;
    };
    
    function readBit(){
        var carry;
        bits++;
        carry = (bb & 1);
        bb >>= 1;
        if (bb==0){
            bb = readByte();
            carry = (bb & 1);
            bb = (bb>>1) | 0x80;
        }
        return carry;
    };

    function readBits(a) {
        var res = 0,
            i = a;
    
        while(i--) {
            res = (res<<1) | readBit();
        }
        if(a) {
            res = bitReverse[res]>>(8-a);
        }
        return res;
    };
        
    function flushBuffer(){
        //document.write('FLUSHBUFFER:'+buf32k);
        bIdx = 0;
    };
    function addBuffer(a){
        SIZE++;
        //CRC=updcrc(a,crc);
        buf32k[bIdx++] = a;
        outputArr.push(String.fromCharCode(a));
        //output+=String.fromCharCode(a);
        if(bIdx==0x8000){
            //document.write('ADDBUFFER:'+buf32k);
            bIdx=0;
        }
    };
    
    function HufNode() {
        this.b0=0;
        this.b1=0;
        this.jump = null;
        this.jumppos = -1;
    };

    var LITERALS = 288;
    
    var literalTree = new Array(LITERALS);
    var distanceTree = new Array(32);
    var treepos=0;
    var Places = null;
    var Places2 = null;
    
    var impDistanceTree = new Array(64);
    var impLengthTree = new Array(64);
    
    var len = 0;
    var fpos = new Array(17);
    fpos[0]=0;
    var flens;
    var fmax;
    
    function IsPat() {
        while (1) {
            if (fpos[len] >= fmax)
                return -1;
            if (flens[fpos[len]] == len)
                return fpos[len]++;
            fpos[len]++;
        }
    };

    function Rec() {
        var curplace = Places[treepos];
        var tmp;
        if (debug)
    		document.write("<br>len:"+len+" treepos:"+treepos);
        if(len==17) { //war 17
            return -1;
        }
        treepos++;
        len++;
    	
        tmp = IsPat();
        if (debug)
        	document.write("<br>IsPat "+tmp);
        if(tmp >= 0) {
            curplace.b0 = tmp;    /* leaf cell for 0-bit */
            if (debug)
            	document.write("<br>b0 "+curplace.b0);
        } else {
        /* Not a Leaf cell */
        curplace.b0 = 0x8000;
        if (debug)
        	document.write("<br>b0 "+curplace.b0);
        if(Rec())
            return -1;
        }
        tmp = IsPat();
        if(tmp >= 0) {
            curplace.b1 = tmp;    /* leaf cell for 1-bit */
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = null;    /* Just for the display routine */
        } else {
            /* Not a Leaf cell */
            curplace.b1 = 0x8000;
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = Places[treepos];
            curplace.jumppos = treepos;
            if(Rec())
                return -1;
        }
        len--;
        return 0;
    };

    function CreateTree(currentTree, numval, lengths, show) {
        var i;
        /* Create the Huffman decode tree/table */
        //document.write("<br>createtree<br>");
        if (debug)
        	document.write("currentTree "+currentTree+" numval "+numval+" lengths "+lengths+" show "+show);
        Places = currentTree;
        treepos=0;
        flens = lengths;
        fmax  = numval;
        for (i=0;i<17;i++)
            fpos[i] = 0;
        len = 0;
        if(Rec()) {
            //fprintf(stderr, "invalid huffman tree\n");
            if (debug)
            	alert("invalid huffman tree\n");
            return -1;
        }
        if (debug){
        	document.write('<br>Tree: '+Places.length);
        	for (var a=0;a<32;a++){
            	document.write("Places["+a+"].b0="+Places[a].b0+"<br>");
            	document.write("Places["+a+"].b1="+Places[a].b1+"<br>");
        	}
        }

        return 0;
    };
    
    function DecodeValue(currentTree) {
        var len, i,
            xtreepos=0,
            X = currentTree[xtreepos],
            b;

        /* decode one symbol of the data */
        while(1) {
            b=readBit();
            if (debug)
            	document.write("b="+b);
            if(b) {
                if(!(X.b1 & 0x8000)){
                	if (debug)
                    	document.write("ret1");
                    return X.b1;    /* If leaf node, return data */
                }
                X = X.jump;
                len = currentTree.length;
                for (i=0;i<len;i++){
                    if (currentTree[i]===X){
                        xtreepos=i;
                        break;
                    }
                }
                //xtreepos++;
            } else {
                if(!(X.b0 & 0x8000)){
                	if (debug)
                    	document.write("ret2");
                    return X.b0;    /* If leaf node, return data */
                }
                //X++; //??????????????????
                xtreepos++;
                X = currentTree[xtreepos];
            }
        }
        if (debug)
        	document.write("ret3");
        return -1;
    };
    
    function DeflateLoop() {
    var last, c, type, i, len;

    do {
        /*if((last = readBit())){
            fprintf(errfp, "Last Block: ");
        } else {
            fprintf(errfp, "Not Last Block: ");
        }*/
        last = readBit();
        type = readBits(2);
        switch(type) {
            case 0:
            	if (debug)
                	alert("Stored\n");
                break;
            case 1:
            	if (debug)
                	alert("Fixed Huffman codes\n");
                break;
            case 2:
            	if (debug)
                	alert("Dynamic Huffman codes\n");
                break;
            case 3:
            	if (debug)
                	alert("Reserved block type!!\n");
                break;
            default:
            	if (debug)
                	alert("Unexpected value %d!\n", type);
                break;
        }

        if(type==0) {
            var blockLen, cSum;

            // Stored 
            byteAlign();
            blockLen = readByte();
            blockLen |= (readByte()<<8);

            cSum = readByte();
            cSum |= (readByte()<<8);

            if(((blockLen ^ ~cSum) & 0xffff)) {
                document.write("BlockLen checksum mismatch\n");
            }
            while(blockLen--) {
                c = readByte();
                addBuffer(c);
            }
        } else if(type==1) {
            var j;

            /* Fixed Huffman tables -- fixed decode routine */
            while(1) {
            /*
                256    0000000        0
                :   :     :
                279    0010111        23
                0   00110000    48
                :    :      :
                143    10111111    191
                280 11000000    192
                :    :      :
                287 11000111    199
                144    110010000    400
                :    :       :
                255    111111111    511
    
                Note the bit order!
                */

            j = (bitReverse[readBits(7)]>>1);
            if(j > 23) {
                j = (j<<1) | readBit();    /* 48..255 */

                if(j > 199) {    /* 200..255 */
                    j -= 128;    /*  72..127 */
                    j = (j<<1) | readBit();        /* 144..255 << */
                } else {        /*  48..199 */
                    j -= 48;    /*   0..151 */
                    if(j > 143) {
                        j = j+136;    /* 280..287 << */
                        /*   0..143 << */
                    }
                }
            } else {    /*   0..23 */
                j += 256;    /* 256..279 << */
            }
            if(j < 256) {
                addBuffer(j);
                //document.write("out:"+String.fromCharCode(j));
                /*fprintf(errfp, "@%d %02x\n", SIZE, j);*/
            } else if(j == 256) {
                /* EOF */
                break;
            } else {
                var len, dist;

                j -= 256 + 1;    /* bytes + EOF */
                len = readBits(cplext[j]) + cplens[j];

                j = bitReverse[readBits(5)]>>3;
                if(cpdext[j] > 8) {
                    dist = readBits(8);
                    dist |= (readBits(cpdext[j]-8)<<8);
                } else {
                    dist = readBits(cpdext[j]);
                }
                dist += cpdist[j];

                /*fprintf(errfp, "@%d (l%02x,d%04x)\n", SIZE, len, dist);*/
                for(j=0;j<len;j++) {
                    var c = buf32k[(bIdx - dist) & 0x7fff];
                    addBuffer(c);
                }
            }
            } // while
        } else if(type==2) {
            var j, n, literalCodes, distCodes, lenCodes;
            var ll = new Array(288+32);    // "static" just to preserve stack
    
            // Dynamic Huffman tables 
    
            literalCodes = 257 + readBits(5);
            distCodes = 1 + readBits(5);
            lenCodes = 4 + readBits(4);
            //document.write("<br>param: "+literalCodes+" "+distCodes+" "+lenCodes+"<br>");
            for(j=0; j<19; j++) {
                ll[j] = 0;
            }
    
            // Get the decode tree code lengths
    
            //document.write("<br>");
            for(j=0; j<lenCodes; j++) {
                ll[border[j]] = readBits(3);
                //document.write(ll[border[j]]+" ");
            }
            //fprintf(errfp, "\n");
            //document.write('<br>ll:'+ll);
            len = distanceTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            if(CreateTree(distanceTree, 19, ll, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug){
            	document.write("<br>distanceTree");
            	for(var a=0;a<distanceTree.length;a++){
                	document.write("<br>"+distanceTree[a].b0+" "+distanceTree[a].b1+" "+distanceTree[a].jump+" "+distanceTree[a].jumppos);
                	/*if (distanceTree[a].jumppos!=-1)
                    	document.write(" "+distanceTree[a].jump.b0+" "+distanceTree[a].jump.b1);
                	*/
            	}
            }
            //document.write('<BR>tree created');
    
            //read in literal and distance code lengths
            n = literalCodes + distCodes;
            i = 0;
            var z=-1;
            if (debug)
            	document.write("<br>n="+n+" bits: "+bits+"<br>");
            while(i < n) {
                z++;
                j = DecodeValue(distanceTree);
                if (debug)
                	document.write("<br>"+z+" i:"+i+" decode: "+j+"    bits "+bits+"<br>");
                if(j<16) {    // length of code in bits (0..15)
                       ll[i++] = j;
                } else if(j==16) {    // repeat last length 3 to 6 times 
                       var l;
                    j = 3 + readBits(2);
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    l = i ? ll[i-1] : 0;
                    while(j--) {
                        ll[i++] = l;
                    }
                } else {
                    if(j==17) {        // 3 to 10 zero length codes
                        j = 3 + readBits(3);
                    } else {        // j == 18: 11 to 138 zero length codes 
                        j = 11 + readBits(7);
                    }
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    while(j--) {
                        ll[i++] = 0;
                    }
                }
            }
            /*for(j=0; j<literalCodes+distCodes; j++) {
                //fprintf(errfp, "%d ", ll[j]);
                if ((j&7)==7)
                    fprintf(errfp, "\n");
            }
            fprintf(errfp, "\n");*/
            // Can overwrite tree decode tree as it is not used anymore
            len = literalTree.length;
            for (i=0; i<len; i++)
                literalTree[i]=new HufNode();
            if(CreateTree(literalTree, literalCodes, ll, 0)) {
                flushBuffer();
                return 1;
            }
            len = literalTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            var ll2 = new Array();
            for (i=literalCodes; i <ll.length; i++){
                ll2[i-literalCodes]=ll[i];
            }    
            if(CreateTree(distanceTree, distCodes, ll2, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug)
           		document.write("<br>literalTree");
            while(1) {
                j = DecodeValue(literalTree);
                if(j >= 256) {        // In C64: if carry set
                    var len, dist;
                    j -= 256;
                    if(j == 0) {
                        // EOF
                        break;
                    }
                    j--;
                    len = readBits(cplext[j]) + cplens[j];
    
                    j = DecodeValue(distanceTree);
                    if(cpdext[j] > 8) {
                        dist = readBits(8);
                        dist |= (readBits(cpdext[j]-8)<<8);
                    } else {
                        dist = readBits(cpdext[j]);
                    }
                    dist += cpdist[j];
                    while(len--) {
                        var c = buf32k[(bIdx - dist) & 0x7fff];
                        addBuffer(c);
                    }
                } else {
                    addBuffer(j);
                }
            }
        }
    } while(!last);
    flushBuffer();

    byteAlign();
    return 0;
};

JXG.Util.Unzip.prototype.unzipFile = function(name) {
    var i;
	this.unzip();
	//alert(unzipped[0][1]);
	for (i=0;i<unzipped.length;i++){
		if(unzipped[i][1]==name) {
			return unzipped[i][0];
		}
	}
	
  };
    
    
JXG.Util.Unzip.prototype.unzip = function() {
	//convertToByteArray(input);
	if (debug)
		alert(bA);
	/*for (i=0;i<bA.length*8;i++){
		document.write(readBit());
		if ((i+1)%8==0)
			document.write(" ");
	}*/
	/*for (i=0;i<bA.length;i++){
		document.write(readByte()+" ");
		if ((i+1)%8==0)
			document.write(" ");
	}
	for (i=0;i<bA.length;i++){
		document.write(bA[i]+" ");
		if ((i+1)%16==0)
			document.write("<br>");
	}	
	*/
	//alert(bA);
	nextFile();
	return unzipped;
  };
    
 function nextFile(){
 	if (debug)
 		alert("NEXTFILE");
 	outputArr = [];
 	var tmp = [];
 	modeZIP = false;
	tmp[0] = readByte();
	tmp[1] = readByte();
	if (debug)
		alert("type: "+tmp[0]+" "+tmp[1]);
	if (tmp[0] == parseInt("78",16) && tmp[1] == parseInt("da",16)){ //GZIP
		if (debug)
			alert("GEONExT-GZIP");
		DeflateLoop();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "geonext.gxt";
    	files++;
	}
	if (tmp[0] == parseInt("1f",16) && tmp[1] == parseInt("8b",16)){ //GZIP
		if (debug)
			alert("GZIP");
		//DeflateLoop();
		skipdir();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "file";
    	files++;
	}
	if (tmp[0] == parseInt("50",16) && tmp[1] == parseInt("4b",16)){ //ZIP
		modeZIP = true;
		tmp[2] = readByte();
		tmp[3] = readByte();
		if (tmp[2] == parseInt("3",16) && tmp[3] == parseInt("4",16)){
			//MODE_ZIP
			tmp[0] = readByte();
			tmp[1] = readByte();
			if (debug)
				alert("ZIP-Version: "+tmp[1]+" "+tmp[0]/10+"."+tmp[0]%10);
			
			gpflags = readByte();
			gpflags |= (readByte()<<8);
			if (debug)
				alert("gpflags: "+gpflags);
			
			var method = readByte();
			method |= (readByte()<<8);
			if (debug)
				alert("method: "+method);
			
			readByte();
			readByte();
			readByte();
			readByte();
			
			var crc = readByte();
			crc |= (readByte()<<8);
			crc |= (readByte()<<16);
			crc |= (readByte()<<24);
			
			var compSize = readByte();
			compSize |= (readByte()<<8);
			compSize |= (readByte()<<16);
			compSize |= (readByte()<<24);
			
			var size = readByte();
			size |= (readByte()<<8);
			size |= (readByte()<<16);
			size |= (readByte()<<24);
			
			if (debug)
				alert("local CRC: "+crc+"\nlocal Size: "+size+"\nlocal CompSize: "+compSize);
			
			var filelen = readByte();
			filelen |= (readByte()<<8);
			
			var extralen = readByte();
			extralen |= (readByte()<<8);
			
			if (debug)
				alert("filelen "+filelen);
			i = 0;
			nameBuf = [];
			while (filelen--){ 
				var c = readByte();
				if (c == "/" | c ==":"){
					i = 0;
				} else if (i < NAMEMAX-1)
					nameBuf[i++] = String.fromCharCode(c);
			}
			if (debug)
				alert("nameBuf: "+nameBuf);
			
			//nameBuf[i] = "\0";
			if (!fileout)
				fileout = nameBuf;
			
			var i = 0;
			while (i < extralen){
				c = readByte();
				i++;
			}
				
			CRC = 0xffffffff;
			SIZE = 0;
			
			if (size = 0 && fileOut.charAt(fileout.length-1)=="/"){
				//skipdir
				if (debug)
					alert("skipdir");
			}
			if (method == 8){
				DeflateLoop();
				if (debug)
					alert(outputArr.join(''));
				unzipped[files] = new Array(2);
				unzipped[files][0] = outputArr.join('');
    			unzipped[files][1] = nameBuf.join('');
    			files++;
				//return outputArr.join('');
			}
			skipdir();
		}
	}
 };
	
function skipdir(){
    var crc, 
        tmp = [],
        compSize, size, os, i, c;
    
	if ((gpflags & 8)) {
		tmp[0] = readByte();
		tmp[1] = readByte();
		tmp[2] = readByte();
		tmp[3] = readByte();
		
		if (tmp[0] == parseInt("50",16) && 
            tmp[1] == parseInt("4b",16) && 
            tmp[2] == parseInt("07",16) && 
            tmp[3] == parseInt("08",16))
        {
            crc = readByte();
            crc |= (readByte()<<8);
            crc |= (readByte()<<16);
            crc |= (readByte()<<24);
		} else {
			crc = tmp[0] | (tmp[1]<<8) | (tmp[2]<<16) | (tmp[3]<<24);
		}
		
		compSize = readByte();
		compSize |= (readByte()<<8);
		compSize |= (readByte()<<16);
		compSize |= (readByte()<<24);
		
		size = readByte();
		size |= (readByte()<<8);
		size |= (readByte()<<16);
		size |= (readByte()<<24);
		
		if (debug)
			alert("CRC:");
	}

	if (modeZIP)
		nextFile();
	
	tmp[0] = readByte();
	if (tmp[0] != 8) {
		if (debug)
			alert("Unknown compression method!");
        return 0;	
	}
	
	gpflags = readByte();
	if (debug){
		if ((gpflags & ~(parseInt("1f",16))))
			alert("Unknown flags set!");
	}
	
	readByte();
	readByte();
	readByte();
	readByte();
	
	readByte();
	os = readByte();
	
	if ((gpflags & 4)){
		tmp[0] = readByte();
		tmp[2] = readByte();
		len = tmp[0] + 256*tmp[1];
		if (debug)
			alert("Extra field size: "+len);
		for (i=0;i<len;i++)
			readByte();
	}
	
	if ((gpflags & 8)){
		i=0;
		nameBuf=[];
		while (c=readByte()){
			if(c == "7" || c == ":")
				i=0;
			if (i<NAMEMAX-1)
				nameBuf[i++] = c;
		}
		//nameBuf[i] = "\0";
		if (debug)
			alert("original file name: "+nameBuf);
	}
		
	if ((gpflags & 16)){
		while (c=readByte()){
			//FILE COMMENT
		}
	}
	
	if ((gpflags & 2)){
		readByte();
		readByte();
	}
	
	DeflateLoop();
	
	crc = readByte();
	crc |= (readByte()<<8);
	crc |= (readByte()<<16);
	crc |= (readByte()<<24);
	
	size = readByte();
	size |= (readByte()<<8);
	size |= (readByte()<<16);
	size |= (readByte()<<24);
	
	if (modeZIP)
		nextFile();
	
};

};

/**
*  Base64 encoding / decoding
*  @see <a href="http://www.webtoolkit.info/">http://www.webtoolkit.info/</A>
*/
JXG.Util.Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = [],
            chr1, chr2, chr3, enc1, enc2, enc3, enc4,
            i = 0;

        input = JXG.Util.Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output.push([this._keyStr.charAt(enc1),
                         this._keyStr.charAt(enc2),
                         this._keyStr.charAt(enc3),
                         this._keyStr.charAt(enc4)].join(''));
        }

        return output.join('');
    },

    // public method for decoding
    decode : function (input, utf8) {
        var output = [],
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4,
            i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output.push(String.fromCharCode(chr1));

            if (enc3 != 64) {
                output.push(String.fromCharCode(chr2));
            }
            if (enc4 != 64) {
                output.push(String.fromCharCode(chr3));
            }
        }
        
        output = output.join(''); 
        
        if (utf8) {
            output = JXG.Util.Base64._utf8_decode(output);
        }
        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = [],
            i = 0,
            c = 0, c2 = 0, c3 = 0;

        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string.push(String.fromCharCode(c));
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
                i += 3;
            }
        }
        return string.join('');
    },
    
    _destrip: function (stripped, wrap){
        var lines = [], lineno, i,
            destripped = [];
        
        if (wrap==null) 
            wrap = 76;
            
        stripped.replace(/ /g, "");
        lineno = stripped.length / wrap;
        for (i = 0; i < lineno; i++)
            lines[i]=stripped.substr(i * wrap, wrap);
        if (lineno != stripped.length / wrap)
            lines[lines.length]=stripped.substr(lineno * wrap, stripped.length-(lineno * wrap));
            
        for (i = 0; i < lines.length; i++)
            destripped.push(lines[i]);
        return destripped.join('\n');
    },
    
    decodeAsArray: function (input){
        var dec = this.decode(input),
            ar = [], i;
        for (i=0;i<dec.length;i++){
            ar[i]=dec.charCodeAt(i);
        }
        return ar;
    },
    
    decodeGEONExT : function (input) {
        return decodeAsArray(destrip(input),false);
    }
};

/**
 * @private
 */
JXG.Util.asciiCharCodeAt = function(str,i){
	var c = str.charCodeAt(i);
	if (c>255){
    	switch (c) {
			case 8364: c=128;
	    	break;
	    	case 8218: c=130;
	    	break;
	    	case 402: c=131;
	    	break;
	    	case 8222: c=132;
	    	break;
	    	case 8230: c=133;
	    	break;
	    	case 8224: c=134;
	    	break;
	    	case 8225: c=135;
	    	break;
	    	case 710: c=136;
	    	break;
	    	case 8240: c=137;
	    	break;
	    	case 352: c=138;
	    	break;
	    	case 8249: c=139;
	    	break;
	    	case 338: c=140;
	    	break;
	    	case 381: c=142;
	    	break;
	    	case 8216: c=145;
	    	break;
	    	case 8217: c=146;
	    	break;
	    	case 8220: c=147;
	    	break;
	    	case 8221: c=148;
	    	break;
	    	case 8226: c=149;
	    	break;
	    	case 8211: c=150;
	    	break;
	    	case 8212: c=151;
	    	break;
	    	case 732: c=152;
	    	break;
	    	case 8482: c=153;
	    	break;
	    	case 353: c=154;
	    	break;
	    	case 8250: c=155;
	    	break;
	    	case 339: c=156;
	    	break;
	    	case 382: c=158;
	    	break;
	    	case 376: c=159;
	    	break;
	    	default:
	    	break;
	    }
	}
	return c;
};

/**
 * Decoding string into utf-8
 * @param {String} string to decode
 * @return {String} utf8 decoded string
 */
JXG.Util.utf8Decode = function(utftext) {
  var string = [];
  var i = 0;
  var c = 0, c1 = 0, c2 = 0;

  while ( i < utftext.length ) {
    c = utftext.charCodeAt(i);

    if (c < 128) {
      string.push(String.fromCharCode(c));
      i++;
    } else if((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i+1);
      string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i+1);
      c3 = utftext.charCodeAt(i+2);
      string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
      i += 3;
    }
  };
  return string.join('');
};

// Added to exports for Cocos2d
module.exports = JXG;

}};

window.__resources__['/libs/path.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var path = {
    dirname: function(path) {
        var tokens = path.split('/');
        tokens.pop();
        return tokens.join('/');
    },
    basename: function(path) {
        var tokens = path.split('/');
        return tokens[tokens.length-1];
    },

    join: function () {
        return module.exports.normalize(Array.prototype.join.call(arguments, "/"));
    },

    exists: function(path) {
        return (window.__resources__[path] !== undefined);
    },

    normalizeArray: function (parts, keepBlanks) {
      var directories = [], prev;
      for (var i = 0, l = parts.length - 1; i <= l; i++) {
        var directory = parts[i];

        // if it's blank, but it's not the first thing, and not the last thing, skip it.
        if (directory === "" && i !== 0 && i !== l && !keepBlanks) continue;

        // if it's a dot, and there was some previous dir already, then skip it.
        if (directory === "." && prev !== undefined) continue;

        // if it starts with "", and is a . or .., then skip it.
        if (directories.length === 1 && directories[0] === "" && (
            directory === "." || directory === "..")) continue;

        if (
          directory === ".."
          && directories.length
          && prev !== ".."
          && prev !== "."
          && prev !== undefined
          && (prev !== "" || keepBlanks)
        ) {
          directories.pop();
          prev = directories.slice(-1)[0]
        } else {
          if (prev === ".") directories.pop();
          directories.push(directory);
          prev = directory;
        }
      }
      return directories;
    },

    normalize: function (path, keepBlanks) {
      return module.exports.normalizeArray(path.split("/"), keepBlanks).join("/");
    }
};

module.exports = path;

}};

window.__resources__['/libs/sys.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var sys = {
    /**
     * Merge two or more objects and return the result.
     *
     * @param {Object} firstObject First object to merge with
     * @param {Object} secondObject Second object to merge with
     * @param {Object} [etc] More objects to merge
     *
     * @returns {Object} A new object containing the properties of all the objects passed in
     */
    merge: function(firstObject, secondObject) {
        var result = {};

        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];

            for (var x in obj) {
                if (!obj.hasOwnProperty(x)) {
                    continue;
                }

                result[x] = obj[x];
            }
        };

        return result;
    },

    /**
     * Creates a deep copy of an object
     *
     * @param {Object} obj The Object to copy
     *
     * @returns {Object} A copy of the original Object
     */
    copy: function(obj) {
        var copy;

        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = arguments.callee(obj[i]);
            }
        } else if (typeof(obj) == 'object') {
            copy = {};

            var o, x;
            for (x in obj) {
                copy[x] = arguments.callee(obj[x]);
            }
        } else {
            // Primative type. Doesn't need copying
            copy = obj;
        }

        return copy;
    },

    /**
     * Iterates over an array and calls a function for each item.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     *
     * @returns {Array} The original array
     */
    each: function(arr, func) {
        var i = 0,
            len = arr.length;
        for (i = 0; i < len; i++) {
            func(arr[i], i);
        }

        return arr;
    },

    /**
     * Iterates over an array, calls a function for each item and returns the results.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     *
     * @returns {Array} The return values from each function call
     */
    map: function(arr, func) {
        var i = 0,
            len = arr.length,
            result = [];

        for (i = 0; i < len; i++) {
            result.push(func(arr[i], i));
        }

        return result;
    },

    extend: function(target, ext) {
        if (arguments.length < 2) {
            console.log(arguments);
            throw "You must provide at least a target and 1 object to extend from"
        }

        var i, obj, key, val;

        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            for (key in obj) {
                // Don't copy built-ins
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }

                val = obj[key];
                // Don't copy undefineds or references to target (would cause infinite loop)
                if (val === undefined || val === target) {
                    continue;
                }

                // Replace existing function and store reference to it in .base
                if (val instanceof Function && target[key] && val !== target[key]) {
                    val.base = target[key];
                    val._isProperty = val.base._isProperty;
                }
                target[key] = val;

                if (val instanceof Function) {
                    // If this function observes make a reference to it so we can set
                    // them up when this get instantiated
                    if (val._observing) {
                        // Force a COPY of the array or we will probably end up with various
                        // classes sharing the same one.
                        if (!target._observingFunctions) {
                            target._observingFunctions = [];
                        } else {
                            target._observingFunctions = target._observingFunctions.slice(0);
                        }


                        var i;
                        for (i = 0; i<val._observing.length; i++) {
                            target._observingFunctions.push({property:val._observing[i], method: key});
                        }
                    } // if (val._observing)

                    // If this is a computer property then add it to the list so get/set know where to look
                    if (val._isProperty) {
                        if (!target._computedProperties) {
                            target._computedProperties = [];
                        } else {
                            target._computedProperties = target._computedProperties.slice(0);
                        }

                        target._computedProperties.push(key)
                    }
                }
        
            }
        }


        return target;
    },

    beget: function(o) {
        var F = function(){};
        F.prototype = o
        var ret  = new F();
        F.prototype = null;
        return ret;
    },

    callback: function(target, method) {
        if (typeof(method) == 'string') {
            method = target[method];
        }

        return function() {
            method.apply(target, arguments);
        }
    },

    ready: function() {
        if (this._isReady) {
            return
        }

        if (!document.body) {
            setTimeout(function() { sys.ready(); }, 13);
        }

        window.__isReady = true;

        if (window.__readyList) {
            var fn, i = 0;
            while ( (fn = window.__readyList[ i++ ]) ) {
                fn.call(document);
            }

            window.__readyList = null;
            delete window.__readyList;
        }
    },


    /**
     * Adapted from jQuery
     * @ignore
     */
    bindReady: function() {

        if (window.__readyBound) {
            return;
        }

        window.__readyBound = true;

        // Catch cases where $(document).ready() is called after the
        // browser event has already occurred.
        if ( document.readyState === "complete" ) {
            return sys.ready();
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if ( document.addEventListener ) {
            // Use the handy event callback
            //document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            
            // A fallback to window.onload, that will always work
            window.addEventListener( "load", sys.ready, false );

        // If IE event model is used
        } else if ( document.attachEvent ) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            //document.attachEvent("onreadystatechange", DOMContentLoaded);
            
            // A fallback to window.onload, that will always work
            window.attachEvent( "onload", ready );

            // If IE and not a frame
            /*
            // continually check to see if the document is ready
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch(e) {}

            if ( document.documentElement.doScroll && toplevel ) {
                doScrollCheck();
            }
            */
        }
    },



    ApplicationMain: function(appDelegate) {
        var delegate = appDelegate.create();
        if (window.__isReady) {
            delegate.applicationDidFinishLaunching()
        } else {
            if (!window.__readyList) {
                window.__readyList = [];
            }
            window.__readyList.push(function() { delegate.applicationDidFinishLaunching(); });
        }

        sys.bindReady();
    },


    /**
     * Tests if a given object is an Array
     *
     * @param {Array} ar The object to test
     *
     * @returns {Boolean} True if it is an Array, otherwise false
     */
    isArray: function(ar) {
      return ar instanceof Array
          || Array.isArray(ar)
          || (ar && ar !== Object.prototype && isArray(ar.__proto__));
    },


    /**
     * Tests if a given object is a RegExp
     *
     * @param {RegExp} ar The object to test
     *
     * @returns {Boolean} True if it is an RegExp, otherwise false
     */
    isRegExp: function(re) {
      var s = ""+re;
      return re instanceof RegExp // easy case
          || typeof(re) === "function" // duck-type for context-switching evalcx case
          && re.constructor.name === "RegExp"
          && re.compile
          && re.test
          && re.exec
          && s.charAt(0) === "/"
          && s.substr(-1) === "/";
    },


    /**
     * Tests if a given object is a Date
     *
     * @param {Date} ar The object to test
     *
     * @returns {Boolean} True if it is an Date, otherwise false
     */
    isDate: function(d) {
      if (d instanceof Date) return true;
      if (typeof d !== "object") return false;
      var properties = Date.prototype && Object.getOwnPropertyNames(Date.prototype);
      var proto = d.__proto__ && Object.getOwnPropertyNames(d.__proto__);
      return JSON.stringify(proto) === JSON.stringify(properties);
    }

}

sys.extend(Function.prototype, {
    _observing: null,

    observes: function() {
        /*
        var target, key;
        if (typeof(arguments[0]) == 'object') {
            target = arguments[0],
            key = arguments[1];
        } else {
            target = null,
            key = arguments[0];
        }
        */

        if (!this._observing) {
            this._observing = [];
        }
        
        var i;
        for (i = 0; i<arguments.length; i++) {
            this._observing.push(arguments[i]);
        }

        return this;
    },
    property: function() {
        this._isProperty = true;

        return this;
    }
});

sys.extend(String.prototype, /** @scope String.prototype */ {
    /**
     * Create an array of words from a string
     *
     * @returns {String[]} Array of the words in the string
     */
    w: function() {
        return this.split(' ');
    }
});




module.exports = sys;

}};

window.__resources__['/libs/thing.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys');

/** @class */
var Thing = function() { this._init.apply(this, arguments); };

Thing = sys.extend(Thing, /** @scope Thing */ {
    isThing: true,
    _observers: null,
    superclass: null,
	_lastID: 0,

    /**
     * Creates a new instance of this object
     *
     * @returns {Thing} An instance of this object
     */
    create: function() {
        var ret = new this();
        ret.init.apply(ret, arguments);
        return ret;
    },

    extend: function() {
        var newObj = function() {
                this._init.apply(this, arguments);
            },
            args = [],
            i;

        // Copy 'class' methods
        for (x in this) {
            // Don't copy built-ins
            if (!this.hasOwnProperty(x)) {
                continue;
            }

            newObj[x] = this[x];
        }


        // Add given properties to the prototype
        newObj.prototype = sys.beget(this.prototype)
        args.push(newObj.prototype);
        for (i = 0; i<arguments.length; i++) {
            args.push(arguments[i])
        }
        sys.extend.apply(null, args);

        newObj.superclass = this;
        // Create new instance
        return newObj;
    },

    get: function(path) {
        var path = path.split('.'),
            obj = this,
            prop,
            key;

        while (key = path.shift()) {
            prop = obj[key];
            if (prop instanceof Function && prop._isProperty) {
                prop = prop.call(obj, key);
            }

            obj = prop;
        }

        return prop;
    },

    // TODO Handle dot notated path to key
    set: function(key, val) {
        var prop = this[key];
        if (prop instanceof Function && prop._isProperty) {
            return prop.call(this, key, val);
        }



        var oldVal = this.get(key);

        this[key] = val;
        val = this.get(key);

        if (this._observers && this._observers[key]) {
            for (var i = 0; i < this._observers[key].length; i++) {
                var ob = this._observers[key][i];
                if (typeof(ob) == 'string') {
                    this[ob](this, key, val, oldVal);
                } else {
                    ob(this, key, val, oldVal)
                }
            };
        }


        return val;
    },

	// Increment integer value
	inc: function(key) {
		return this.set(key, this.get(key) +1);
	},

	// Decrement integer value
	dec: function(key) {
		return this.set(key, this.get(key) -1);
	},

    addObserver: function(key, callback) {
        if (!this._observers) {
            this._observers = {};
        }
        if (!this._observers[key]) {
            this._observers[key] = [];
        }

        this._observers[key].push(callback);
    }
});

Thing.prototype = {
	id: 0,
    /** @private
     * Initialise the object
     */
    _init: function() {
		this.id = ++Thing._lastID;

        if (this._observingFunctions) {
            var i = 0,
                f;
            for ( ; i<this._observingFunctions.length; i++) {
                f = this._observingFunctions[i];

                this.addObserver(f.property, f.method);
            }
        }
    },

    init: function() {
    },

    /** @function */
    get: Thing.get,
    /** @function */
    set: Thing.set,
    /** @function */
    inc: Thing.inc,
    /** @function */
    dec: Thing.dec,
    /** @function */
    addObserver: Thing.addObserver


};

exports.Thing = Thing;

}};

window.__resources__['/libs/cocos2d/Action.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing;

/** @member cocos
 * @class
 *
 * Base class for Actions
 */
var Action = Thing.extend(/** @scope cocos.Action# */{
    target: null,
    originalTarget: null,

    /**
     * Called every frame with it's delta time.
     *
     * @param {Float} dt The delta time
     */
    step: function(dt) {
        console.log('Action.step() Override me');
    },

    /**
     * Called once per frame.
     *
     * @param {Float} time How much of the animation has played. 0.0 = just started, 1.0 just finished.
     */
    update: function(time) {
        console.log('Action.update() Override me');
    },

    /**
     * Called before the action start. It will also set the target.
     *
     * @param {cocos.Node} target The Node to run the action on
     */
    startWithTarget: function(target) {
        this.target = this.originalTarget = target;
    },

    /**
     * Called after the action has finished. It will set the 'target' to nil.
     * <strong>Important</strong>: You should never call cocos.Action#stop manually.
     * Instead, use cocos.Node#stopAction(action)
     */
    stop: function() {
        this.target = null;
    },

    /** @field
     * Return true if the action has finished
     * 
     * @returns {Boolean} True if action has finished
     */
    isDone: function(key) {
        return true;
    }.property(),


    /**
     * Returns a copy of this Action but in reverse
     *
     * @returns {cocos.Action} A new Action in reverse
     */
    reverse: function() {
    }
});

/** @member cocos
 * @class
 *
 * Repeats an action forever. To repeat the an action for a limited number of
 * times use the cocos.Repeat action.
 *
 * @extends cocos.Action
 */
var RepeatForever = Action.extend(/** @scope cocos.RepeatForever# */{
    other: null,

    /** @ignore */
    init: function(action) {
        arguments.callee.base.call(this);

        this.other = action;
    },

    /** @ignore */
    startWithTarget: function(target) {
        arguments.callee.base.apply(this, arguments);

        this.other.startWithTarget(this.target);
    },

    /** @ignore */
    step :function(dt) {
        this.other.step(dt);
        if (this.other.get('isDone')) {
            var diff = dt - this.other.get('duration') - this.other.get('elapsed');
            this.other.startWithTarget(this.target);

            this.other.step(diff);
        }
    },

    /** @ignore */
    isDone: function() {
        return false;
    },

    /** @ignore */
    reverse: function() {
        return RepeatForever.create(this.other.reverse());
    }
});

/** @member cocos
 * @class
 *
 * Repeats an action a number of times. To repeat an action forever use the
 * cocos.RepeatForever action.
 *
 * @extends cocos.Action
 */
var FiniteTimeAction = Action.extend(/** @scope cocos.FiniteTimeAction# */{
    /**
     * Number of seconds to run the Action for
     * @type Float
     */
    duration: 2,

    /** @ignore */
    reverse: function() {
        console.log('FiniteTimeAction.reverse() Override me');
    }
});

exports.Action = Action;
exports.RepeatForever = RepeatForever;
exports.FiniteTimeAction = FiniteTimeAction;

}};

window.__resources__['/libs/cocos2d/ActionManager.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing,
    Timer = require('./Scheduler').Timer,
    Scheduler = require('./Scheduler').Scheduler;

/** @member cocos
 * @class
 *
 * cocos.ActionManager is a singleton that manages all the actions. Normally you
 * won't need to use this singleton directly. 99% of the cases you will use the
 * cocos.Node interface, which uses this singleton. But there are some cases where
 * you might need to use this singleton. Examples:
 *
 * - When you want to run an action where the target is different from a cocos.Node</li>
 * - When you want to pause / resume the actions
 * 
 *
 */
var ActionManager = Thing.extend(/** @scope cocos.ActionManager# */{
    targets: null,
    currentTarget: null,
    currentTargetSalvaged: null,

    init: function() {
        arguments.callee.base.apply(this, arguments);

        this.targets = [];

        Scheduler.get('sharedScheduler')
          .scheduleTimer(Timer.create({ callback: sys.callback(this, 'tick') }));
    },

    addAction: function(opts) {
        console.log('Adding action with opts: ', opts);

        var targetID = opts['target'].get('id');
        var element = this.targets[targetID];

        if (!element) {
            element = this.targets[targetID] = {
                paused: false,
                target: opts['target'],
                actions: []
            };
        }

        element.actions.push(opts['action']);

        opts['action'].startWithTarget(opts['target']);
    },

    removeAction: function(action) {
        var targetID = action.originalTarget.id,
            element = this.targets[targetID],
            actionIndex = element.actions.indexOf(action);

        console.log('Removing action:', element);
        if (element && actionIndex > -1) {

            if (this.currentTarget == element) {
                element.currentActionSalvaged = true;
            } 
            
            element.actions[actionIndex] = null;
            element.actions.splice(actionIndex, 1); // Delete array item
        } else {
            console.log('cocos2d: removeAction: Target not found');
        }
    },

    removeAllActionsFromTarget: function(target) {
        var targetID = target.get('id');

        var element = this.targets[targetID];
        if (!element) {
            return;
        }

        // Delete everything in array but don't replace it incase something else has a reference
        element.actions.splice(0, element.actions.length-1);
    },

    tick: function(dt) {

        var self = this;
        sys.each(this.targets, function(currentTarget, i) {
            if (!currentTarget) return;
            self.currentTarget = currentTarget;

            if (!currentTarget.paused) {
                sys.each(currentTarget.actions, function(currentAction, j) {
                    if (!currentAction) return;

                    currentTarget.currentAction = currentAction;
                    currentTarget.currentActionSalvaged = false;

                    currentTarget.currentAction.step(dt);

                    if (currentTarget.currentAction.get('isDone')) {
                        currentTarget.currentAction.stop();

                        var a = currentTarget.currentAction;
                        currentTarget.currentAction = null;
                        self.removeAction(a);
                    }

                    currentTarget.currentAction = null;

                });
            }

            if (self.currentTargetSalvaged && currentTarget.actions.length == 0) {
                self.targets[i] = null;
                delete self.targets[i];
            }
        });

        delete self;
    },

    pauseTarget: function(target) {
    },

	resumeTarget: function(target) {
		// TODO
	}
});

sys.extend(ActionManager, /** @scope cocos.ActionManager */{
    /** @field
     * A shared singleton instance of cocos.ActionManager
     * @type cocos.ActionManager
     */
    sharedManager: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.ActionManager = ActionManager;

}};

window.__resources__['/libs/cocos2d/Animation.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing;

/** @member cocos
 * @class
 *
 * A Animation object is used to perform animations on the Sprite objects.
 * 
 * The Animation object contains SpriteFrame objects, and a possible delay between the frames.
 * You can animate a Animation object by using the Animate action. Example:
 * 
 *  sprite.runAction(Animate.create({animation: animation}));
 * 
 */
var Animation = Thing.extend(/** @scope cocos.Animation# */{
    name: null,
    delay: 0.0,
    frames: null,

    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        this.frames = opts['frames'] || [];
        this.delay  = opts['delay']  || 0.0;
    }
});

exports.Animation = Animation;

}};

window.__resources__['/libs/cocos2d/AppDelegate.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var Thing = require('thing').Thing;

exports.AppDelegate = Thing.extend({
    applicationDidFinishLaunching: function() {
    }
});

}};

window.__resources__['/libs/cocos2d/BatchNode.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    geo = require('geometry'),
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
	Node = require('./Node').Node;

/** @member cocos
 * @class
 *
 * @extends cocos.Node
 */
var BatchNode = Node.extend(/** @scope cocos.BatchNode# */{
    contentRect: null,
    renderTextre: null,
	descendants: null,
    dynamicResize: false,

    /** @private
     * Areas that need redrawing
     */
    _dirtyRects: null,

	init: function(opts) {
		arguments.callee.base.apply(this, arguments);

        var size = opts['size'];

		this.descendants = [];
		this._dirtyRects = [];

        this.contentRect = geo.rectMake(0, 0, 0, 0);
	},

    addChild: function(opts) {
        arguments.callee.base.apply(this, arguments);

        var child = opts['child'];

        // TODO create or enlarge renderTexture to accommodate new child
        if (this.children.length == 1) {
            // Only 1 child, so content rect is exactly that
            this.set('contentRect', {size: sys.copy(child.get('contentSize')), origin: sys.copy(child.get('position'))});
        }
        
    },

    _didUpdateContentRect: function(obj, key, val, oldVal) {
        if (geo.rectEqualToRect(val, oldVal)) {
            return; // No change
        }
        this.set('contentSize', this.contentRect.size);

        // Resize render texture
        // TODO Copy current renderTexture image
        // TODO Clear renderTexture
        // TODO Resize renderTexture
        // TODO Draw previous image -- adjust origin if it changed
    }.observes('contentRect'),

    update: function() {

    },

	// Don't call visit/draw on child nodes
    visit: function(context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Adjust origin to account of contentRect.origin
        context.translate(this.contentRect.origin.x, this.contentRect.origin.y);

        this.draw(context);

        context.restore();
	},

	draw: function(ctx) {
        arguments.callee.base.apply(this, arguments);
    }
});

exports.BatchNode = BatchNode;

}};

window.__resources__['/libs/cocos2d/Director.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing,
    ccp = require('geometry').ccp,
    Scheduler = require('./Scheduler').Scheduler,
    EventDispatcher = require('./EventDispatcher').EventDispatcher,
    Scene = require('./Scene').Scene;

/** @member cocos
 * @class
 *
 * Creates and handles the main view and manages how and when to execute the
 * Scenes.
 *
 * This class is a singleton so don't instantiate it yourself, instead use
 * cocos.Director.get('sharedDirector') to return the instance.
 */
var Director = Thing.extend(/** @scope cocos.Director# */{
    canvas: null,
    context: null,
    sceneStack: null,
    winSize: null,
    isPaused: false,

    // Time delta
    dt: 0,
    nextDeltaTimeZero: false,
    lastUpdate: 0,

    _nextScene:null,

    init: function() {
        this.set('sceneStack', []);
    },

    /**
     * Append to a HTML element. It will create a canvas tag
     */
    attachInView: function(view) {
        if (!view.tagName) {
            throw "Director.attachInView must be given a HTML DOM Node";
        }

        while (view.firstChild) {
            view.removeChild(view.firstChild);
        }

        var canvas = this.set('canvas', document.createElement('canvas'));
        canvas.setAttribute('width', view.clientWidth);
        canvas.setAttribute('height', view.clientHeight);

        var context = this.set('context', canvas.getContext('2d'));

        view.appendChild(canvas);

        this.set('winSize', {width: view.clientWidth, height: view.clientHeight});


        // Setup event handling

        // Mouse events
        var eventDispatcher = EventDispatcher.get('sharedDispatcher');
        function mouseDown(evt) {
            evt.locationInWindow = ccp(evt.offsetX, evt.offsetY);

            function mouseDragged(evt) {
                evt.locationInWindow = ccp(evt.offsetX, evt.offsetY);

                eventDispatcher.mouseDragged(evt);
            };
            function mouseUp(evt) {
                evt.locationInWindow = ccp(evt.offsetX, evt.offsetY);

                document.body.removeEventListener('mousemove', mouseDragged, false);
                document.body.removeEventListener('mouseup',   mouseUp,   false);


                eventDispatcher.mouseUp(evt);
            };

            document.body.addEventListener('mousemove', mouseDragged, false);
            document.body.addEventListener('mouseup',   mouseUp,   false);

            eventDispatcher.mouseDown(evt);
        }
        function mouseMoved(evt) {
            evt.locationInWindow = ccp(evt.offsetX, evt.offsetY);

            eventDispatcher.mouseMoved(evt);
        }
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mousemove', mouseMoved, false);

        /*
        // Keyboard events
        var keyboardDispatcher = KeyboardDispatcher.get('sharedDispatcher');
        function keyDown(evt) {
            keyboardDispatcher.keyDown({event: evt})
        }
        function keyUp(evt) {
            keyboardDispatcher.keyUp({event: evt})
        }
        function keyPress(evt) {
            keyboardDispatcher.keyPress({event: evt})
        }
        document.documentElement.addEventListener('keydown', keyDown, false);
        document.documentElement.addEventListener('keyup', keyUp, false);
        document.documentElement.addEventListener('keypress', keyPress, false);
        */
    },

    /**
     * Enters the Director's main loop with the given Scene. Call it to run
     * only your FIRST scene. Don't call it if there is already a running
     * scene.
     *
     * @param {cocos.Scene} scene The scene to start
     */
    runWithScene: function(scene) {
        if (!(scene instanceof Scene)) {
            throw "Director.runWithScene must be given an instance of Scene";
        }

        if (this._runningScene) {
            throw "You can't run an scene if another Scene is running. Use replaceScene or pushScene instead"
        }

        this.pushScene(scene);
        this.startAnimation();
    },

    /**
     * Replaces the running scene with a new one. The running scene is
     * terminated. ONLY call it if there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to replace with
     */
    replaceScene: function(scene) {
        var index = this.sceneStack.length;

        this._sendCleanupToScene = true;
        this.sceneStack.pop();
        this.sceneStack.push(scene);
        this._nextScene = scene;
    },

    /**
     * Pops out a scene from the queue. This scene will replace the running
     * one. The running scene will be deleted. If there are no more scenes in
     * the stack the execution is terminated. ONLY call it if there is a
     * running scene.
     */
    popScene: function() {
    },

    /**
     * Suspends the execution of the running scene, pushing it on the stack of
     * suspended scenes. The new scene will be executed. Try to avoid big
     * stacks of pushed scenes to reduce memory allocation. ONLY call it if
     * there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to add to the stack
     */
    pushScene: function(scene) {
        this._nextScene = scene;
    },

    /**
     * The main loop is triggered again. Call this function only if
     * cocos.Directory#stopAnimation was called earlier.
     */
    startAnimation: function() {
        animationInterval = 1.0/30;
        this._animationTimer = setInterval(sys.callback(this, 'mainLoop'), animationInterval * 1000);
    },

    /**
     * Stops the animation. Nothing will be drawn. The main loop won't be
     * triggered anymore. If you want to pause your animation call
     * cocos.Directory#pause instead.
     */
    stopAnimation: function() {
    },

    /**
     * Calculate time since last call
     * @private
     */
    calculateDeltaTime: function() {
        var now = (new Date).getTime() /1000;

        if (this.nextDeltaTimeZero) {
            this.dt = 0;
            this.nextDeltaTimeZero = false;
        }

        this.dt = Math.max(0, now - this.lastUpdate);

        this.lastUpdate = now;
    },

    /**
     * The main run loop
     * @private
     */
    mainLoop: function() {
        this.calculateDeltaTime();

        if (!this.isPaused) {
            Scheduler.get('sharedScheduler').tick(this.dt);
        }


        var context = this.get('context');
        context.fillStyle = 'rgb(0, 0, 0)';
        context.fillRect(0, 0, this.winSize.width, this.winSize.height);

        if (this._nextScene) {
            this.setNextScene();
        }

        this._runningScene.visit(context);

        this.displayFPS();
    },

    /**
     * Initialises the next scene
     * @private
     */
    setNextScene: function() {
        // TODO transitions

        if (this._runningScene) {
            this._runningScene.onExit();
            if (this._sendCleanupToScene) {
                this._runningScene.cleanup();
            }
        }

        this._runningScene = this._nextScene;

        this._nextScene = null;

        this._runningScene.onEnter();
    },

    /** @field
     * Whether or not to display the FPS on the bottom-left corner
     * @type Boolean
     */
    displayFPS: function() {
    }.property(),

    convertEventToCanvas: function(evt) {
        return evt.locationInWindow;
    }

});

/**
 * Class methods
 */
sys.extend(Director, /** @scope cocos.Director */{
    /** @field
     * A shared singleton instance of cocos.Director
     * @type cocos.Director
     */
    sharedDirector: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.Director = Director;

}};

window.__resources__['/libs/cocos2d/EventDispatcher.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing;

/** @member cocos
 * @class
 *  
 *  This is object is responsible for dispatching the events:
 * 	    - Mouse events
 * 	    - Keyboard events
 */
var EventDispatcher = Thing.extend(/** @scope cocos.EventDispatcher# */ {
    dispatchEvents: true,
    keyboardDelegates: null,
    mouseDelegates: null,
    
    init: function() {
        arguments.callee.base.apply(this, arguments);

        this.keyboardDelegates = [];
        this.mouseDelegates = [];
    },

    addDelegate: function(opts) {
        var delegate = opts['delegate'],
            priority = opts['priority'],
            flags    = opts['flags'],
            list     = opts['list'];

        var listElement = {
            delegate: delegate,
            priority: priority,
            flags: flags
        };

        var added = false;
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            if (priority < elem.priority) {
                // Priority is lower, so insert before elem
                list.splice(i, 0, listElement);
                added = true;
                break;
            }
        }

        // High priority; append to array
        if (!added) {
            list.push(listElement);
        }
    },

    removeDelegate: function(opts) {
        var delegate = opts['delegate'],
            list = opts['list'];

        var idx = -1,
            i;
        for (i = 0; i < list.length; i++) {
            var l = list[i];
            if (l.delegate == delegate) {
                idx = i;
                break;
            }
        }
        if (idx == -1) {
            return;
        }
        list.splice(idx, 1);
    },
    removeAllDelegates: function(opts) {
        var list = opts['list'];

        list.splice(0, list.length -1);
    },

    addMouseDelegate: function(opts) {
        var delegate = opts['delegate'],
            priority = opts['priority'];

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list:this.mouseDelegates});
    },

    removeMouseDelegate: function(opts) {
        var delegate = opts['delegate'];

        this.removeDelegate({delegate: delegate, list:this.mouseDelegates});
    },

    removeAllMouseDelegate: function() {
        this.removeAllDelegates({list:this.mouseDelegates});
    },


    // Mouse Events

    mouseDown: function(evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDown) {
                var swallows = entry.delegate.mouseDown(evt);
                if (swallows) {
                    break;
                }
            }
        };
    },
    mouseMoved: function(evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseMoved) {
                var swallows = entry.delegate.mouseMoved(evt);
                if (swallows) {
                    break;
                }
            }
        };
    },
    mouseDragged: function(evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDragged) {
                var swallows = entry.delegate.mouseDragged(evt);
                if (swallows) {
                    break;
                }
            }
        };
    },
    mouseUp: function(evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseUp) {
                var swallows = entry.delegate.mouseUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    }

});

/**
 * Class methods
 */
sys.extend(EventDispatcher, /** @scope cocos.EventDispatcher */{
    /** @field */
    sharedDispatcher: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});
exports.EventDispatcher = EventDispatcher;

}};

window.__resources__['/libs/cocos2d/index.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    path = require('path');

var modules = 'Node Layer Scene Label Sprite SpriteFrame Director Action IntervalAction Animation Scheduler ActionManager TMXTiledMap TMXXMLParser BatchNode SpriteSheet RenderTexture Menu MenuItem AppDelegate KeyboardDispatcher'.split(' ');

/** @namespace */
var cocos = {};

sys.each(modules, function(mod, i) {
    sys.extend(cocos, require('./' + mod));
});

module.exports = cocos;

}};

window.__resources__['/libs/cocos2d/IntervalAction.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

/** @member cocos
 * @class
 *
 * Base class actions that do have a finite time duration. 
 *
 * Possible actions:
 *
 * - An action with a duration of 0 seconds
 * - An action with a duration of 35.5 seconds Infinite time actions are valid
 *
 * @extends cocos.FiniteTimeAction
 */
var IntervalAction = act.FiniteTimeAction.extend(/** @scope cocos.IntervalAction# */{
    /**
     * Number of seconds that have elapsed
     * @type Float
     */
    elapsed: 0.0,

    /** @private
     * @ignore
     */
    _firstTick: true,

    /** @ignore */
    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        var dur = opts['duration'] || 0;
        if (dur == 0) {
            dur = 0.0000001;
        }

        this.set('duration', dur);
        this.set('elapsed', 0);
        this._firstTick = true;
    },

    /** @ignore */
    isDone: function() {
        return (this.elapsed >= this.duration);
    },

    /** @ignore */
    step: function(dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.update(Math.min(1, this.elapsed/this.duration));
    },

    /** @ignore */
    startWithTarget: function(target) {
        arguments.callee.base.apply(this, arguments);

        this.elapsed = 0.0;
        this._firstTick = true;
    },

    /** @ignore */
    reverse: function() {
        throw "Reverse Action not implemented"
    }
});

/** @member cocos
 * @class
 *
 * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
 *
 * @extends cocos.IntervalAction
 */
var ScaleTo = IntervalAction.extend(/** @scope cocos.ScaleTo# */{
    /**
     * Current X Scale
     * @type Float
     */
    scaleX: 1,

    /**
     * Current Y Scale
     * @type Float
     */
    scaleY: 1,

    /**
     * Initial X Scale
     * @type Float
     */
    startScaleX: 1,

    /**
     * Initial Y Scale
     * @type Float
     */
    startScaleY: 1,

    /**
     * Final X Scale
     * @type Float
     */
    endScaleX: 1,

    /**
     * Final Y Scale
     * @type Float
     */
    endScaleY: 1,

    /**
     * Delta X Scale
     * @type Float
     * @private
     */
    deltaX: 0.0,

    /**
     * Delta Y Scale
     * @type Float
     * @private
     */
    deltaY: 0.0,

    /** @ignore */
    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        if (opts['scale'] != undefined) {
            this.endScaleX = this.endScaleY = opts['scale'];
        } else {
            this.endScaleX = opts['scaleX'];
            this.endScaleY = opts['scaleY'];
        }


    },

    /** @ignore */
    startWithTarget: function(target) {
        arguments.callee.base.apply(this, arguments);

        this.startScaleX = this.target.get('scaleX');
        this.startScaleY = this.target.get('scaleY');
        this.deltaX = this.endScaleX - this.startScaleX;
        this.deltaY = this.endScaleY - this.startScaleY;
    },

    /** @ignore */
    update: function(t) {
        if (!this.target) {
            return;
        }
        
        this.target.set('scaleX', this.startScaleX + this.deltaX * t);
        this.target.set('scaleY', this.startScaleY + this.deltaY * t);
    }
});

/** @member cocos
 * @class
 *
 * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
 *
 * @extends cocos.ScaleTo
 */
var ScaleBy = ScaleTo.extend(/** @scope cocos.ScaleBy# */{
    /** @ignore */
    startWithTarget: function(target) {
        arguments.callee.base.apply(this, arguments);

        this.deltaX = this.startScaleX * this.endScaleX - this.startScaleX;
        this.deltaY = this.startScaleY * this.endScaleY - this.startScaleY;
    },

    /** @ignore */
    reverse: function() {
        return ScaleBy.create({duration: this.duration, scaleX:1/this.endScaleX, scaleY:1/this.endScaleY});
    }
});


/** @member cocos
 * @class
 *
 * Rotates a cocos.Node object to a certain angle by modifying its rotation
 * attribute. The direction will be decided by the shortest angle.
 *
 * @extends cocos.IntervalAction
 */
var RotateTo = IntervalAction.extend(/** @scope cocos.RotateTo# */{
    /**
     * Final angle
     * @type Float
     */
    dstAngle: 0,

    /**
     * Initial angle
     * @type Float
     */
    startAngle: 0,

    /**
     * Angle delta
     * @type Float
     */
    diffAngle: 0,

    /** @ignore */
    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        this.dstAngle = opts['angle'];
    },

    /** @ignore */
    startWithTarget: function(target) {
        arguments.callee.base.apply(this, arguments);

        this.startAngle = target.get('rotation');

        if (this.startAngle > 0) {
            this.startAngle = (this.startAngle % 360);
        } else {
            this.startAngle = (this.startAngle % -360);
        }

        this.diffAngle = this.dstAngle - this.startAngle;
        if (this.diffAngle > 180) {
            this.diffAngle -= 360;
        } else if (this.diffAngle < -180) {
            this.diffAngle += 360;
        }
    },

    /** @ignore */
    update: function(t) {
        this.target.set('rotation', this.startAngle + this.diffAngle * t);
    }
});

/** @member cocos
 * @class
 *
 * Rotates a cocos.Node object to a certain angle by modifying its rotation
 * attribute. The direction will be decided by the shortest angle.
 *
 * @extends cocos.RotateTo
 */
var RotateBy = RotateTo.extend(/** @scope cocos.RotateBy# */{
    /**
     * Number of degrees to rotate by
     * @type Float
     */
    angle: 0,

    /** @ignore */
    init: function(opts) {
        this.angle = opts['angle'];
    },

    /** @ignore */
    startWithTarget: function(target) {
        arguments.callee.base.apply(this, arguments);

        this.startAngle = this.target.get('rotation');
    },

    /** @ignore */
    update: function(t) {
        this.target.set('rotation', this.startAngle + this.angle *t);
    },

    /** @ignore */
    reverse: function() {
        return RotateBy.create({duration: this.duration, angle: -this.angle});
    }
});



/** @member cocos
 * @class
 *
 * Runs actions sequentially, one after another
 *
 * @extends cocos.IntervalAction
 */
var Sequence = IntervalAction.extend(/** @scope cocos.Sequence# */{
    /**
     * Array of actions to run
     * @type cocos.Node[]
     */
    actions: null,

    /**
     * The array index of the currently running action
     * @type Integer
     */
    currentActionIndex: 0,

    /**
     * The duration when the current action finishes
     * @type Float
     */
    currentActionEndDuration: 0,

    /** @ignore */
    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        this.actions = sys.copy(opts['actions']);
        this.actionSequence = {};
        
        sys.each(this.actions, sys.callback(this, function(action) {
            this.duration += action.duration;
        }));
    },

    /** @ignore */
    startWithTarget: function(target) {
        arguments.callee.base.apply(this, arguments);
        this.currentActionIndex = 0;
        this.currentActionEndDuration = this.actions[0].get('duration');
        this.actions[0].startWithTarget(this.target);
    },

    /** @ignore */
    stop: function() {
        sys.each(this.actions, function(action) {
            action.stop();
        });

        arguments.callee.base.apply(this, arguments);
    },

    /** @ignore */
    step: function(dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.actions[this.currentActionIndex].step(dt);
        this.update(Math.min(1, this.elapsed/this.duration));
    },

    /** @ignore */
    update: function(dt) {
        // Action finished onto the next one
        if (this.elapsed > this.currentActionEndDuration) {
            var previousAction = this.actions[this.currentActionIndex];
            previousAction.update(1.0);
            previousAction.stop();


            this.currentActionIndex++;

            if (this.currentActionIndex < this.actions.length) {
                var currentAction = this.actions[this.currentActionIndex];
                currentAction.startWithTarget(this.target);

                this.currentActionEndDuration += currentAction.duration;
            }
        }
    }
});

/** @member cocos
 * @class
 *
 * Animates a sprite given the name of an Animation 
 *
 * @extends cocos.IntervalAction
 */
var Animate = IntervalAction.extend(/** @scope cocos.Animate# */{
    animation: null,
    restoreOriginalFrame: false,
    origFrame: null,

    /** @ignore */
    init: function(opts) {
        this.animation = opts['animation'];
        opts['duration'] = this.animation.frames.length * this.animation.delay;

        arguments.callee.base.apply(this, arguments);
    },

    /** @ignore */
    startWithTarget: function(target) {
        arguments.callee.base.apply(this, arguments);

        if (this.restoreOriginalFrame) {
            this.set('origFrame', this.target.get('displayedFrame'));
        }
    },

    /** @ignore */
    update: function(t) {
        var frames = this.animation.get('frames'),
            numberOfFrames = frames.length,
            idx = Math.floor(t * numberOfFrames);

        if (idx >= numberOfFrames) {
            idx = numberOfFrames -1;
        }

        var sprite = this.target;
        if (!sprite.isFrameDisplayed(frames[idx])) {
            sprite.set('displayFrame', frames[idx]);
        }
    },

    /** @ignore */
    reverse: function() {
    }
});

exports.IntervalAction = IntervalAction;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.RotateTo = RotateTo;
exports.RotateBy = RotateBy;
exports.Sequence = Sequence;
exports.Animate = Animate;

}};

window.__resources__['/libs/cocos2d/KeyboardDispatcher.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing;

var KeyboardDispatcher = Thing.extend({
    firstResponder: null,
    downKeys: null,

    init: function() {
        this.downKeys = [];
    },

    makeFirstResponder: function(responder) {
        if (this.firstResponder && !this.firstResponder.resignFirstResponder()) {
            return false;
        }

        if (responder && !responder.becomeFirstResponder()) {
            return false
        }

        this.set('firstResponder', responder);

        return true;
    },

    keyUp: function(opts) {
        var event = opts['event'];
        var keyCode = event.keyCode;

        var pos = this.downKeys.indexOf(keyCode);
        if (pos > -1) {
            delete this.downKeys[pos];
        }

        if (this.firstResponder && this.firstResponder.keyUp) {
            this.firstResponder.keyUp({keyCode: keyCode, event: event});
        }

    },

    keyDown: function(opts) {
        var event = opts['event'];
        
        var keyCode = event.keyCode;

        // Key is still being held down
        if (this.downKeys.indexOf(keyCode) > -1) {
            return;
        }

        this.downKeys.push(keyCode);

        if (this.firstResponder && this.firstResponder.keyDown) {
            this.firstResponder.keyDown({keyCode: keyCode, event: event});
        }
    },

    keyPress: function(opts) {
        var event = opts['event'];
        var keyCode = event.keyCode;

        if (keyCode >= 97) {
            keyCode -= 32;
        }

        if (this.firstResponder && this.firstResponder.keyPress) {
            this.firstResponder.keyPress({keyCode: keyCode, event: event});
        }
    }
});

/**
 * Class methods
 */
sys.extend(KeyboardDispatcher, {
    sharedDispatcher: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.KeyboardDispatcher = KeyboardDispatcher;

}};

window.__resources__['/libs/cocos2d/Label.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Director = require('./Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

/** @member cocos
 * @class
 *
 * Renders a text label
 *
 * @extends cocos.Node
 */
var Label = Node.extend(/** @scope cocos.Label# */{
    string:   '',
    fontName: 'Helvetica',
    fontSize: 16,
    fontColor: 'white',

    /** @ignore */
    init: function(args) {
        arguments.callee.base.apply(this, arguments);

        sys.each('fontSize fontName fontColor string'.w(), sys.callback(this, function(name) {
            if (args[name]) {
                this.set(name, args[name]);
            }
        }));
    },

    /** @field
     * The font to use
     * @type String
     */
    font: function(key) {
        return this.get('fontSize') + 'px ' + this.get('fontName');
    }.property(),

    draw: function(context) {
        context.fillStyle = this.get('fontColor');
        context.font = this.get('font');
        context.textBaseline = 'top';
        if (context.fillText) {
            context.fillText(this.get('string'), 0, 0);
        } else if (context.mozDrawText) {
            context.mozDrawText(this.get('string'));
        }
    },

    /**
     * @private
     */
    _updateLabelContentSize: function() {
        var ctx = Director.get('sharedDirector.context');
        var size = {width: 0, height: this.get('fontSize')};

        var prevFont = ctx.font;
        ctx.font = this.get('font');

        if (ctx.measureText) {
            var txtSize = ctx.measureText(this.get('string'));
            size.width = txtSize.width;
        } else if (ctx.mozMeasureText) {
            size.width = ctx.mozMeasureText(this.get('string'));
        }

        ctx.font = prevFont;

        this.set('contentSize', size);

        console.log(size.width, size.height);
    }.observes('string', 'fontName', 'fontSize')
});

module.exports.Label = Label;

}};

window.__resources__['/libs/cocos2d/Layer.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var Node = require('./Node').Node,
    Director = require('./Director').Director,
    EventDispatcher = require('./EventDispatcher').EventDispatcher;

/** @member cocos
 * @class
 */
var Layer = Node.extend(/** @scope cocos.Layer# */{
    isMouseEnabled: false,
    mouseDelegatePriority: 0,

    init: function() {
        arguments.callee.base.apply(this, arguments);

        var s = Director.get('sharedDirector.winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);
    },

    onEnter: function() {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority:this.get('mouseDelegatePriority')});
        }

        arguments.callee.base.apply(this, arguments);
    },

    onExit: function() {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
        }

        arguments.callee.base.apply(this, arguments);
    },

    _updateIsMouseEnabled: function() {
        if (this.isRunning) {
            if (this.isMouseEnabled) {
                EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority:this.get('mouseDelegatePriority')});
            } else {
                EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
            }
        }
    }.observes('isMouseEnabled')
});

module.exports.Layer = Layer;

}};

window.__resources__['/libs/cocos2d/Menu.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Layer = require('./Layer').Layer,
    Director = require('./Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    geom = require('geometry'), ccp = geom.ccp;

/** @private
 * @constant */
var kMenuStateWaiting = 0;

/** @private
 * @constant */
var kMenuStateTrackingTouch = 1;
	

/** @member cocos
 * @class
 *
 * @extends cocos.Layer
 */
var Menu = Layer.extend(/** @scope cocos.Menu# */{
	mouseDelegatePriority: (-Number.MAX_VALUE +1),
	state: kMenuStateWaiting,
	selectedItem: null,
	opacuty: 255,
	color: null,

	init: function(opts) {
		arguments.callee.base.apply(this, arguments);

		var items = opts['items'];

		this.set('isMouseEnabled', true);
		
        var s = Director.get('sharedDirector.winSize');

		this.set('isRelativeAnchorPoint', false);
		this.anchorPoint = ccp(0.5, 0.5);
		this.set('contentSize', s);

		this.set('position', ccp(s.width /2, s.height /2));


		if (items) {
			var z = 0;
			sys.each(items, sys.callback(this, function(item) {
				this.addChild({child: item, z:z++});
			}));
		}

        
	},

	addChild: function(opts) {
		if (!opts['child'] instanceof MenuItem) {
			throw "Menu only supports MenuItem objects as children";
		}

		return arguments.callee.base.apply(this, arguments);
    },

    itemForMouseEvent: function(event) {
        var location = Director.get('sharedDirector').convertEventToCanvas(event);

        var children = this.get('children');
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i];

            if (item.get('visible') && item.get('isEnabled')) {
                var local = item.convertToNodeSpace(location);
                
                var r = item.get('rect');
                r.origin = ccp(0, 0);

                if (geom.rectContainsPoint(r, local)) {
                    return item;
                }

            }
        }

        return null;
    },

    mouseUp: function(event) {
        if (this.selectedItem) {
            this.selectedItem.set('isSelected', false);
            this.selectedItem.activate();

            this.set('state', kMenuStateWaiting);

            return true;
        }

        return false;

    },
    mouseDown: function(event) {

        if (this.state != kMenuStateWaiting || !this.visible) {
            return false;
        }

        var selectedItem = this.set('selectedItem', this.itemForMouseEvent(event));
        if (selectedItem) {
            selectedItem.set('isSelected', true);
            this.set('state', kMenuStateTrackingTouch);

            return true;
        }

        return false;
    },
    mouseDragged: function(event) {
        var currentItem = this.itemForMouseEvent(event);

        if (currentItem != this.selectedItem) {
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', false);
            }
            this.set('selectedItem', currentItem);
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', true);
            }
        }

        if (currentItem && state == kMenuStateTrackingTouch) {
            return true;
        }

        return false;
        
    }

});

exports.Menu = Menu;

}};

window.__resources__['/libs/cocos2d/MenuItem.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Node = require('./Node').Node,
    rectMake = require('geometry').rectMake,
    ccp = require('geometry').ccp;

/** @member cocos
 * @class
 *
 * @extends cocos.Node
 */
var MenuItem = Node.extend(/** @scope cocos.MenuItem# */{
	isEnabled: true,
	isSelected: false,
	callback: null,

	init: function(opts) {
		arguments.callee.base.apply(this, arguments);

		var callback = opts['callback'];

		this.set('anchorPoint', ccp(0.5, 0.5));
		this.set('callback', callback);
	},

	activate: function() {
		if (this.isEnabled && this.callback) {
			this.callback(this);
		}
	},

	rect: function() {
		return rectMake(
			this.position.x - this.contentSize.width  * this.anchorPoint.x,
			this.position.y - this.contentSize.height * this.anchorPoint.y,
			this.contentSize.width,
			this.contentSize.height
		)
	}.property()
});

/** @member cocos
 * @class
 *
 * @extends cocos.MenuItem
 */
var MenuItemSprite = MenuItem.extend(/** @scope cocos.MenuItemSprite# */{
	normalImage: null,
	selectedImage: null,
	disabledImage: null,

	init: function(opts) {
		arguments.callee.base.apply(this, arguments);

		var normalImage   = opts['normalImage'],
			selectedImage = opts['selectedImage'],
			disabledImage = opts['disabledImage'];

		this.set('normalImage', normalImage);
		this.set('selectedImage', selectedImage);
		this.set('disabledImage', disabledImage);

		this.set('contentSize', normalImage.get('contentSize'));
	},

	draw: function(ctx) {
		if (this.isEnabled) {
			if (this.isSelected) {
				this.selectedImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		} else {
			if (this.disabledImage != null) {
				this.disabledImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		}
	}
});

/** @member cocos
 * @class
 *
 * @extends cocos.MenuItemSprite
 */
var MenuItemImage = MenuItemSprite.extend(/** @scope cocos.MenuItemImage# */{
	init: function(opts) {
		var normalI   = opts['normalImage'],
			selectedI = opts['selectedImage'],
			disabledI = opts['disabledImage'],
			callback  = opts['callback'];

		var normalImage = Sprite.create({file: normalI}),
			selectedImage = Sprite.create({file: selectedI}),
			disabledImage = null;

		if (disabledI) {
			disabledImage = Sprite.create({file: disabledI})
		}

		return arguments.callee.base.call(this, {normalImage: normalImage, selectedImage: selectedImage, disabledImage: disabledImage, callback: callback});
	}
});

exports.MenuItem = MenuItem;
exports.MenuItemImage = MenuItemImage;
exports.MenuItemSprite = MenuItemSprite;

}};

window.__resources__['/libs/cocos2d/Node.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing,
    Scheduler = require('./Scheduler').Scheduler,
    ActionManager = require('./ActionManager').ActionManager,
    geom = require('geometry'), ccp = geom.ccp;

/** @member cocos
 * @class
 *
 * The base class all visual elements extend from
 */
var Node = Thing.extend(/** @scope cocos.Node# */{
    isCocosNode: true,
    visible: true,
    position: null,
    parent: null,
    tag: null,
    contentSize: null,
    zOrder: 0,
    anchorPoint: null,
    anchorPointInPixels: null,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    isRunning: false,
    isRelativeAnchorPoint: true,

    isTransformDirty: true,
    isInverseDirty: true,
    inverse: null,
    transformMatrix: null,

    /**
     * The child Nodes
     * @property {cocos.Node[]}
     */
    children: null,

    /**
     * Initializes the object
     */
    init: function() {
        this.contentSize = {width: 0, height: 0};
        this.anchorPoint = ccp(0.5, 0.5);
        this.anchorPointInPixels = ccp(0, 0);
        this.position = ccp(0,0);
        this.children = [];
    },

    /** @private
     * Calculates the anchor point in pixels and updates the
     * anchorPointInPixels property
     */
    _updateAnchorPointInPixels: function() {
        this.anchorPointInPixels = ccp(this.contentSize.width * this.anchorPoint.x, this.contentSize.height * this.anchorPoint.y);
    }.observes('anchorPoint', 'contentSize'),

    /**
     * Add a child Node
     * @param {Object} params Parameters
     * @param {cocos.Node} params.child The child node to add
     *
     * @returns {cocos.Node} The parent node; 'this'.
     */
    addChild: function(params) {
        if (params.isCocosNode) {
            return arguments.callee.call(this, {child:params});
        }

        var child = params['child'],
            z = params['z'],
            tag = params['tag'];

        if (z == undefined) {
            z = child.get('zOrder');
        }

        //this.insertChild({child: child, z:z});
        var added = false;

        sys.each(this.children, sys.callback(this, function(a, i) {
            if (a.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                return;
            }
        }));

        if (!added) {
            this.children.push(child);
        }

        child.set('tag', tag);
        child.set('zOrder', z);
        child.set('parent', this);

        if (this.isRunning) {
            child.onEnter();
        }

        return this;
    },
    getChild: function(opts) {
        var tag = opts['tag'];

        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].tag == tag) {
                return this.children[i];
            }
        }

        return null;
    },

    removeChild: function(opts) {
        // TODO
    },

    draw: function(context) {
        // All draw code goes here
    },

    scale: function(key, val) {
        if (val != undefined) {
            this.set('scaleX', val);
            this.set('scaleY', val);
        }

        if (this.scaleX != this.scaleY) {
            throw "scaleX and scaleY aren't identical"
        }

        return this.scaleX;
    }.property(),

    onEnter: function() {
        sys.each(this.children, function(child) { child.onEnter(); });

        this.resumeSchedulerAndActions();
        this.set('isRunning', true);
    },
    onExit: function() {
        this.pauseSchedulerAndActions();
        this.set('isRunning', false);

        sys.each(this.children, function(child) { child.onExit(); });
    },

    cleanup: function() {
        this.stopAllActions();
        this.unscheduleAllSelectors();
        sys.each(this.children, function(child) { child.cleanup(); });
    },

    resumeSchedulerAndActions: function() {
        Scheduler.get('sharedScheduler').resumeTarget(this);
        ActionManager.get('sharedManager').resumeTarget(this);
    },
    pauseSchedulerAndActions: function() {
        Scheduler.get('sharedScheduler').pauseTarget(this);
        ActionManager.get('sharedManager').pauseTarget(this);
    },
    unscheduleAllSelectors: function() {
        Scheduler.get('sharedScheduler').unscheduleAllSelectorsForTarget(this);
    },
    stopAllActions: function() {
        ActionManager.get('sharedManager').removeAllActionsFromTarget(this);
    },

    visit: function(context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Draw background nodes
        sys.each(this.children, function(child, i) {
            if (child.zOrder < 0) {
                child.visit(context);
            }
        });

        this.draw(context);

        // Draw foreground nodes
        sys.each(this.children, function(child, i) {
            if (child.zOrder >= 0) {
                child.visit(context);
            }
        });

        context.restore();
    },
    transform: function(context) {
        // Translate
        if (this.isRelativeAnchorPoint && (this.anchorPointInPixels.x != 0 || this.anchorPointInPixels != 0)) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }

        if (this.anchorPointInPixels.x != 0 || this.anchorPointInPixels != 0) {
            context.translate(Math.round(this.position.x + this.anchorPointInPixels.x), Math.round(this.position.y + this.anchorPointInPixels.y));
        } else {
            context.translate(Math.round(this.position.x), Math.round(this.position.y));
        }

        // Rotate
        context.rotate(geom.degressToRadians(this.get('rotation')));

        // Scale
        context.scale(this.scaleX, this.scaleY);
 
        if (this.anchorPointInPixels.x != 0 || this.anchorPointInPixels != 0) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }
    },

    runAction: function(action) {
        ActionManager.get('sharedManager').addAction({action: action, target: this, paused: this.get('isRunning')});
    },

    nodeToParentTransform: function() {
        if (this.isTransformDirty) {
            this.transformMatrix = geom.affineTransformIdentity();

            if (!this.isRelativeAnchorPoint && !geom.pointEqualToPoint(this.anchorPointInPixels, ccp(0,0))) {
                this.transformMatrix = geom.affineTransformTranslate(this.transformMatrix, this.anchorPointInPixels.x, this.anchorPointInPixels.y);
            }
            
            if(!geom.pointEqualToPoint(this.position, ccp(0,0))) {
                this.transformMatrix = geom.affineTransformTranslate(this.transformMatrix, this.position.x, this.position.y);
            }

            if(this.rotation != 0) {
                this.transformMatrix = geom.affineTransformRotate(this.transformMatrix, -geom.degressToRadians(this.rotation));
            }
            if(!(this.scaleX == 1 && this.scaleY == 1)) {
                this.transformMatrix = geom.affineTransformScale(this.transformMatrix, this.scaleX, this.scaleY);
            }
            
            if(!geom.pointEqualToPoint(this.anchorPointInPixels, ccp(0,0))) {
                this.transformMatrix = geom.affineTransformTranslate(this.transformMatrix, -this.anchorPointInPixels.x, -this.anchorPointInPixels.y);
            }
            
            this.isTransformDirty = false;
                
        }

        return this.transformMatrix;
    },

    parentToNodeTransform: function() {
        // TODO
    },

    nodeToWorldTransform: function() {
        var t = this.nodeToParentTransform();

        var p;
        for (p = this.get('parent'); p; p = p.get('parent')) {
            t = geom.affineTransformConcat(t, p.nodeToParentTransform());
        }

        return t;
    },

    worldToNodeTransform: function() {
        return geom.affineTransformInvert(this.nodeToWorldTransform());
    },

    convertToNodeSpace: function(worldPoint) {
        return geom.pointApplyAffineTransform(worldPoint, this.worldToNodeTransform());
    },

    acceptsFirstResponder: function() {
        return false;
    }.property(),

    becomeFirstResponder: function() {
        return true;
    },

    resignFirstResponder: function() {
        return true;
    }
});

module.exports.Node = Node;

}};

window.__resources__['/libs/cocos2d/RenderTexture.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Node = require('./Node').Node,
    Sprite = require('./Sprite').Sprite,
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
    ccp = require('geometry').ccp;

/** @member cocos
 * @class
 *
 * @extends cocos.Node
 */
var RenderTexture = Node.extend(/** @scope cocos.RenderTexture# */{
    canvas: null,
    context: null,
    sprite: null,

    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        var width = opts['width'],
            height = opts['height'];

        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');

        var atlas = TextureAtlas.create({canvas: this.canvas});
        this.sprite = Sprite.create({textureAtlas: atlas, rect: {origin: ccp(0,0), size: {width: width, height: height}}});

        this.addChild(this.sprite);
    }
});

module.exports.RenderTexture = RenderTexture;

}};

window.__resources__['/libs/cocos2d/Scene.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var Node = require('./Node').Node;

/** @member cocos
 * @class
 */
var Scene = Node.extend(/** @scope cocos.Scene# */{

});

module.exports.Scene = Scene;

}};

window.__resources__['/libs/cocos2d/Scheduler.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing;


/** @member cocos
 * @class
 */
var Timer = Thing.extend(/** @scope cocos.Timer# */{
    callback: null,
    interval: 0,
    elapsed: -1,

    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        this.set('callback', opts['callback']);
        this.set('elapsed', -1);
        this.set('interval', opts['interval'] || 0);
    },

    fire: function(dt) {
        if (this.elapsed == -1) {
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        if (this.elapsed >= this.interval) {
            this.callback(this.elapsed);
            this.elapsed = 0;
        }
    }
});


/** @member cocos
 * @class
 */
var Scheduler = Thing.extend(/** @scope cocos.Scheduler# */{
    scheduledMethods: null,
    methodsToAdd: null,
    methodsToRemove: null,
    timeScale: 1.0,

    init: function() {
        this.scheduledMethods = [];
        this.methodsToAdd     = [];
        this.methodsToRemove  = [];
    },

    scheduleTimer: function(timer) {
        var i;
        if (i = this.methodsToRemove.indexOf(timer) > -1) {
            this.methodsToRemove.splice(i, 1); // Remove timer
            return;
        }

        if (this.scheduledMethods.indexOf(timer) > -1 || this.methodsToAdd.indexOf(timer) > -1) {
            throw "Scheduler.scheduleTimer: timer already scheduled";
        }

        this.methodsToAdd.push(timer);
    },

    tick: function(dt) {
        if (this.timeScale != 1.0) {
            dt *= this.timeScale;
        }

        sys.each(this.methodsToRemove, sys.callback(this, function(timer) {
            var i = this.scheduledMethods.indexOf(timer);
            if (i == -1) {
                return;
            }

            this.scheduledMethods.splice(i, 1);
        }));
        this.methodsToRemove = [];

        sys.each(this.methodsToAdd, sys.callback(this, function(timer) {
            this.scheduledMethods.push(timer);
        }));
        this.methodsToAdd = [];

        sys.each(this.scheduledMethods, function(obj) {
            obj.fire(dt);
        });
	},

    unscheduleAllSelectorsForTarget: function(target) {
    },

    pauseTarget: function(target) {
    },

	resumeTarget: function(target) {
		// TODO
	}
});

sys.extend(Scheduler, /** @scope cocos.Scheduler */{
    /** @field */
    sharedScheduler: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});

exports.Timer = Timer;
exports.Scheduler = Scheduler;

}};

window.__resources__['/libs/cocos2d/Sprite.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Director = require('./Director').Director,
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
    Node = require('./Node').Node,
    geo = require('geometry'),
    ccp = geo.ccp;

/** @member cocos
 * @class
 */
var Sprite = Node.extend(/** @scope cocos.Sprite# */{
    textureAtlas: null,
    rect: null,
    dirty: true,
    recursiveDirty: true,
    quad: null,

    /** 
     * @param {String} opts.file Path to image to use as sprite atlas
     * @param {Rect} opts.rect The rect in the sprite atlas image file to use as the sprite
     */
    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        var file         = opts['file'],
            textureAtlas = opts['textureAtlas'],
            texture      = opts['texture'],
            frame        = opts['frame'],
            spritesheet  = opts['spritesheet'],
            rect         = opts['rect'];

        if (frame) {
            texture = frame.get('texture');
            rect    = frame.get('rect');
        }

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        } else if (spritesheet) {
            textureAtlas = spritesheet.get('textureAtlas');
            this.set('useSpriteSheet', true);
        } else if (!textureAtlas) {
            throw "Sprite has no texture";
        }

        if (!rect && textureAtlas) {
            rect = {origin: ccp(0,0), size:{width: textureAtlas.texture.size.width, height: textureAtlas.texture.size.height}};
        }

        if (rect) {
            this.set('rect', rect);
            this.set('contentSize', rect.size);
        }

        this.quad = {
            drawRect: {origin: ccp(0, 0), size: rect.size},
            textureRect: rect
        };

        this.set('textureAtlas', textureAtlas);

        if (frame) {
            this.set('displayFrame', frame);
        }
    },

    _updateTextureQuad: function(obj, key, texture, oldTexture) {
        if (oldTexture) {
            oldTexture.removeQuad({quad: this.get('quad')})
        }

        if (texture) {
            texture.insertQuad({quad: this.get('quad')});
        }
    }.observes('textureAtlas'),

    _updateQuad: function() {
        if (!this.quad) {
            return;
        }

        this.quad.textureRect = sys.copy(this.rect);
        this.quad.drawRect.size = sys.copy(this.rect.size);
    }.observes('scale', 'scaleX', 'scaleY', 'rect'),

    updateTransform: function(ctx) {
        if (!this.useSpriteSheet) {
            throw "updateTransform is only valid when Sprite is being rendered using a SpriteSheet"
        }

        if (!this.visible) {
            this.set('dirty', false);
            this.set('recursiveDirty', false);
            return;
        }

        // TextureAtlas has hard reference to this quad so we can just update it directly
        this.quad.drawRect.origin = {
            x: this.position.x - this.anchorPointInPixels.x * this.scaleX,
            y: this.position.y - this.anchorPointInPixels.y * this.scaleY
        }
        this.quad.drawRect.size = {
            width: this.rect.size.width * this.scaleX,
            height: this.rect.size.height * this.scaleY
        }

        this.set('dirty', false);
        this.set('recursiveDirty', false);
    },

    draw: function(ctx) {
        this.get('textureAtlas').drawQuad(ctx, this.quad);
    },

    isFrameDisplayed: function(frame) {
        // TODO check texture name
        return (geo.rectEqualToRect(frame.rect, this.rect));
    },
    displayFrame: function(key, frame) {
        // TODO change texture

        this.set('rect', frame.get('rect'));
    }.property()
});

module.exports.Sprite = Sprite;

}};

window.__resources__['/libs/cocos2d/SpriteFrame.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing;

/** @member cocos
 * @class
 *
 *  A SpriteFrame has:
 *  - texture: A Texture2D that will be used by the Sprite
 *  - rectangle: A rectangle of the texture
 *
 * You can modify the frame of a Sprite by doing:
 * 
 *  var frame = SpriteFrame.create({texture:texture rect:rect offset:offset});
 *  sprite.set('displayFrame', frame);
 */
var SpriteFrame = Thing.extend(/** @scope cocos.SpriteFrame# */{
    rect: null,
    rotated: false,
    offset: null,
    originalSize: null,
    texture: null,

    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        this.texture      = opts['texture'];
        this.rect         = opts['rect'];
        this.rotated      = !!opts['rotate'];
        this.offset       = opts['offset'] || ccp(0, 0);
        this.originalSize = opts['originalSize'] || sys.copy(this.rect.size);
    },

    toString: function() {
        return "[object SpriteFrame | TextureName=" + this.texture.get('name') + ", Rect = (" + this.rect.origin.x + ", " + this.rect.origin.y + ", " + this.rect.size.width + ", " + this.rect.size.height + ")]";
    },

    copy: function() {
        return SpriteFrame.create({rect: this.rect, rotated: this.rotated, offset: this.offset, originalSize: this.originalSize, texture: this.texture});
    }

});

exports.SpriteFrame = SpriteFrame;

}};

window.__resources__['/libs/cocos2d/SpriteSheet.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    TextureAtlas = require('./TextureAtlas').TextureAtlas,
	Node = require('./Node').Node;

/** @member cocos
 * @class
 *
 * @extends cocos.Node
 */
var SpriteSheet = Node.extend(/** @scope cocos.SpriteSheet# */{
	textureAtlas: null,
	descendants: null,

	init: function(opts) {
		arguments.callee.base.apply(this, arguments);

        var file = opts['file'],
            textureAtlas = opts['textureAtlas'];

        if (!textureAtlas && file) {
            textureAtlas = TextureAtlas.create({file:file});
        } else if (!textureAtlas && !file) {
            throw "SpriteSheet has no texture or file";
        }

		this.textureAtlas = textureAtlas;

		this.descendants = [];
	},

	// Don't call visit on child nodes
    visit: function(context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        this.draw(context);

        context.restore();
	},

	addChild: function(opts) {
        if (opts.isCocosNode) {
            return arguments.callee.call(this, {child:opts, z:0});
        }

		var ret = arguments.callee.base.apply(this, arguments);

		opts['child'].set('textureAtlas', this.get('textureAtlas'));
		var index = this.atlasIndexForChild({child: opts['child'], z:opts['z']});
		this.insertChild({child: opts['child'], index:index});

		return ret;
	},

	insertChild: function(opts) {
		var sprite = opts['child'],
			index = opts['index'];

		sprite.set('useSpriteSheet', true);
		sprite.set('atlasIndex', index);
		sprite.set('dirty', true);

		this.descendants[index] = sprite;

		// Update indices
		sys.each(this.descendants, function(child, i) {
			if (i > index) {
				child.inc('atlastIndex');
			}
		});

		// Add children
		sys.each(sprite.children, sys.callback(this, function(child, i) {
			if (!child) {
				return;
			}
			var index = this.atlasIndexForChild({child:child, z:child.zOrder});
			this.insertChild({child: child, index: index});
		}));
	},


	highestAtlasIndexInChild: function(sprite) {
		var children = sprite.get('children');
		if (children.length == 0) {
			return sprite.get('atlasIndex');
		} else {
			return this.highestAtlasIndexInChild(children[children.length-1]);
		}
	},

	lowestAtlasIndexInChild: function(sprite) {
		var children = sprite.get('children');
		if (children.length == 0) {
			return sprite.get('atlasIndex');
		} else {
			return this.highestAtlasIndexInChild(children[0]);
		}
	},
	

	atlasIndexForChild: function(opts) {
		var sprite = opts['child'],
			z = opts['z'];

		var siblings = sprite.get('parent.children'),
			childIndex = siblings.indexOf(sprite);

		var ignoreParent = (sprite.get('parent') == this),
			previous;

		if (childIndex > 0) {
			previous = siblings[childIndex -1];
		}

		if (ignoreParent) {
			if (childIndex == 0) {
				return 0;
			} else {
				return this.highestAtlasIndexInChild(previous) +1;
			}
		}

		// Parent is a Sprite
		if (childIndex == 0) {
			var p = sprite.parent;

			if (z < 0) {
				return p.atlasIndex;
			} else {
				return p.atlasIndex + 1;
			}
		} else {
			// Previous and Sprite belong to same branch
			if ((previous.zOrder < 0 && z < 0) || (previous >= 0 && z >= 0)) {
				return this.highestAtlasIndexInChild(previous) +1;
			}

			var p = sprite.parent;
			return p.atlasIndex +1;
		}

		throw "Should not happen. Error calculating Z on SpriteSheet";
	},

	draw: function(ctx) {
		sys.each(this.descendants, function(child, i) {
			child.updateTransform(ctx);
		});

		this.textureAtlas.drawQuads(ctx);
	},

	texture: function() {
		return this.textureAtlas.texture;
	}.property()
});

exports.SpriteSheet = SpriteSheet;

}};

window.__resources__['/libs/cocos2d/Texture2D.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing;

/** @member cocos
 * @class */
var Texture2D = Thing.extend(/** @scope cocos.Texture2D# */{
	imgElement: null,
	size: null,
    name: null,

	init: function(opts) {
		var file = opts['file'],
			data = opts['data'],
			texture = opts['texture'];

		if (file) {
            this.name = file;
			data = resource(file);
		} else if (texture) {
            this.name = texture.get('name');
			data = texture.get('imgElement');
		}

		this.size = {width: 0, height: 0};

		this.imgElement = data;
		this.set('size', {width:this.imgElement.width, height: this.imgElement.height});
	},

	drawAtPoint: function(ctx, point) {
		ctx.drawImage(this.imgElement, point.x, point.y);
	},
	drawInRect: function(ctx, rect) {
		ctx.drawImage(this.imgElement,
			rect.origin.x, rect.origin.y,
			rect.size.width, rect.size.height
		);
	},

	data: function() {
		return this.imgElement.src;
	}.property(),

	contentSize: function() {
		return this.size;
    }.property()
});

exports.Texture2D = Texture2D;

}};

window.__resources__['/libs/cocos2d/TextureAtlas.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
	Texture2D = require('./Texture2D').Texture2D,
    Thing = require('thing').Thing;


/* QUAD STRUCTURE
 quad = {
	 drawRect: <rect>, // Where the quad is drawn to
	 textureRect: <rect>  // The slice of the texture to draw in drawRect
 }
*/

/** @member cocos
 * @class
 */
var TextureAtlas = Thing.extend(/** @scope cocos.TextureAtlas */{
	quads: null,
	imgElement: null,
	texture: null,

	init: function(opts) {
		var file = opts['file'],
			data = opts['data'],
			texture = opts['texture'],
			canvas = opts['canvas'];

        if (canvas) {
            // If we've been given a canvas element then we'll use that for our image
            this.imgElement = canvas;
        } else {
			var texture = this.set('texture', Texture2D.create({texture: texture, file: file, data: data}));
			this.imgElement = texture.get('imgElement');
        }

		this.quads = [];
	},

	insertQuad: function(opts) {
		var quad = opts['quad'],
			index = opts['index'] || 0;

		this.quads.splice(index, 0, quad);
	},
	removeQuad: function(opts) {
		var index = opts['index'];

		this.quads.splice(index, 1);
	},


	drawQuads: function(ctx) {
		sys.each(this.quads, sys.callback(this, function(quad) {
			if (!quad) return;

			this.drawQuad(ctx, quad);
		}));
	},

	drawQuad: function(ctx, quad) {
		ctx.drawImage(this.get('imgElement'), 
			quad.textureRect.origin.x, quad.textureRect.origin.y, // Draw slice from x,y
			quad.textureRect.size.width, quad.textureRect.size.height, // Draw slice size
			quad.drawRect.origin.x, quad.drawRect.origin.y, // Draw at 0, 0
			quad.drawRect.size.width, quad.drawRect.size.height // Draw size
		);
	}

});

exports.TextureAtlas = TextureAtlas

}};

window.__resources__['/libs/cocos2d/TMXLayer.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    SpriteSheet = require('./SpriteSheet').SpriteSheet;
    Sprite = require('./Sprite').Sprite;
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('./TMXOrientation').TMXOrientationIso,
    ccp    = require('geometry').ccp,
    Node = require('./Node').Node;

/** @member cocos
 * @class
 *
 * @extends cocos.SpriteSheet
 */
var TMXLayer = SpriteSheet.extend(/** @scope cocos.TMXLayer# */{
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
            tex = tilesetInfo.sourceImage;
        }

        arguments.callee.base.call(this, {file: tex});

		this.set('anchorPoint', ccp(0,0));

        this.layerName = layerInfo.get('name');
        this.layerSize = layerInfo.get('layerSize');
        this.tiles = layerInfo.get('tiles');
        this.minGID = layerInfo.get('minGID');
        this.maxGID = layerInfo.get('maxGID');
        this.opacity = layerInfo.get('opacity');
        this.properties = sys.copy(layerInfo.properties);

        this.tileset = tilesetInfo;
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
        this.tileset.set('imageSize', this.get('texture.contentSize'));


        for (var y=0; y < this.layerSize.height; y++) {
            for (var x=0; x < this.layerSize.width; x++) {
                
                var pos = x + this.layerSize.width * y,
                    gid = this.tiles[pos];
                
                if (gid != 0) {
                    this.appendTile({gid:gid, position:ccp(x,y)});
                    
                    // Optimization: update min and max GID rendered by the layer
                    this.minGID = Math.min(gid, this.minGID);
                    this.maxGID = Math.max(gid, this.maxGID);
                }
            }
        }
        
        console.log('tiles setup', this);
    },
    appendTile: function(opts) {
        var gid = opts['gid'],
            pos = opts['position'];

        var z = pos.x + pos.y * this.layerSize.width;
            
        
        var rect = this.tileset.rectForGID(gid);
        var tile = Sprite.create({rect: rect});
        tile.set('position', this.positionAt(pos));
        tile.set('anchorPoint', ccp(0, 0));
        tile.set('opacity', this.get('opacity'));

        this.addChild(tile);
    },
    positionAt: function(pos) {
        var ret = ccp(0, 0);

        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            ret = this.positionForOrthoAt(pos);
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
    positionForOrthoAt: function(pos) {
        var x = Math.floor(pos.x * this.mapTileSize.width + 0.49);
        var y = Math.floor(pos.y * this.mapTileSize.height + 0.49);
        return ccp(x,y);
        
    }
});

exports.TMXLayer = TMXLayer;

}};

window.__resources__['/libs/cocos2d/TMXOrientation.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @member cocos
 * @namespace
 */
var TMXOrientation = /** @scope cocos.TMXOrientation */{
    /**
     * Orthogonal orientation
     * @constant
     */
	TMXOrientationOrtho: 1,

    /**
     * Hexagonal orientation
     * @constant
     */
	TMXOrientationHex: 2,

    /**
     * Isometric orientation
     * @constant
     */
	TMXOrientationIso: 3
};

module.exports = TMXOrientation;

}};

window.__resources__['/libs/cocos2d/TMXTiledMap.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
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
        arguments.callee.base.apply(this, arguments);

        var mapInfo = TMXMapInfo.create(opts['file']);

        this.mapSize        = mapInfo.get('mapSize');
        this.tileSize       = mapInfo.get('tileSize');
        this.mapOrientation = mapInfo.get('orientation');
        this.objectGroups   = mapInfo.get('objectGroups');
        this.properties     = mapInfo.get('properties');
        this.tileProperties = mapInfo.get('tileProperties');

        // Add layers to map
        var idx = 0;
        sys.each(mapInfo.layers, sys.callback(this, function(layerInfo) {
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

        console.log('Created TMXLayer:', layer);

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


}};

window.__resources__['/libs/cocos2d/TMXXMLParser.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
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

            console.log('Number of tiles in map:', layer.tiles.length);

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
        arguments.callee.base.apply(this, arguments);

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
        arguments.callee.base.apply(this, arguments);
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

}};

window.__resources__['/libs/cocos2d/TouchDispatcher.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing,
    StandardTouchHandler = require('./TouchHandler').StandardTouchHandler,
    TargetedTouchHandler = require('./TouchHandler').TargetedTouchHandler;
    
var kTouchBegan = 0,
	kTouchMoved = 1,
	kTouchEnded = 2,
	kTouchCancelled = 3,
	kTouchMax = 4;

var kTouchMethodBeganBit     = 1 << 0,
    kTouchMethodMovedBit     = 1 << 1,
    kTouchMethodEndedBit     = 1 << 2,
    kTouchMethodCancelledBit = 1 << 3,
    kTouchMethodAllBits      = ( kTouchMethodBeganBit | kTouchMethodMovedBit | kTouchMethodEndedBit | kTouchMethodCancelledBit);

    
/** @member cocos
 * @class
 */
var TouchDispatcher = Thing.extend(/** @scope cocos.TouchDispatcher# */{
    targetedHandlers: null,
    standardHandlers: null,
    locked: false,
    toAdd: false,
    toRemove: false,
    handlersToAdd: null,
    handlersToRemove: null,
    toQuit: null,
    dispatchEvents: true,


    init: function() {
        arguments.callee.base.apply(this, arguments);

		this.targetedHandlers = [];
		this.standardHandlers = [];
		this.handlersToAdd =    [];
		this.handlersToRemove = [];
        
    },

    addStandardDelegate: function(opts) {
        var delegate = opts['delegate'],
            priority = opts['priority'];

        var handler = StandardTouchHandler.create({delegate:delegate, priority:priority});
        if(!this.locked) {
            this.forceAddHandler({handler:handler, array:this.standardHandlers});
        } else {
            this.handlersToAdd.push(handler);
            this.toAdd = true;
        }
            
    },

    addTargetedDelegate: function(opts) {
        var delegate = opts['delegate'],
            priority = opts['priority'],
            swallowsTouches = opts['swallowsTouches'];

        var handler = TargetedTouchHandler.create({delegate:delegate, priority:priority, swallowsTouches:swallowsTouches});
        if(!this.locked) {
            this.forceAddHandler({handler:handler, array:this.targetedHandlers});
        } else {
            this.handlersToAdd.push(handler);
            this.toAdd = true;
        }
    },

    forceAddHandler: function(opts) {
        var handler = opts['handler'],
            array = opts['array'];

        var i = 0;
        sys.each(array, function(h) {
            if (h.get('priority') < handler.get('priority')) {
                i++;
            }

            if (h.get('delegate') == handler.get('delegate')) {
                throw "Delegate already added to touch dispatcher.";
            }
        });

        array.splice(i, 0, handler);
    },

    touches: function(opts) {
        var touches = opts['touches'],
            event   = opts['event'],
            touchType = opts['touchType'];

        // Targeted touch handlers
        if (this.targetedHandlers.length > 0 && touches.length > 0) {
            sys.each(touches, sys.callback(this, function(touch) {
                sys.each(this.targetedHandlers, function(handler) {
                    var claimed = false,
                        args = {touch: touch, event:event},
                        claimedTouches = handler.get('claimedTouches'),
                        delegate = handler.get('delegate');
                        

                    if (touchType == kTouchMethodBeganBit) {
                        claimed = delegate.touchBegan(args);
                        if (claimed) {
                            claimedTouches.push(touch);
                        }
                    }

                    // else (moved, ended, cancelled)
                    else if (claimedTouches.indexOf(touch) > -1) {
                        claimed = true;

                        if (handler.get('enabledMethods') & touchType) {
                            switch(touchType) {
                            case kTouchMethodBeganBit:
                                delegate.touchBegan(args);
                                break;
                            case kTouchMethodMovedBit:
                                delegate.touchMoved(args);
                                break;
                            case kTouchMethodEndedBit:
                                delegate.touchEnded(args);
                                break;
                            case kTouchMethodCancelledBit:
                                delegate.touchCancelled(args);
                                break;
                            }
                        }

                        if (touchType & (kTouchMethodCancelledBit | kTouchMethodEndedBit)) {
                            var idx = claimedTouches.indexOf(touch);
                            if (idx > -1) {
                                claimedTouches.splice(idx, 1);
                            }
                        }
                    }

                    if (claimed && handler.get('swallowsTouches')) {
                        var idx = touches.indexOf(touch);
                        if (idx > -1) {
                            delete touches[idx];
                        }
                    }
                });
            }));
        }



        // Standard touch handlers
        if (this.standardHandlers.length > 0 && touches.length > 0) {
            sys.each(this.standardHandlers, function(handler) {

                if (handler.get('enabledMethods') & touchType) {
                    var delegate = handler.get('delegate');
                    var args = {touches: touches, event:event};
                    switch(touchType) {
                    case kTouchMethodBeganBit:
                        delegate.touchesBegan(args);
                        break;
                    case kTouchMethodMovedBit:
                        delegate.touchesMoved(args);
                        break;
                    case kTouchMethodEndedBit:
                        delegate.touchesEnded(args);
                        break;
                    case kTouchMethodCancelledBit:
                        delegate.touchesCancelled(args);
                        break;
                    }
                }
            });
        }


        this.locked = false;

        if (this.toRemove) {
            this.toRemove = false;
            // TODO
        }

        if (this.toAdd) {
            this.toAdd = false;

            sys.each(this.handlersToAdd, sys.callback(this, function(handler) {
                // TODO Targeted handlers
                this.forceAddHandler({handler: handler, array:this.standardHandlers});
            }));
        }

        if (this.toQuit) {
            this.toQuit = false;
            // TODO
            //this.forceRemoveAllDelegates();
        }
    },

    touchesBegan: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchMethodBeganBit});
        }
    },

    touchesMoved: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchMethodMovedBit});
        }
    },

    touchesEnded: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchMethodEndedBit});
        }
    },

    touchesCancelled: function(opts) {
        var touches = opts['touches'],
            event = opts['event'];

        if (this.dispatchEvents) {
            this.touches({touches: touches, event: event, touchType: kTouchMethodCancelledBit});
        }
    }



});

/**
 * Class methods
 */
sys.extend(TouchDispatcher, /** @scope cocos.TouchDispatcher */{
    /** @field */
    sharedDispatcher: function(key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }.property()
});


exports.TouchDispatcher = TouchDispatcher;

}};

window.__resources__['/libs/cocos2d/TouchHandler.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing;

var kTouchMethodBeganBit     = 1 << 0,
    kTouchMethodMovedBit     = 1 << 1,
    kTouchMethodEndedBit     = 1 << 2,
    kTouchMethodCancelledBit = 1 << 3,
    kTouchMethodAllBits      = ( kTouchMethodBeganBit | kTouchMethodMovedBit | kTouchMethodEndedBit | kTouchMethodCancelledBit);

/** @member cocos
 * @class
 */
var TouchHandler = Thing.extend(/** @scope cocos.TouchHandler# */{
    delegate: null,
    priority: 0,
    enabledMethods: 0,

    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        var delegate = opts['delegate'],
            priority = opts['priority'];

        this.set('delegate', delegate);
        this.priority = priority;

    }

});

/** @member cocos
 * @class
 *
 * @extends cocos.TouchHandler
 */
var StandardTouchHandler = TouchHandler.extend(/** @scope cocos.StandardTouchHandler# */{
    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        if (this.delegate.touchesBegan) {
            this.enabledMethods |= kTouchMethodBeganBit;
        }
        if (this.delegate.touchesMoved) {
            this.enabledMethods |= kTouchMethodMovedBit;
        }
        if (this.delegate.touchesEnded) {
            this.enabledMethods |= kTouchMethodEndedBit;
        }
        if (this.delegate.touchesCancelled) {
            this.enabledMethods |= kTouchMethodCancelledBit;
        }
    }
});

/** @member cocos
 * @class
 *
 * @extends cocos.TouchHandler
 */
var TargetedTouchHandler = TouchHandler.extend(/** @scope cocos.TargetedTouchHandler# */{
    claimedTouches: null,
    swallowsTouches: false,

    init: function(opts) {
        arguments.callee.base.apply(this, arguments);

        var swallowsTouches = opts['swallowsTouches'];

        this.claimedTouches = [];
        this.swallowsTouches = swallowsTouches;

        if (this.delegate.touchBegan) {
            this.enabledMethods |= kTouchMethodBeganBit;
        }
        if (this.delegate.touchMoved) {
            this.enabledMethods |= kTouchMethodMovedBit;
        }
        if (this.delegate.touchEnded) {
            this.enabledMethods |= kTouchMethodEndedBit;
        }
        if (this.delegate.touchCancelled) {
            this.enabledMethods |= kTouchMethodCancelledBit;
        }
    },

    updateKnownTouches: function(opts) {
        var touches = opts['touches'],
            event   = opts['event'],
            method  = opts['method'],
            unclaim = opts['unclaim'];


    }
    
});

exports.TouchHandler = TouchHandler;
exports.StandardTouchHandler = StandardTouchHandler;
exports.TargetedTouchHandler = TargetedTouchHandler;

}};

window.__resources__['/modules/1.0/absolute/b.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.foo = function() {};

}};

window.__resources__['/modules/1.0/absolute/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
var a = require('submodule/a');
var b = require('b');
test.assert(a.foo().foo === b.foo, 'require works with absolute identifiers');
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/absolute/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/absolute/submodule/a.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.foo = function () {
    return require('b');
};

}};

window.__resources__['/modules/1.0/cyclic/a.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.a = function () {
    return b;
};
var b = require('b');

}};

window.__resources__['/modules/1.0/cyclic/b.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var a = require('a');
exports.b = function () {
    return a;
};

}};

window.__resources__['/modules/1.0/cyclic/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
var a = require('a');
var b = require('b');

test.assert(a.a, 'a exists');
test.assert(b.b, 'b exists')
test.assert(a.a().b === b.b, 'a gets b');
test.assert(b.b().a === a.a, 'b gets a');

test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/cyclic/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/determinism/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
require('submodule/a');
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/determinism/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/determinism/submodule/a.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
var pass = false;
var test = require('test');
try {
    require('a');
} catch (exception) {
    pass = true;
}
test.assert(pass, 'require does not fall back to relative modules when absolutes are not available.')

}};

window.__resources__['/modules/1.0/determinism/submodule/b.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {



}};

window.__resources__['/modules/1.0/exactExports/a.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.program = function () {
    return require('program');
};

}};

window.__resources__['/modules/1.0/exactExports/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
var a = require('a');
test.assert(a.program() === exports, 'exact exports');
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/exactExports/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/hasOwnProperty/hasOwnProperty.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

}};

window.__resources__['/modules/1.0/hasOwnProperty/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var hasOwnProperty = require('hasOwnProperty');
var toString = require('toString');
var test = require('test');
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/hasOwnProperty/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/hasOwnProperty/toString.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

}};

window.__resources__['/modules/1.0/method/a.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.foo = function () {
    return this;
};
exports.set = function (x) {
    this.x = x;
};
exports.get = function () {
    return this.x;
};
exports.getClosed = function () {
    return exports.x;
};

}};

window.__resources__['/modules/1.0/method/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
var a = require('a');
var foo = a.foo;
test.assert(a.foo() == a, 'calling a module member');
test.assert(foo() == (function (){return this})(), 'members not implicitly bound');
a.set(10);
test.assert(a.get() == 10, 'get and set')
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/method/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/missing/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
try {
    require('bogus');
    test.print('FAIL require throws error when module missing', 'fail');
} catch (exception) {
    test.print('PASS require throws error when module missing', 'pass');
}
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/missing/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/monkeys/a.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
require('program').monkey = 10;

}};

window.__resources__['/modules/1.0/monkeys/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var a = require('a');
var test = require('test');
test.assert(exports.monkey == 10, 'monkeys permitted');
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/monkeys/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/nested/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
test.assert(require('a/b/c/d').foo() == 1, 'nested module identifier');
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/nested/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/nested/a/b/c/d.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.foo = function () {
    return 1;
};

}};

window.__resources__['/modules/1.0/relative/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
var a = require('submodule/a');
var b = require('submodule/b');
test.assert(a.foo == b.foo, 'a and b share foo through a relative require');
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/relative/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/modules/1.0/relative/submodule/a.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.foo = require('./b').foo;

}};

window.__resources__['/modules/1.0/relative/submodule/b.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.foo = function () {
};

}};

window.__resources__['/modules/1.0/transitive/a.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.foo = require('b').foo;

}};

window.__resources__['/modules/1.0/transitive/b.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.foo = require('c').foo;

}};

window.__resources__['/modules/1.0/transitive/c.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
exports.foo = function () {
    return 1;
};

}};

window.__resources__['/modules/1.0/transitive/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var test = require('test');
test.assert(require('a').foo() == 1, 'transitive');
test.print('DONE', 'info');

}};

window.__resources__['/modules/1.0/transitive/test.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

exports.print = typeof print !== "undefined" ? print : function () {
    var system = require("system");
    var stdio = system.stdio;
    stdio.print.apply(stdio, arguments);
};

exports.assert = function (guard, message) {
    if (guard) {
        exports.print('PASS ' + message, 'pass');
    } else {
        exports.print('FAIL ' + message, 'fail');
    }
};


}};

window.__resources__['/unit-testing/1.0/program.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
// From Node.js test/mjsunit/test-assert.js
// Felix Geisendörfer (felixge), backported from NodeJS
// Karl Guertin (greyrest), backported from NodeJS
// Kris Kowal (kriskowal), conversion to CommonJS

// strangely meta, no?

var assert = require('assert');

function makeBlock(f) {
    var args = Array.prototype.slice.call(arguments,1);
    return function(){
        return f.apply(this, args);
    }
}

exports['test AssertionError instanceof Error'] = function () {
    assert.ok(new assert.AssertionError({}) instanceof Error);
};

exports['test ok false'] = function () {
    assert['throws'](makeBlock(assert.ok, false), assert.AssertionError);
};

exports['test ok(true)'] = makeBlock(assert.ok, true);
exports['test ok("test")'] = makeBlock(assert.ok, "test");
exports['test equal true false'] = function () {
    assert['throws'](makeBlock(assert.equal, true, false), assert.AssertionError, 'equal');
};

exports['test equal null null'] = makeBlock(assert.equal, null, null);
exports['test equal undefined undefined'] = makeBlock(assert.equal, undefined, undefined);
exports['test equal null undefined'] = makeBlock(assert.equal, null, undefined);
exports['test equal 2 "2"'] = makeBlock(assert.equal, 2, "2");
exports['test equal "2" 2'] = makeBlock(assert.equal, "2", 2);
exports['test equal true true'] = makeBlock(assert.equal, true, true);
exports['test notEqual true false'] = makeBlock(assert.notEqual, true, false);
exports['test notEqual true true'] = function () {
    assert['throws'](makeBlock(assert.notEqual, true, true), assert.AssertionError, 'notEqual');
};
exports['test strictEqual 2 "2"'] = function () {
    assert['throws'](makeBlock(assert.strictEqual, 2, "2"), assert.AssertionError, 'strictEqual');
};
exports['test strictEqual null undefined'] = function () {
    assert['throws'](makeBlock(assert.strictEqual, null, undefined), assert.AssertionError, 'strictEqual');
};
exports['test notStrictEqual 2 "2"'] = makeBlock(assert.notStrictEqual, 2, "2");

//deepEquals

//7.2
exports['test 7.2 deepEqual date'] = makeBlock(assert.deepEqual, new Date(2000,3,14), new Date(2000,3,14));
exports['test 7.2 deepEqual date negative'] = function () {
    assert['throws'](makeBlock(assert.deepEqual, new Date(), new Date(2000,3,14)), assert.AssertionError, 'deepEqual date');
};

//7.3
exports['test 7.3 deepEqual 4 "4"'] = makeBlock(assert.deepEqual, 4, "4");
exports['test 7.3 deepEqual "4" 4'] = makeBlock(assert.deepEqual, "4", 4);
exports['test 7.3 deepEqual true 1'] = makeBlock(assert.deepEqual, true, 1);
exports['test 7.3 deepEqual 4 "5"'] = function () {
    assert['throws'](makeBlock(assert.deepEqual, 4, "5"));
};

//7.4
// having the same number of owned properties && the same set of keys
exports['test 7.4 deepEqual {a:4} {a:4}'] = makeBlock(assert.deepEqual, {a:4}, {a:4});
exports['test 7.4 deepEqual {a:4,b:"2"} {a:4,b:"2"}'] = makeBlock(assert.deepEqual, {a:4,b:"2"}, {a:4,b:"2"});
exports['test 7.4 deepEqual [4] ["4"]'] = makeBlock(assert.deepEqual, [4], ["4"]);
exports['test 7.4 deepEqual {a:4} {a:4,b:true}'] = function () {
    assert['throws'](makeBlock(assert.deepEqual, {a:4}, {a:4,b:true}), assert.AssertionError);
};

exports['test deepEqual ["a"], {0:"a"}'] = makeBlock(assert.deepEqual, ["a"], {0:"a"});
//(although not necessarily the same order),
exports['test deepEqual {a:4,b:"1"} {b:"1",a:4}'] = makeBlock(assert.deepEqual, {a:4,b:"1"}, {b:"1",a:4});

exports['test deepEqual arrays with non-numeric properties'] = function () {
    var a1 = [1,2,3];
    var a2 = [1,2,3];
    a1.a = "test";
    a1.b = true;
    a2.b = true;
    a2.a = "test"
    assert['throws'](makeBlock(assert.deepEqual, Object.keys(a1), Object.keys(a2)), assert.AssertionError);
    makeBlock(assert.deepEqual, a1, a2);
};

exports['test deepEqual identical prototype'] = function () {
    // having an identical prototype property
    var nbRoot = {
        toString: function(){return this.first+' '+this.last;}
    }
    var nameBuilder = function(first,last){
        this.first = first;
        this.last = last;
        return this;
    }
    nameBuilder.prototype = nbRoot;
    var nameBuilder2 = function(first,last){
        this.first = first;
        this.last = last;
        return this;
    }
    nameBuilder2.prototype = nbRoot;
    var nb1 = new nameBuilder('Ryan', 'Dahl');
    var nb2 = new nameBuilder2('Ryan','Dahl');

    assert.deepEqual(nb1, nb2);

    nameBuilder2.prototype = Object;
    nb2 = new nameBuilder2('Ryan','Dahl');
    assert['throws'](makeBlock(assert.deepEqual, nb1, nb2), assert.AssertionError);

};

exports['test deepEqual "a" {}'] = function () {
    assert['throws'](makeBlock(assert.deepEqual, 'a', {}), assert.AssertionError);
};

exports['test deepEqual "" ""'] = function () {
    assert.deepEqual("", "");
};

exports['test deepEqual "" [""]'] = function () {
    assert['throws'](makeBlock(assert.deepEqual, '', ['']), assert.AssertionError);
};

exports['test deepEqual [""] [""]'] = function () {
    assert.deepEqual([""], [""]);
};

exports['test throw AssertionError'] = function () {

    //Testing the throwing
    function thrower(errorConstructor){
        throw new errorConstructor('test');
    }
    var aethrow = makeBlock(thrower, assert.AssertionError);
    var aethrow = makeBlock(thrower, assert.AssertionError);
    //the basic calls work
    assert['throws'](makeBlock(thrower, assert.AssertionError), assert.AssertionError, 'message');
    assert['throws'](makeBlock(thrower, assert.AssertionError), assert.AssertionError);
    assert['throws'](makeBlock(thrower, assert.AssertionError));
    //if not passing an error, catch all.
    assert['throws'](makeBlock(thrower, TypeError));
    //when passing a type, only catch errors of the appropriate type
    var threw = false;
    try {
        assert['throws'](makeBlock(thrower, TypeError), assert.AssertionError);
    } catch (e) {
        threw = true;
        assert.ok(e instanceof TypeError, 'type');
    }
    assert.ok(threw, 'assert.throws with an explicit error is eating extra errors', assert.AssertionError);
    threw = false;

};

if (module == require.main)
    require("test").run(exports);


}};
function resource(path) {
    return window.__resources__[path].data;
}

(function() {
    var process = {};
    var modulePaths = ['/libs'];

    var path; // Will be loaded further down

    function resolveModulePath(request, parent) {
        // If not a relative path then search the modulePaths for it
        var start = request.substring(0, 2);
        if (start !== "./" && start !== "..") {
            return [request, modulePaths];
        }

        var parentIsIndex = path.basename(parent.filename).match(/^index\.js$/),
            parentPath    = parentIsIndex ? parent.id : path.dirname(parent.id),
            id            = path.join(parentPath, request);

        // Relative path so searching inside parent's directory
        return [id, [path.dirname(parent.filename)]];
    }

    function findModulePath(id, dirs) {
        if (id.charAt(0) === '/') {
            dirs = [''];
        }
        for (var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var p = path.join(dir, id);

            // Check for index first
            if (path.exists(path.join(p, 'index.js'))) {
                return path.join(p, 'index.js');
            } else if (path.exists(p + '.js')) {
                return p + '.js';
            }
        }

        return false;
    }

    function loadModule(request, parent) {
        var resolvedModule = resolveModulePath(request, parent),
            id             = resolvedModule[0],
            paths          = resolvedModule[1],
            filename       = findModulePath(request, paths);

        var cachedModule = parent.moduleCache[id];
        if (cachedModule) {
            return cachedModule.exports;
        }

        var module = new Module(id, parent);
        module._initialize(filename);

        return module.exports;
    }

    function Module(id, parent) {
        this.id = id;
        this.parent = parent;
        this.children = [];
        this.exports = {};

        if (parent) {
            this.moduleCache = parent.moduleCache;
            parent.children.push(this);
        } else {
            this.moduleCache = {};
        }
        this.moduleCache[this.id] = this;

        this.filename = null;
        this.dirname = null;
    }

    Module.prototype._initialize = function(filename) {
        var module = this;
        function require(request) {
            return loadModule(request, module);
        }

        this.filename = filename;

        // Work around incase this IS the path module
        if (path) {
            this.dirname = path.dirname(filename);
        } else {
            this.dirname = '/libs';
        }

        require.paths = modulePaths;
        require.main = process.mainModule;

        window.__resources__[this.filename].data.apply(this.exports, [this.exports, require, this, this.filename, this.dirname])

        return this;
    }


    // Manually load the path module because we need it to load other modules
    path = (new Module('path'))._initialize('/libs/path.js').exports;

    //process.mainModule = (new Module('/'))._initialize('/index.js');
})();
