
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

window.__resources__['/libs/cocos2d/AppDelegate.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var Thing = require('thing').Thing;

exports.AppDelegate = Thing.extend({
    applicationDidFinishLaunching: function() {
    }
});

}};

window.__resources__['/libs/cocos2d/Director.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Thing = require('thing').Thing,
    ccp = require('geometry').ccp,
    Scheduler = require('./Scheduler').Scheduler,
    TouchDispatcher = require('./TouchDispatcher').TouchDispatcher,
    KeyboardDispatcher = require('./KeyboardDispatcher').KeyboardDispatcher,
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
        var touchDispatcher = TouchDispatcher.get('sharedDispatcher');
        function mouseDown(evt) {
            var touch = {location: ccp(evt.offsetX, evt.offsetY)};

            function mouseMove(evt) {
                touch.location = ccp(evt.offsetX, evt.offsetY);

                touchDispatcher.touchesMoved({touches: [touch], event:evt});
            };
            function mouseUp(evt) {
                touch.location = ccp(evt.offsetX, evt.offsetY);

                document.body.removeEventListener('mousemove', mouseMove, false);
                document.body.removeEventListener('mouseup',   mouseUp,   false);


                touchDispatcher.touchesEnded({touches: [touch], event:evt});
            };

            document.body.addEventListener('mousemove', mouseMove, false);
            document.body.addEventListener('mouseup',   mouseUp,   false);

            touchDispatcher.touchesBegan({touches: [touch], event:evt});
        };
        canvas.addEventListener('mousedown', mouseDown, false);

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

        this._runningScene = this._nextScene;

        this._nextScene = null;

        this._runningScene.onEnter();
    },

    /** @field
     * Whether or not to display the FPS on the bottom-left corner
     * @type Boolean
     */
    displayFPS: function() {
    }.property()

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

window.__resources__['/libs/cocos2d/index.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    path = require('path');

var modules = 'Node Layer Scene Label Sprite Director Action IntervalAction Scheduler ActionManager TMXTiledMap TMXXMLParser SpriteSheet RenderTexture Menu MenuItem AppDelegate KeyboardDispatcher'.split(' ');

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


exports.IntervalAction = IntervalAction;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.RotateTo = RotateTo;
exports.RotateBy = RotateBy;
exports.Sequence = Sequence;

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
    TouchDispatcher = require('./TouchDispatcher').TouchDispatcher;

/** @member cocos
 * @class
 */
var Layer = Node.extend(/** @scope cocos.Layer# */{
    isTouchEnabled: false,
    isAccelerometerEnabled: false,

    init: function() {
        arguments.callee.base.apply(this, arguments);

        var s = Director.get('sharedDirector.winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);
    },

    registerWithTouchDispatcher: function() {
        TouchDispatcher.get('sharedDispatcher').addStandardDelegate({delegate: this, priority: 0});
    },

    onEnter: function() {
        if (this.isTouchEnabled) {
            this.registerWithTouchDispatcher();
        }

        arguments.callee.base.apply(this, arguments);
    },

    onExit: function() {
        if (this.isTouchEnabled) {
            TouchDispatcher.get('sharedDispatcher').removeDelegate({delegate: this});
        }

        arguments.callee.base.apply(this, arguments);
    },

    touchBegan: function(opts) {
        var touch = opts['touch'],
            event = opts['event'];

        throw "Layer.touchBegan override me";

        return true;
    },

    _updateIsTouchEnabled: function() {
        if (this.isRunning) {
            if (this.isTouchEnabled) {
                this.registerWithTouchDispatcher();
            } else {
                TouchDispatcher.get('sharedDispatcher').removeDelegate({delegate: this});
            }
        }
    }.observes('isTouchEnabled')
});

module.exports.Layer = Layer;

}};

window.__resources__['/libs/cocos2d/Menu.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    Layer = require('./Layer').Layer,
    Director = require('./Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    TouchDispatcher = require('./TouchDispatcher').TouchDispatcher,
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
	state: kMenuStateWaiting,
	selectedItem: null,
	opacuty: 255,
	color: null,

	init: function(opts) {
		arguments.callee.base.apply(this, arguments);

		var items = opts['items'];

		this.set('isTouchEnabled', true);
		
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

    registerWithTouchDispatcher: function() {
        TouchDispatcher.get('sharedDispatcher').addTargetedDelegate({delegate: this, priority: Number.MIN_INT+1, swallowsTouches: true});
    },

    itemForTouch: function(touch) {
        var children = this.get('children');
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i];

            if (item.get('visible') && item.get('isEnabled')) {
                var local = item.convertToNodeSpace(touch.location);
                
                var r = item.get('rect');
                r.origin = ccp(0, 0);

                if (geom.rectContainsPoint(r, local)) {
                    return item;
                }

            }
        }

        return null;
    },

    touchBegan: function(opts) {
        var touch = opts['touch'],
            event = opts['event'];

        if (this.state != kMenuStateWaiting || !this.visible) {
            return false;
        }

        var selectedItem = this.set('selectedItem', this.itemForTouch(touch));
        if (selectedItem) {
            selectedItem.set('isSelected', true);
            this.set('state', kMenuStateTrackingTouch);

            return true;
        }

        return false;
    },
    touchMoved: function(opts) {
        var touch = opts['touch'],
            event = opts['event'];

            var currentItem = this.itemForTouch(touch);

            if (currentItem != this.selectedItem) {
                if (this.selectedItem) {
                    this.selectedItem.set('isSelected', false);
                }
                this.set('selectedItem', currentItem);
                if (this.selectedItem) {
                    this.selectedItem.set('isSelected', true);
                }
            }
        
    },
    touchEnded: function(opts) {
        var touch = opts['touch'],
            event = opts['event'];

        if (this.selectedItem) {
            this.selectedItem.set('isSelected', false);
            this.selectedItem.activate();
        }

        this.set('state', kMenuStateWaiting);
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
            return arguments.callee.call(this, {child:params, z:0});
        }

        var child = params['child'],
            z = params['z'],
            tag = params['tag'];

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

        child.set('zOrder', z);

        child.set('parent', this);

        if (this.isRunning) {
            child.onEnter();
        }

        return this;
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
    resumeSchedulerAndActions: function() {
        Scheduler.get('sharedScheduler').resumeTarget(this);
        ActionManager.get('sharedManager').resumeTarget(this);
    },
    pauseSchedulerAndActions: function() {
        Scheduler.get('sharedScheduler').pauseTarget(this);
        ActionManager.get('sharedManager').pauseTarget(this);
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
        this.sprite = Sprite.create({texture: atlas, rect: {origin: ccp(0,0), size: {width: width, height: height}}});

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
    ccp = require('geometry').ccp;

/** @member cocos
 * @class
 */
var Sprite = Node.extend(/** @scope cocos.Sprite# */{
    texture: null,
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

        var file = opts['file'],
            texture = opts['texture'],
            spritesheet = opts['spritesheet'],
            rect = opts['rect'];

        if (file) {
            texture = TextureAtlas.create({file:file});
        } else if (spritesheet) {
            texture = spritesheet.get('textureAtlas');
            this.set('useSpriteSheet', true);
        } else if (!texture && !file) {
            //throw "Sprite has no texture or file";
        }

        if (!rect && texture) {
            rect = {origin: ccp(0,0), size:{width: texture.texture.size.width, height: texture.texture.size.height}};
        }

        if (rect) {
            this.set('rect', rect);
            this.set('contentSize', rect.size);
        }

        this.quad = {
            drawRect: {origin: ccp(0, 0), size: rect.size},
            textureRect: rect
        };

        this.set('textureAtlas', texture);
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

        this.quad.drawRect.size = {width: this.rect.size.width, height: this.rect.size.height};
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
    }
});

module.exports.Sprite = Sprite;

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

	init: function(opts) {
		var file = opts['file'],
			data = opts['data'],
			texture = opts['texture'];

		if (file) {
			data = resource(file);
		} else if (texture) {
			data = texture.get('data');
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
		
		// Create texture with whatever we were given
		if (!canvas) {
			var texture = this.set('texture', Texture2D.create({texture: texture, file: file, data: data}));
			this.imgElement = texture.get('imgElement');
		} else {
			this.imgElement = canvas;
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

window.__resources__['/index.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
require('./tests/SpriteTest');

}};

window.__resources__['/hello_world/HelloWorldAppDelegate.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos'),
    HelloWorld = require('./HelloWorldScene').HelloWorld;

exports.HelloWorldAppDelegate = cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(HelloWorld.get('scene'));
    }
});


}};

window.__resources__['/hello_world/HelloWorldScene.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    cocos = require('cocos'),
    ccp = require('geometry').ccp;

var HelloWorld = cocos.Layer.extend({
    init: function() {
        arguments.callee.base.apply(this, arguments);

        var label = cocos.Label.create({string: 'Hello, World', fontName: 'Marker Felt', fontSize: 64});

        var size = cocos.Director.get('sharedDirector.winSize');
        label.set('position', ccp(size.width / 2, size.height / 2));
        this.addChild(label);
    }
});

HelloWorld.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

exports.HelloWorld = HelloWorld;

}};

window.__resources__['/hello_world/main.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    cocos = require('cocos'),
    delegate = require('./HelloWorldAppDelegate.js');

sys.ApplicationMain(delegate.HelloWorldAppDelegate);

}};

window.__resources__["/hello_world/resources/firefox-icon.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};

window.__resources__['/tests/BasicSpriteTest.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    cocos = require('cocos2d'),
    ccp = require('geometry').ccp;

var SpriteTestDemo = cocos.Layer.extend({
    title: 'Sprite Test',
    subtitle: '',

    init: function() {
        arguments.callee.base.apply(this, arguments);

        var s = cocos.Director.get('sharedDirector.winSize');
        var label = cocos.Label.create({string: this.get('title'), fontName: 'Arial', fontSize: 32});
        this.addChild(label);
        label.set('position', ccp(s.width / 2, 50));


		var subtitle = this.get('subtitle');
		if (subtitle) {
			var l = cocos.Label.create({string:subtitle, fontName: "Thonburi", fontSize: 16});
            this.addChild(l);
			l.set('position', ccp(s.width/2, 80));
		}

        this.addNewSprite(ccp(s.width /2, s.height /2));
    },

    addNewSprite: function(point) {
        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx%5) * 85,
            y = (idx%3) * 121;

        //CCSprite *sprite = [CCSprite spriteWithFile:@"grossini_dance_atlas.png" rect:CGRectMake(x,y,85,121)];
        var sprite = cocos.Sprite.create({file: __dirname + "/resources/grossini_dance_atlas.png", rect:{origin:ccp(x, y), size:{width: 85, height: 121}}})
        this.addChild(sprite);
        sprite.set('position', ccp(point.x, point.y));

        var action, actionBack, seq;

        action = cocos.ScaleBy.create({duration:3, scale:2});
        actionBack = action.reverse();
        seq = cocos.Sequence.create({actions:[action, actionBack]});
        sprite.runAction(cocos.RepeatForever.create(seq));
        
        /*
        id action;
        float rand = CCRANDOM_0_1();
        
        if( rand < 0.20 )
            action = [CCScaleBy actionWithDuration:3 scale:2];
        else if(rand < 0.40)
            action = [CCRotateBy actionWithDuration:3 angle:360];
        else if( rand < 0.60)
            action = [CCBlink actionWithDuration:1 blinks:3];
        else if( rand < 0.8 )
            action = [CCTintBy actionWithDuration:2 red:0 green:-255 blue:-255];
        else 
            action = [CCFadeOut actionWithDuration:2];
        id action_back = [action reverse];
        id seq = [CCSequence actions:action, action_back, nil];
        
        [sprite runAction: [CCRepeatForever actionWithAction:seq]];
        */
        
    }
});

SpriteTestDemo.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(SpriteTestDemo.get('scene'));
    }
}));

}};

window.__resources__['/tests/SpriteSheetTest.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys    = require('sys'),
    cocos  = require('cocos2d'),
    ccp    = require('geometry').ccp;


var kTagSpriteSheet = 1;

var SpriteSheetTestDemo = cocos.Layer.extend({
    title: 'SpriteSheet Test',
    subtitle: '',
    sheet: null,

    init: function() {
        arguments.callee.base.apply(this, arguments);

        var s = cocos.Director.get('sharedDirector.winSize');
        var label = cocos.Label.create({string: this.get('title'), fontName: 'Arial', fontSize: 32});
        this.addChild(label);
        label.set('position', ccp(s.width / 2, 50));


		var subtitle = this.get('subtitle');
		if (subtitle) {
			var l = cocos.Label.create({string:subtitle, fontName: "Thonburi", fontSize: 16});
            this.addChild(l);
			l.set('position', ccp(s.width/2, 80));
		}


        var sheet = this.set('sheet', cocos.SpriteSheet.create({file: __dirname + "/resources/grossini_dance_atlas.png"}));
        this.addChild({child: sheet, z:0, tag:kTagSpriteSheet});

        this.addNewSprite(ccp(s.width /2, s.height /2));
    },

    addNewSprite: function(point) {
        var sheet = this.get('sheet');

        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx%5) * 85,
            y = (idx%3) * 121;

        var sprite = cocos.Sprite.create({rect:{origin:ccp(x, y), size:{width: 85, height: 121}}})
        sheet.addChild(sprite);
        sprite.set('position', ccp(point.x, point.y));


        var action, actionBack, seq;

        action = cocos.ScaleBy.create({duration:3, scale:2});
        actionBack = action.reverse();
        seq = cocos.Sequence.create({actions:[action, actionBack]});
        sprite.runAction(cocos.RepeatForever.create(seq));
    }

});

SpriteSheetTestDemo.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(SpriteSheetTestDemo.get('scene'));
    }
}));

}};

window.__resources__['/tests/SpriteTest.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys = require('sys'),
    cocos = require('cocos2d'),
    ccp = require('geometry').ccp;

var SpriteDemo = cocos.Layer.extend({
    title: 'No title',
    subtitle: null,

    init: function() {
        arguments.callee.base.apply(this, arguments);

        var s = cocos.Director.get('sharedDirector.winSize');
        var label = cocos.Label.create({string: this.get('title'), fontName: 'Arial', fontSize: 32});
        this.addChild({child: label, z:1});
        label.set('position', ccp(s.width / 2, 50));


		var subtitle = this.get('subtitle');
		if (subtitle) {
			var l = cocos.Label.create({string:subtitle, fontName: "Thonburi", fontSize: 16});
            this.addChild({child: l, z:1});
			l.set('position', ccp(s.width/2, 80));
		}


		var item1 = cocos.MenuItemImage.create({normalImage:__dirname + "/resources/b1.png", selectedImage:__dirname + "/resources/b2.png", callback:sys.callback(this, 'backCallback')});
		var item2 = cocos.MenuItemImage.create({normalImage:__dirname + "/resources/r1.png", selectedImage:__dirname + "/resources/r2.png", callback:sys.callback(this, 'restartCallback')});
		var item3 = cocos.MenuItemImage.create({normalImage:__dirname + "/resources/f1.png", selectedImage:__dirname + "/resources/f2.png", callback:sys.callback(this, 'nextCallback')});

        var menu = cocos.Menu.create({items: [item1, item2, item3]});
        menu.set('position', ccp(0,0));
        item1.set('position', ccp(s.width /2 -100, s.height -30));
        item2.set('position', ccp(s.width /2,      s.height -30));
        item3.set('position', ccp(s.width /2 +100, s.height -30));

        this.addChild({child: menu, z:1});
        
	},

	restartCallback: function() {
	},

	backCallback: function() {
	},

	nextCallback: function() {
	}
});

SpriteDemo.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();


var Sprite1 = SpriteDemo.extend({
	title: 'Sprite (tap screen)',

	init: function() {
		arguments.callee.base.apply(this, arguments);
		this.set('isTouchEnabled', true);

        var s = cocos.Director.get('sharedDirector.winSize');
        this.addNewSprite(ccp(s.width /2, s.height /2));
	},

	addNewSprite: function(point) {
        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx%5) * 85,
            y = (idx%3) * 121;

        //CCSprite *sprite = [CCSprite spriteWithFile:@"grossini_dance_atlas.png" rect:CGRectMake(x,y,85,121)];
        var sprite = cocos.Sprite.create({file: __dirname + "/resources/grossini_dance_atlas.png", rect:{origin:ccp(x, y), size:{width: 85, height: 121}}})
        this.addChild({child:sprite, z:0});
        sprite.set('position', ccp(point.x, point.y));

        var action, actionBack, seq;
        var rand = Math.random();

        if (rand < 0.2) {
            action = cocos.ScaleBy.create({duration:3, scale:2});
        } else if (rand < 0.4) {
            action = cocos.RotateBy.create({duration:3, angle:360});
        } else if (rand < 0.6) {
            action = cocos.ScaleBy.create({duration:3, scale:2});
            //action = cocos.Blink.create({duration:3, scale:2});
        } else if (rand < 0.8) {
            action = cocos.RotateBy.create({duration:3, angle:360});
            //action = cocos.TintBy.create({duration:3, scale:2});
        } else {
            action = cocos.ScaleBy.create({duration:3, scale:2});
            //action = cocos.FadeOut.create({duration:3, scale:2});
        }




        actionBack = action.reverse();
        seq = cocos.Sequence.create({actions:[action, actionBack]});
        sprite.runAction(cocos.RepeatForever.create(seq));
        
	},
	touchesEnded: function(opts) {
		var touches = opts['touches'],
			event = opts['event'];

		this.addNewSprite(touches[0].location);
	}
});













sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(Sprite1.get('scene'));
    }
}));

}};

window.__resources__['/tests/TileMapTest.js'] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var sys    = require('sys'),
    cocos  = require('cocos2d'),
    path   = require('path'),
    ccp    = require('geometry').ccp;

var r = 0.0;
var TileMapTestDemo = cocos.Layer.extend({
    title: 'Tile Map Test',
    subtitle: '',

    init: function() {
        arguments.callee.base.apply(this, arguments);

        var s = cocos.Director.get('sharedDirector.winSize');
        var label = cocos.Label.create({string: this.get('title'), fontName: 'Arial', fontSize: 32});
        this.addChild(label);
        label.set('position', ccp(s.width / 2, 50));


        var subtitle = this.get('subtitle');
        if (subtitle) {
            var l = cocos.Label.create({string:subtitle, fontName: "Thonburi", fontSize: 16});
            this.addChild(l);
            l.set('position', ccp(s.width/2, 80));
        }


        var tmx = cocos.TMXTiledMap.create({file: path.join(__dirname, "/resources/TileMaps/orthogonal-test2.tmx")});
        tmx.set('anchorPoint', ccp(0, 0));
        tmx.set('position', ccp(0, 0));

        var rt = cocos.RenderTexture.create({width: tmx.mapSize.width * tmx.tileSize.width, height: tmx.mapSize.height * tmx.tileSize.height});
        rt.set('position', ccp(Math.round(s.width/2), Math.round(s.height/2)));

        rt.set('scale', 0.25);
        tmx.visit(rt.context);

        this.addChild(rt);

        var action, actionBack, seq;
        action = cocos.ScaleBy.create({duration:3, scale:2});
        actionBack = action.reverse();
        seq = cocos.Sequence.create({actions:[action, actionBack]});
        rt.runAction(cocos.RepeatForever.create(seq));

        console.log('Tilemap: ', tmx);
    },

});

TileMapTestDemo.scene = function(key, val) {
    var scene = cocos.Scene.create();
    scene.addChild(this.create());
    return scene;
}.property();

sys.ApplicationMain(cocos.AppDelegate.extend({
    applicationDidFinishLaunching: function () {
        var director = cocos.Director.get('sharedDirector');
        director.attachInView(document.getElementById('hello-world'));
        director.runWithScene(TileMapTestDemo.get('scene'));
    }
}));

}};

window.__resources__["/tests/resources/b1.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};

window.__resources__["/tests/resources/b2.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};

window.__resources__["/tests/resources/f1.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};

window.__resources__["/tests/resources/f2.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};

window.__resources__["/tests/resources/grossini_dance_atlas.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};

window.__resources__["/tests/resources/r1.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};

window.__resources__["/tests/resources/r2.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};

window.__resources__["/tests/resources/TileMaps/fixed-ortho-test2.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};

window.__resources__["/tests/resources/TileMaps/orthogonal-test2.tmx"] = {meta: {mimetype: "application/xml"}, data: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE map SYSTEM \"http://mapeditor.org/dtd/1.0/map.dtd\">\n<map version=\"1.0\" orientation=\"orthogonal\" width=\"64\" height=\"64\" tilewidth=\"32\" tileheight=\"32\">\n <tileset firstgid=\"1\" name=\"tile 0\" tilewidth=\"32\" tileheight=\"32\" spacing=\"2\" margin=\"2\">\n  <image source=\"fixed-ortho-test2.png\"/>\n </tileset>\n <layer name=\"Layer 0\" width=\"64\" height=\"64\">\n  <data encoding=\"base64\" compression=\"gzip\">\n   H4sIAAAAAAAAA+2bS2/UMBDHDSyUHpBgOZVXV0ALEqKwS8sRhLj0CILyBeAAJ7gARygPiSLBhcciwZX3Q3CCG3w0ZtS1mJixM7GdxFHyk/7aJHKS+cePOLZXqY6Ojo7/WQM9rjuIGvkN+lN3ECXTA20WqldTjB3VMGsIGRlClgwhQ0bIgFGqzDLHRsz2EpNuaNkfqLQ9U8rwrxmo9J9F28t/RwfHNCNkm6G2QP1T6P4T0NNqwqkcif8qKftZu8o/Req/aWVj2nI8z/95h5qEr//DDjWJEP8nVNb3omqmf5/3X5Py/xPoM9GXCNfUXi8Rpeq/DHzz/z7oQbmhJc1P0K+6g5jgWy/2gPaC9nncMyX/viyAjoGO56T7CvpmHHuvmu8fuSBIw40xp57/30E/VP78wBljfztoB9mndYvWq9T9a2zzA3rsSOf/YPK7H3RAcF30/yEksBLY6pA0HZeeI8X8l77LXemkfZ9noOegF4xeBvrwxeXnImhFZft3If6blv8uf2OPe6XoX6PbfgljoiKk7F/KmJGUOtv/66AbgdfgvBd5BnXmP/Y9Yz372OW/inHDt6B3ka7VxPqP/m3vXono+7lK/yHfm5QU85/Op9qQfm/mEdO/C1xPs6Wg8pB8b+ZRlf8y8PF/B3SXaBV0T3BekX5QVcTI/5jfHj59XxebGFFilv+PnqqTGP5129tG/xsM+fivem53Y46KUMSnbv9Syv9QfMt82/3rMt9W/23J/z7Z1vM2If5d85x1rJGR+r+m/o394/6IpFkscL/Y37mhYzcS/z1G+G0ypdbH9m3/EbgMugK6So6hf66v+ZA5vy+IP/R5uto17X+OaOfkVzK+fRN0C3TbES9X5vWxg4L4Y/s3hTGg33mVfQ7S8f1Hlngldf2kIH7J83Shfc6AdoF2q6x/jGGOkfZ9SGX9m/en/kckXm7dvXnuMtk2v1m1VlWc/D8COg06qrL+l+2niqD+pxi5KFr/R66EFqjXU4pv/0JA/68m20XnxfLqv7lOxWcNV55/SRuEvAa9YY7T/Ee/8ypbd1xg3VtT5f4fMc+/pA1C6LoAur5F+8dxkSL5j2so+4pfb+BTzjnwfyzU6zm13i6Z9X9guTfGqPs+NE66bea/1L/vmgLuf0omQ+H1Y2llIts8OqezAvnG8xeas1zUAEAAAA==\n  </data>\n </layer>\n</map>\n"};

window.__resources__["/tests/resources/TileMaps/orthogonal-test4.tmx"] = {meta: {mimetype: "application/xml"}, data: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE map SYSTEM \"http://mapeditor.org/dtd/1.0/map.dtd\">\n<map version=\"1.0\" orientation=\"orthogonal\" width=\"14\" height=\"8\" tilewidth=\"32\" tileheight=\"32\">\n <tileset name=\"Desert\" firstgid=\"1\" tilewidth=\"32\" tileheight=\"32\" spacing=\"1\" margin=\"1\">\n  <image source=\"tmw_desert_spacing.png\"/>\n </tileset>\n <layer name=\"Layer 0\" width=\"14\" height=\"8\">\n  <data encoding=\"base64\" compression=\"gzip\">\n   H4sIAAAAAAAAAFNjYGCQIxFrQGlGIGYCYmYglgRiKSiWRpJjQlID088JxFxAzA3EikCsAsSqQKwMlRMBYiEgFoWqwaVPB4h1kfRxI6nDpw/dPmL1odsnA/WbLJo+Qaj7hYFYE4i1oFgbSU4ISQ1Ijz4Z8WAAxADxIVkbwAEAAA==\n  </data>\n </layer>\n</map>\n"};
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

        var cachedModule = parent.moduleCache[filename];
        if (cachedModule) {
            return cachedModule.exports;
        }

        var module = new Module(id, parent);
        module.moduleCache[filename] = module;
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


    // Manually load the path module because we need to to load other modules
    path = (new Module('path'))._initialize('/libs/path.js').exports;

    process.mainModule = (new Module('/'))._initialize('/index.js');
})();
