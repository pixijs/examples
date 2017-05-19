/*!
 * pixi-compressed-textures - v1.1.2
 * Compiled Thu, 02 Mar 2017 09:55:50 UTC
 *
 * pixi-compressed-textures is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pixiCompressedTextures = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function CompressedImage(src, data, type, width, height, levels, internalFormat) {
    CompressedImage.prototype.init.apply(this, arguments);
}

module.exports = CompressedImage;

CompressedImage.prototype.init = function(src, data, type, width, height, levels, internalFormat) {
    this.src = src;
    this.width = width;
    this.height = height;
    this.data = data;
    this.type = type;
    this.levels = levels;
    this.internalFormat = internalFormat;
    this.isCompressedImage = true;

    var oldComplete = this.complete;
    this.complete = !!data;
    if (!oldComplete && this.complete && this.onload) {
        this.onload( { target: this } );
    }
    return this;
};

CompressedImage.prototype.dispose = function() {
    this.data = null;
};

CompressedImage.prototype.generateWebGLTexture = function (gl, preserveSource) {
    if (this.data === null) {
        throw "Trying to create a second (or more) webgl texture from the same CompressedImage : " + this.src;
    }

    var width = this.width;
    var height = this.height;
    var levels = this.levels;
    var offset = 0;
    // Loop through each mip level of compressed texture data provided and upload it to the given texture.
    for (var i = 0; i < this.levels; ++i) {
        // Determine how big this level of compressed texture data is in bytes.
        var levelSize = textureLevelSize(this.internalFormat, width, height);
        // Get a view of the bytes for this level of DXT data.
        var dxtLevel = new Uint8Array(this.data.buffer, this.data.byteOffset + offset, levelSize);
        // Upload!
        gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, width, height, 0, dxtLevel);
        // The next mip level will be half the height and width of this one.
        width = width >> 1;
        if (width < 1)
            width = 1;
        height = height >> 1;
        if (height < 1)
            height = 1;
        // Advance the offset into the compressed texture data past the current mip level's data.
        offset += levelSize;
    }

    // We can't use gl.generateMipmaps with compressed textures, so only use
    // mipmapped filtering if the compressed texture data contained mip levels.
    if (levels > 1) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    }
    else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    // Cleaning the data to save memory. NOTE : BECAUSE OF THIS WE CANNOT CREATE TWO GL TEXTURE FROM THE SAME COMPRESSED IMAGE !
    if (!preserveSource)
        this.data = null;
};

/**
 * Load a compressed image from an array buffer
 * @param arrayBuffer the buffer contains the image
 * @return the loaded CompressedImage
 */
CompressedImage.loadFromArrayBuffer = function (arrayBuffer, src) {
    return new CompressedImage(src).loadFromArrayBuffer(arrayBuffer);
};

CompressedImage.prototype.loadFromArrayBuffer = function(arrayBuffer, crnLoad) {
    var head = new Uint8Array(arrayBuffer, 0, 3);

    //todo: implement onload

    if (head[0] == "DDS".charCodeAt(0) && head[1] == "DDS".charCodeAt(1) && head[2] == "DDS".charCodeAt(2))
        return this._loadDDS(arrayBuffer);
    else if (head[0] == "PVR".charCodeAt(0) && head[1] == "PVR".charCodeAt(1) && head[2] == "PVR".charCodeAt(2))
        return this._loadPVR(arrayBuffer);
    else if(crnLoad)
        return this._loadCRN(arrayBuffer);
    else
        throw "Compressed texture format is not recognized: " + src;

    return this;
};

CompressedImage.prototype.arrayBufferCopy = function(src, dst, dstByteOffset, numBytes) {
    dst32Offset = dstByteOffset / 4;
    var tail = (numBytes % 4);
    var src32 = new Uint32Array(src.buffer, 0, (numBytes - tail) / 4);
    var dst32 = new Uint32Array(dst.buffer);
    for (var ii = 0; ii < src32.length; ii++) {
        dst32[dst32Offset + ii] = src32[ii];
    }
    for (var i = numBytes - tail; i < numBytes; i++) {
        dst[dstByteOffset + i] = src[i];
    }
};

CompressedImage.prototype._loadCRN = function(arrayBuffer) {
    // Taken from crnlib.h
    CRN_FORMAT = { cCRNFmtInvalid: -1, cCRNFmtDXT1: 0, cCRNFmtDXT3: 1, cCRNFmtDXT5: 2, cCRNFmtDXT5_CCxY: 3, cCRNFmtDXT5_xGxR: 4,
                                 cCRNFmtDXT5_xGBR: 5, cCRNFmtDXT5_AGBR: 6, cCRNFmtDXN_XY: 7, cCRNFmtDXN_YX: 8, cCRNFmtDXT5A: 9};
    CRN_FORMAT_NAMES = {};
    for (var name in CRN_FORMAT) {
      CRN_FORMAT_NAMES[CRN_FORMAT[name]] = name;
    }
    DXT_FORMAT_MAP = {};
    DXT_FORMAT_MAP[CRN_FORMAT.cCRNFmtDXT1] = COMPRESSED_RGB_S3TC_DXT1_EXT;
    DXT_FORMAT_MAP[CRN_FORMAT.cCRNFmtDXT3] = COMPRESSED_RGBA_S3TC_DXT3_EXT;
    DXT_FORMAT_MAP[CRN_FORMAT.cCRNFmtDXT5] = COMPRESSED_RGBA_S3TC_DXT5_EXT;


    var srcSize = 0;
    var bytes = 0;
    var src = 0;

    srcSize = arrayBuffer.byteLength;
    bytes = new Uint8Array(arrayBuffer);
    src = Module._malloc(srcSize);
    CompressedImage.prototype.arrayBufferCopy(bytes, Module.HEAPU8, src, srcSize);
    var width = Module._crn_get_width(src, srcSize);
    var height = Module._crn_get_height(src, srcSize);
    var levels = Module._crn_get_levels(src, srcSize);
    var format = Module._crn_get_dxt_format(src, srcSize);

    srcSize = arrayBuffer.byteLength;
    bytes = new Uint8Array(arrayBuffer);
    src = Module._malloc(srcSize);
    CompressedImage.prototype.arrayBufferCopy(bytes, Module.HEAPU8, src, srcSize);
    var dstSize = Module._crn_get_uncompressed_size(src, srcSize);
    var dst = Module._malloc(dstSize);
    Module._crn_decompress(src, srcSize, dst, dstSize);
    var dxtData = new Uint8Array(Module.HEAPU8.buffer, dst, dstSize);
    var internalFormat = DXT_FORMAT_MAP[format];
    Module._free(src);
    Module._free(dst);

    return this.init(this.src, dxtData, 'DDS', width, height, levels, internalFormat);
};
/**
 * Load a DDS compressed image from an array buffer
 * @param arrayBuffer the buffer contains the image
 * @return the loaded CompressedImage
 */
CompressedImage.prototype._loadDDS = function(arrayBuffer) {
    // Get a view of the arrayBuffer that represents the DDS header.
    var header = new Int32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);

    // Do some sanity checks to make sure this is a valid DDS file.
    if (header[DDS_HEADER_MAGIC] != DDS_MAGIC)
        throw "Invalid magic number in DDS header";

    if (!header[DDS_HEADER_PF_FLAGS] & DDPF_FOURCC)
        throw "Unsupported format, must contain a FourCC code";

    // Determine what type of compressed data the file contains.
    var fourCC = header[DDS_HEADER_PF_FOURCC];
    var internalFormat;
    switch (fourCC) {
        case FOURCC_DXT1:
            internalFormat = COMPRESSED_RGB_S3TC_DXT1_EXT;
            break;
        case FOURCC_DXT3:
            internalFormat = COMPRESSED_RGBA_S3TC_DXT3_EXT;
            break;
        case FOURCC_DXT5:
            internalFormat = COMPRESSED_RGBA_S3TC_DXT5_EXT;
            break;
        case FOURCC_ATC:
            internalFormat = COMPRESSED_RGB_ATC_WEBGL;
            break;
        case FOURCC_ATCA:
            internalFormat = COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL;
            break;
        case FOURCC_ATCI:
            internalFormat = COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL;
            break;
        default:
            throw "Unsupported FourCC code: " + int32ToFourCC(fourCC);
    }

    // Determine how many mipmap levels the file contains.
    var levels = 1;
    if (header[DDS_HEADER_FLAGS] & DDSD_MIPMAPCOUNT) {
        levels = Math.max(1, header[DDS_HEADER_MIPMAPCOUNT]);
    }

    // Gather other basic metrics and a view of the raw the DXT data.
    var width = header[DDS_HEADER_WIDTH];
    var height = header[DDS_HEADER_HEIGHT];
    var dataOffset = header[DDS_HEADER_SIZE] + 4;
    var dxtData = new Uint8Array(arrayBuffer, dataOffset);

    return this.init(this.src, dxtData, 'DDS', width, height, levels, internalFormat);
};

/**
 * Load a PVR compressed image from an array buffer
 * @param arrayBuffer the buffer contains the image
 * @return the loaded CompressedImage
 */
CompressedImage.prototype._loadPVR = function(arrayBuffer) {
    // Get a view of the arrayBuffer that represents the DDS header.
    var header = new Int32Array(arrayBuffer, 0, PVR_HEADER_LENGTH);

    // Do some sanity checks to make sure this is a valid DDS file.
    if (header[PVR_HEADER_MAGIC] != PVR_MAGIC)
        throw "Invalid magic number in PVR header";

    // Determine what type of compressed data the file contains.
    var format = header[PVR_HEADER_FORMAT];
    var internalFormat;
    switch (format) {
        case PVR_FORMAT_2BPP_RGB:
            internalFormat = COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
            break;
        case PVR_FORMAT_2BPP_RGBA:
            internalFormat = COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
            break;
        case PVR_FORMAT_4BPP_RGB:
            internalFormat = COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
            break;
        case PVR_FORMAT_4BPP_RGBA:
            internalFormat = COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
            break;
        case PVR_FORMAT_ETC1:
            internalFormat = COMPRESSED_RGB_ETC1_WEBGL;
            break;
        case PVR_FORMAT_DXT1:
            internalFormat = COMPRESSED_RGB_S3TC_DXT1_EXT;
            break;
        case PVR_FORMAT_DXT3:
            internalFormat = COMPRESSED_RGBA_S3TC_DXT3_EXT;
            break;
        case PVR_FORMAT_DXT5:
            internalFormat = COMPRESSED_RGBA_S3TC_DXT5_EXT;
            break;
        default:
            throw "Unsupported PVR format: " + format;
    }

    // Gather other basic metrics and a view of the raw the DXT data.
    var width = header[PVR_HEADER_WIDTH];
    var height = header[PVR_HEADER_HEIGHT];
    var levels = header[PVR_HEADER_MIPMAPCOUNT];
    var dataOffset = header[PVR_HEADER_METADATA] + 52;
    var pvrtcData = new Uint8Array(arrayBuffer, dataOffset);

    return this.init(this.src, pvrtcData, 'PVR', width, height, levels, internalFormat);
};


//============================//
// DXT constants and utilites //
//============================//

// Utility functions
// Builds a numeric code for a given fourCC string
function fourCCToInt32(value) {
    return value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24);
}

// Turns a fourCC numeric code into a string
function int32ToFourCC(value) {
    return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
    );
}

// Calcualates the size of a compressed texture level in bytes
function textureLevelSize(format, width, height) {
    switch (format) {
        case COMPRESSED_RGB_S3TC_DXT1_EXT:
        case COMPRESSED_RGB_ATC_WEBGL:
        case COMPRESSED_RGB_ETC1_WEBGL:
            return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;

        case COMPRESSED_RGBA_S3TC_DXT3_EXT:
        case COMPRESSED_RGBA_S3TC_DXT5_EXT:
        case COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL:
        case COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL:
            return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;

        case COMPRESSED_RGB_PVRTC_4BPPV1_IMG:
        case COMPRESSED_RGBA_PVRTC_4BPPV1_IMG:
            return Math.floor((Math.max(width, 8) * Math.max(height, 8) * 4 + 7) / 8);

        case COMPRESSED_RGB_PVRTC_2BPPV1_IMG:
        case COMPRESSED_RGBA_PVRTC_2BPPV1_IMG:
            return Math.floor((Math.max(width, 16) * Math.max(height, 8) * 2 + 7) / 8);

        default:
            return 0;
    }
}

// DXT formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
var COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
var COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
var COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
var COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

// ATC formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_atc/
var COMPRESSED_RGB_ATC_WEBGL = 0x8C92;
var COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 0x8C93;
var COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 0x87EE;

// DXT values and structures referenced from:
// http://msdn.microsoft.com/en-us/library/bb943991.aspx/
var DDS_MAGIC = 0x20534444;
var DDSD_MIPMAPCOUNT = 0x20000;
var DDPF_FOURCC = 0x4;

var DDS_HEADER_LENGTH = 31; // The header length in 32 bit ints.

// Offsets into the header array.
var DDS_HEADER_MAGIC = 0;

var DDS_HEADER_SIZE = 1;
var DDS_HEADER_FLAGS = 2;
var DDS_HEADER_HEIGHT = 3;
var DDS_HEADER_WIDTH = 4;

var DDS_HEADER_MIPMAPCOUNT = 7;

var DDS_HEADER_PF_FLAGS = 20;
var DDS_HEADER_PF_FOURCC = 21;

// FourCC format identifiers.
var FOURCC_DXT1 = fourCCToInt32("DXT1");
var FOURCC_DXT3 = fourCCToInt32("DXT3");
var FOURCC_DXT5 = fourCCToInt32("DXT5");

var FOURCC_ATC = fourCCToInt32("ATC ");
var FOURCC_ATCA = fourCCToInt32("ATCA");
var FOURCC_ATCI = fourCCToInt32("ATCI");

//===============//
// PVR constants //
//===============//

// PVR formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_pvrtc/
var COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
var COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01;
var COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
var COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03;

// ETC1 format, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_etc1/
var COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;

var PVR_FORMAT_2BPP_RGB = 0;
var PVR_FORMAT_2BPP_RGBA = 1;
var PVR_FORMAT_4BPP_RGB = 2;
var PVR_FORMAT_4BPP_RGBA = 3;
var PVR_FORMAT_ETC1 = 6;
var PVR_FORMAT_DXT1 = 7;
var PVR_FORMAT_DXT3 = 9;
var PVR_FORMAT_DXT5 = 5;

var PVR_HEADER_LENGTH = 13; // The header length in 32 bit ints.
var PVR_MAGIC = 0x03525650; //0x50565203;

// Offsets into the header array.
var PVR_HEADER_MAGIC = 0;
var PVR_HEADER_FORMAT = 2;
var PVR_HEADER_HEIGHT = 6;
var PVR_HEADER_WIDTH = 7;
var PVR_HEADER_MIPMAPCOUNT = 11;
var PVR_HEADER_METADATA = 12;

},{}],2:[function(require,module,exports){
/**
 * Created by Liza on 12.12.2015.
 */

var core = PIXI,
    CompressedImage = require('./CompressedImage'),
    WebGLManager = core.WebGLManager;
/**
 * @class
 * @memberof PIXI.compressedTextures
 * @extends PIXI.WebGlManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function CompressedTextureManager(renderer) {
    WebGLManager.call(this, renderer);
}

CompressedTextureManager.prototype = Object.create(WebGLManager.prototype);
CompressedTextureManager.prototype.constructor = CompressedTextureManager;
module.exports = CompressedTextureManager;

core.WebGLRenderer.registerPlugin('compressedTextureManager', CompressedTextureManager);

CompressedTextureManager.prototype.getSupportedExtensions = function () {
    var gl = this.renderer.gl;
    function getExtension(gl, name) {
        var vendorPrefixes = ["", "WEBKIT_", "MOZ_"];
        var ext = null;
        for (var i in vendorPrefixes) {
            ext = gl.getExtension(vendorPrefixes[i] + name);
            if (ext) {
                break;
            }
        }
        return ext;
    }

    return {
        dxt: getExtension(gl, "WEBGL_compressed_texture_s3tc"),
        pvrtc: getExtension(gl, "WEBGL_compressed_texture_pvrtc"),
        atc: getExtension(gl, "WEBGL_compressed_texture_atc")
    };
};

},{"./CompressedImage":1}],3:[function(require,module,exports){
var CompressedImage = require('./CompressedImage');
var GLTexture = PIXI.glCore.GLTexture;

/**
 * @mixin
 */
var GLTextureMixin = {
    uploadNotCompressed: GLTexture.prototype.upload,
    isCompressed: false,
    upload: function(source)
    {   
        if (!(source instanceof CompressedImage)) {
            return this.uploadNotCompressed(source);
        }
        this.bind();

        var gl = this.gl;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);

        this.isCompressed = true;

        source.generateWebGLTexture(gl, true);
    },

    enableMipmap: function() {
        if (this.isCompressed) {
            return;
        }
        var gl = this.gl;

        this.bind();

        this.mipmap = true;

        gl.generateMipmap(gl.TEXTURE_2D);
    }
};

module.exports = GLTextureMixin;

},{"./CompressedImage":1}],4:[function(require,module,exports){
(function (process,__dirname){
function b(a){throw a}var aa=void 0,l=!0,n=null,r=!1;try{this.Module=Module}catch(qa){this.Module=Module={}}var Ca="object"===typeof process,Ea="object"===typeof window,Fa="function"===typeof importScripts,Ja=!Ea&&!Ca&&!Fa;if(Ca){Module.print=(function(a){process.stdout.write(a+"\n")});Module.printErr=(function(a){process.stderr.write(a+"\n")});var Ma=require("fs"),Na=require("path");Module.read=(function(a){var a=Na.normalize(a),c=Ma.readFileSync(a).toString();!c&&a!=Na.resolve(a)&&(a=path.join(__dirname,"..","src",a),c=Ma.readFileSync(a).toString());return c});Module.load=(function(a){Qa(read(a))});Module.arguments||(Module.arguments=process.argv.slice(2))}else{Ja?(Module.print=print,Module.printErr=printErr,Module.read="undefined"!=typeof read?read:(function(a){snarf(a)}),Module.arguments||("undefined"!=typeof scriptArgs?Module.arguments=scriptArgs:"undefined"!=typeof arguments&&(Module.arguments=arguments))):Ea?(Module.print||(Module.print=(function(a){console.log(a)})),Module.printErr||(Module.printErr=(function(a){console.log(a)})),Module.read=(function(a){var c=new XMLHttpRequest;c.open("GET",a,r);c.send(n);return c.responseText}),Module.arguments||"undefined"!=typeof arguments&&(Module.arguments=arguments)):Fa?Module.load=importScripts:b("Unknown runtime environment. Where are we?")}function Qa(a){eval.call(n,a)}"undefined"==!Module.load&&Module.read&&(Module.load=(function(a){Qa(Module.read(a))}));Module.printErr||(Module.printErr=(function(){}));Module.print||(Module.print=Module.printErr);Module.arguments||(Module.arguments=[]);Module.print=Module.print;Module.Jb=Module.printErr;function Ta(a){if(1==Ua){return 1}var c={"%i1":1,"%i8":1,"%i16":2,"%i32":4,"%i64":8,"%float":4,"%double":8}["%"+a];c||("*"==a[a.length-1]?c=Ua:"i"==a[0]&&(a=parseInt(a.substr(1)),Xa(0==a%8),c=a/8));return c}function Ya(a){var c=v;v+=a;v=v+3>>2<<2;return c}function ab(a){var c=bb;bb+=a;bb=bb+3>>2<<2;if(bb>=cb){for(;cb<=bb;){cb=2*cb+4095>>12<<12}var a=z,d=new ArrayBuffer(cb);z=new Int8Array(d);hb=new Int16Array(d);A=new Int32Array(d);B=new Uint8Array(d);C=new Uint16Array(d);E=new Uint32Array(d);ib=new Float32Array(d);lb=new Float64Array(d);z.set(a)}return c}var Ua=4,tb={},ub;function vb(a){Module.print(a+":\n"+Error().stack);b("Assertion: "+a)}function Xa(a,c){a||vb("Assertion failed: "+c)}var Hb=this;function Ib(a,c,d,f){var e=0;try{var i=eval("_"+a)}catch(j){try{i=Hb.Module["_"+a]}catch(g){}}Xa(i,"Cannot call unknown function "+a+" (perhaps LLVM optimizations or closure removed it?)");var h=0,a=f?f.map((function(a){var c=d[h++];"string"==c?(e||(e=v),c=Ya(a.length+1),Pb(a,c),a=c):"array"==c&&(e||(e=v),c=Ya(a.length),Qb(a,c),a=c);return a})):[],c=(function(a,c){if("string"==c){return Tb(a)}Xa("array"!=c);return a})(i.apply(n,a),c);e&&(v=e);return c}Module.ccall=Ib;Module.cwrap=(function(a,c,d){return(function(){return Ib(a,c,d,Array.prototype.slice.call(arguments))})});function Ub(a,c,d){d=d||"i8";"*"===d[d.length-1]&&(d="i32");switch(d){case"i1":z[a]=c;break;case"i8":z[a]=c;break;case"i16":hb[a>>1]=c;break;case"i32":A[a>>2]=c;break;case"i64":A[a>>2]=c;break;case"float":ib[a>>2]=c;break;case"double":Vb[0]=c;A[a>>2]=Wb[0];A[a+4>>2]=Wb[1];break;default:vb("invalid type for setValue: "+d)}}Module.setValue=Ub;Module.getValue=(function(a,c){c=c||"i8";"*"===c[c.length-1]&&(c="i32");switch(c){case"i1":return z[a];case"i8":return z[a];case"i16":return hb[a>>1];case"i32":return A[a>>2];case"i64":return A[a>>2];case"float":return ib[a>>2];case"double":return Wb[0]=A[a>>2],Wb[1]=A[a+4>>2],Vb[0];default:vb("invalid type for setValue: "+c)}return n});var Xb=1,I=2;Module.ALLOC_NORMAL=0;Module.ALLOC_STACK=Xb;Module.ALLOC_STATIC=I;function N(a,c,d){var f,e;"number"===typeof a?(f=l,e=a):(f=r,e=a.length);var i="string"===typeof c?c:n,d=[Yb,Ya,ab][d===aa?I:d](Math.max(e,i?1:c.length));if(f){return Zb(d,0,e),d}f=0;for(var j;f<e;){var g=a[f];"function"===typeof g&&(g=tb.Ib(g));j=i||c[f];0===j?f++:("i64"==j&&(j="i32"),Ub(d+f,g,j),f+=Ta(j))}return d}Module.allocate=N;function Tb(a,c){for(var d="undefined"==typeof c,f="",e=0,i,j=String.fromCharCode(0);;){i=String.fromCharCode(B[a+e]);if(d&&i==j){break}f+=i;e+=1;if(!d&&e==c){break}}return f}Module.Pointer_stringify=Tb;Module.Array_stringify=(function(a){for(var c="",d=0;d<a.length;d++){c+=String.fromCharCode(a[d])}return c});var $b,ac=4096,z,B,hb,C,A,E,ib,lb,v,bc,bb,ec=Module.TOTAL_STACK||5242880,cb=Module.TOTAL_MEMORY||10485760;Xa(!!Int32Array&&!!Float64Array&&!!(new Int32Array(1)).subarray&&!!(new Int32Array(1)).set,"Cannot fallback to non-typed array case: Code is too specialized");var fc=new ArrayBuffer(cb);z=new Int8Array(fc);hb=new Int16Array(fc);A=new Int32Array(fc);B=new Uint8Array(fc);C=new Uint16Array(fc);E=new Uint32Array(fc);ib=new Float32Array(fc);lb=new Float64Array(fc);A[0]=255;Xa(255===B[0]&&0===B[3],"Typed arrays 2 must be run on a little-endian system");var hc=gc("(null)");bb=hc.length;for(var ic=0;ic<hc.length;ic++){z[ic]=hc[ic]}Module.HEAP=aa;Module.HEAP8=z;Module.HEAP16=hb;Module.HEAP32=A;Module.HEAPU8=B;Module.HEAPU16=C;Module.HEAPU32=E;Module.HEAPF32=ib;Module.HEAPF64=lb;bc=(v=4*Math.ceil(bb/4))+ec;var pc=8*Math.ceil(bc/8);z.subarray(pc);var Wb=A.subarray(pc>>2);ib.subarray(pc>>2);var Vb=lb.subarray(pc>>3);bc=pc+8;bb=bc+4095>>12<<12;function qc(a){for(;0<a.length;){var c=a.shift(),d=c.R;"number"===typeof d&&(d=$b[d]);d(c.Za===aa?n:c.Za)}}var rc=[],sc=[],tc=[];function uc(a,c){return Array.prototype.slice.call(z.subarray(a,a+c))}Module.Array_copy=uc;Module.TypedArray_copy=(function(a,c,d){d===aa&&(d=0);for(var f=new Uint8Array(c-d),e=d;e<c;++e){f[e-d]=z[a+e]}return f.buffer});function vc(a){for(var c=0;z[a+c];){c++}return c}Module.String_len=vc;function wc(a,c){var d=vc(a);c&&d++;var f=uc(a,d);c&&(f[d-1]=0);return f}Module.String_copy=wc;function gc(a,c,d){var f=[],e=0;d===aa&&(d=a.length);for(;e<d;){var i=a.charCodeAt(e);255<i&&(i&=255);f.push(i);e+=1}c||f.push(0);return f}Module.intArrayFromString=gc;Module.intArrayToString=(function(a){for(var c=[],d=0;d<a.length;d++){var f=a[d];255<f&&(f&=255);c.push(String.fromCharCode(f))}return c.join("")});function Pb(a,c,d){for(var f=0;f<a.length;){var e=a.charCodeAt(f);255<e&&(e&=255);z[c+f]=e;f+=1}d||(z[c+f]=0)}Module.writeStringToMemory=Pb;function Qb(a,c){for(var d=0;d<a.length;d++){z[c+d]=a[d]}}Module.writeArrayToMemory=Qb;var R=[];function xc(a,c){return 0<=a?a:32>=c?2*Math.abs(1<<c-1)+a:Math.pow(2,c)+a}function yc(a,c){if(0>=a){return a}var d=32>=c?Math.abs(1<<c-1):Math.pow(2,c-1);if(a>=d&&(32>=c||a>d)){a=-2*d+a}return a}var zc=0;function Dc(a){a=a-1|0;a|=a>>>16;a|=a>>>8;a|=a>>>4;a|=a>>>2;return(a>>>1|a)+1|0}function Ec(a,c){var d=R.Ka|0,f=v;v+=512;for(var e=f|0,d=(ub=v,v+=12,A[ub>>2]=d,A[ub+4>>2]=c,A[ub+8>>2]=a,ub),d=Fc(R.Ca|0,d),i=d.length,j=0;j<i;j++){z[e+j]=d[j]}z[e+j]=0;i=(ub=v,v+=1,v=v+3>>2<<2,A[ub>>2]=0,ub);d=A[Gc>>2];j=Fc(e,i);e=v;i=N(j,"i8",Xb);j=1*j.length;0!=j&&-1==Hc(d,i,j)&&Ic[d]&&(Ic[d].error=l);v=e;v=f}function Jc(a,c,d,f,e){var i,j,g=v;v+=4;var h=a+4|0;j=(a+8|0)>>2;E[h>>2]>>>0>E[j]>>>0&&Ec(R.Da|0,2121);Math.floor(2147418112/(f>>>0))>>>0>c>>>0||Ec(R.Pa|0,2122);var k=E[j],o=k>>>0<c>>>0;do{if(o){var m=d?(0==(c|0)?0:0==(c-1&c|0))?c:Dc(c):c;0!=(m|0)&m>>>0>k>>>0||Ec(R.Ta|0,2131);var w=m*f|0;if(0==(e|0)){i=a|0;var t,x=A[i>>2],u=w,q=g;t=v;v+=4;0==(x&7|0)?2147418112<u>>>0?(Ec(R.aa|0,2500),q=0):(A[t>>2]=u,x=$b[A[Kc>>2]](x,u,t,1,A[Lc>>2]),0!=(q|0)&&(A[q>>2]=A[t>>2]),0!=(x&7|0)&&Ec(R.ba|0,2552),q=x):(Ec(R.Fa|0,2500),q=0);v=t;t=q;if(0==(t|0)){m=0;break}A[i>>2]=t}else{t=Mc(w,g);if(0==(t|0)){m=0;break}i=(a|0)>>2;$b[e](t,A[i],A[h>>2]);q=A[i];0!=(q|0)&&Nc(q);A[i]=t}i=E[g>>2];A[j]=i>>>0>w>>>0?Math.floor((i>>>0)/(f>>>0)):m}m=1}while(0);v=g;return m}Jc.X=1;function Mc(a,c){var d=v;v+=4;var f=a+3&-4,f=0==(f|0)?4:f;if(2147418112<f>>>0){Ec(R.aa|0,2500),f=0}else{A[d>>2]=f;var e=$b[A[Kc>>2]](0,f,d,1,A[Lc>>2]),i=E[d>>2];0!=(c|0)&&(A[c>>2]=i);0==(e|0)|i>>>0<f>>>0?(Ec(R.Ea|0,2500),f=0):(0!=(e&7|0)&&Ec(R.ba|0,2527),f=e)}v=d;return f}function Nc(a){if(0!=(a|0)){if(0==(a&7|0)){$b[A[Kc>>2]](a,0,0,1,A[Lc>>2])}else{Ec(R.Ga|0,2500)}}}function Oc(a,c,d,f){var e,i,j,g,h=a>>2,k=v;v+=200;var o;g=k>>2;var m=k+64;j=m>>2;var w=k+132,t=0==(c|0)|11<f>>>0;a:do{if(t){var x=0}else{A[h]=c;Zb(m,0,68);for(var u=0;;){var q=B[d+u|0];if(0!=q<<24>>24){var s=((q&255)<<2)+m|0;A[s>>2]=A[s>>2]+1|0}var p=u+1|0;if((p|0)==(c|0)){var y=1,D=-1,O=0,M=0,G=0;break}u=p}for(;;){var J=E[(y<<2>>2)+j];if(0==(J|0)){A[((y-1<<2)+28>>2)+h]=0;var K=G,F=M,ea=O,P=D}else{var ma=D>>>0<y>>>0?D:y,ba=O>>>0>y>>>0?O:y,ta=y-1|0;A[(ta<<2>>2)+g]=G;var ha=J+G|0,fa=16-y|0;A[((ta<<2)+28>>2)+h]=(ha-1<<fa|(1<<fa)-1)+1|0;A[((ta<<2)+96>>2)+h]=M;A[w+(y<<2)>>2]=M;K=ha;F=J+M|0;ea=ba;P=ma}var Ha=y+1|0;if(17==(Ha|0)){break}y=Ha;D=P;O=ea;M=F;G=K<<1}A[h+1]=F;i=(a+172|0)>>2;if(F>>>0>E[i]>>>0){var wa=(0==(F|0)?0:0==(F-1&F|0))?F:c>>>0<Dc(F)>>>0?c:Dc(F);A[i]=wa;var na=a+176|0,Aa=A[na>>2];if(0==(Aa|0)){var Ba=wa}else{Pc(Aa),Ba=A[i]}var $=Qc(Ba);A[na>>2]=$;if(0==($|0)){x=0;break}var oa=na}else{oa=a+176|0}var ia=a+24|0;z[ia]=P&255;z[a+25|0]=ea&255;for(var ra=0;;){var xa=B[d+ra|0],Da=xa&255;if(0!=xa<<24>>24){0==(A[(Da<<2>>2)+j]|0)&&Ec(R.Ua|0,2274);var ya=(Da<<2)+w|0,ca=E[ya>>2];A[ya>>2]=ca+1|0;ca>>>0<F>>>0||Ec(R.Va|0,2278);hb[A[oa>>2]+(ca<<1)>>1]=ra&65535}var ua=ra+1|0;if((ua|0)==(c|0)){break}ra=ua}var U=B[ia],V=(U&255)>>>0<f>>>0?f:0,Y=a+8|0;A[Y>>2]=V;var za=0!=(V|0);if(za){var L=1<<V,Z=a+164|0,va=L>>>0>E[Z>>2]>>>0;do{if(va){A[Z>>2]=L;var ja=a+168|0,da=A[ja>>2];0!=(da|0)&&Rc(da);var Q=Sc(L);A[ja>>2]=Q;if(0==(Q|0)){x=0;break a}Zb(Q,-1,L<<2);0==(V|0)?o=26:(pa=ja,o=34)}else{var H=a+168|0;Zb(A[H>>2],-1,L<<2);var pa=H;o=34}}while(0);b:do{if(34==o){for(var ga=1;;){var ka=0==(A[(ga<<2>>2)+j]|0);c:do{if(!ka){var W=V-ga|0,sa=1<<W,Oa=ga-1|0,Va=E[(Oa<<2>>2)+g],Ga,Za=a,wb=ga;0!=(wb|0)&17>wb>>>0||Ec(R.Sa|0,1954);var xb=A[Za+(wb-1<<2)+28>>2];Ga=0==(xb|0)?-1:(xb-1|0)>>>((16-wb|0)>>>0);if(Va>>>0<=Ga>>>0){for(var Jb=A[((Oa<<2)+96>>2)+h]-Va|0,Kb=ga<<16,db=Va;;){var la=C[A[oa>>2]+(Jb+db<<1)>>1]&65535;(B[d+la|0]&255|0)!=(ga|0)&&Ec(R.Wa|0,2320);for(var Ra=db<<W,Ka=la|Kb,mb=0;;){var nb=mb+Ra|0;nb>>>0<L>>>0||Ec(R.Xa|0,2326);var yb=E[pa>>2];if(-1==(A[yb+(nb<<2)>>2]|0)){var zb=yb}else{Ec(R.Ya|0,2328),zb=A[pa>>2]}A[zb+(nb<<2)>>2]=Ka;var eb=mb+1|0;if(eb>>>0>=sa>>>0){break}mb=eb}var Lb=db+1|0;if(Lb>>>0>Ga>>>0){break c}db=Lb}}}}while(0);var Ab=ga+1|0;if(Ab>>>0>V>>>0){break b}ga=Ab}}}while(0);var Mb=z[ia]}else{Mb=U}var Nb=a+96|0;A[Nb>>2]=A[Nb>>2]-A[g]|0;var fb=a+100|0;A[fb>>2]=A[fb>>2]-A[g+1]|0;var Wa=a+104|0;A[Wa>>2]=A[Wa>>2]-A[g+2]|0;var Ia=a+108|0;A[Ia>>2]=A[Ia>>2]-A[g+3]|0;var Bb=a+112|0;A[Bb>>2]=A[Bb>>2]-A[g+4]|0;var Cb=a+116|0;A[Cb>>2]=A[Cb>>2]-A[g+5]|0;var Db=a+120|0;A[Db>>2]=A[Db>>2]-A[g+6]|0;var ob=a+124|0;A[ob>>2]=A[ob>>2]-A[g+7]|0;var pb=a+128|0;A[pb>>2]=A[pb>>2]-A[g+8]|0;var Eb=a+132|0;A[Eb>>2]=A[Eb>>2]-A[g+9]|0;var Fb=a+136|0;A[Fb>>2]=A[Fb>>2]-A[g+10]|0;var qb=a+140|0;A[qb>>2]=A[qb>>2]-A[g+11]|0;var gb=a+144|0;A[gb>>2]=A[gb>>2]-A[g+12]|0;var rb=a+148|0;A[rb>>2]=A[rb>>2]-A[g+13]|0;var Sa=a+152|0;A[Sa>>2]=A[Sa>>2]-A[g+14]|0;var Pa=a+156|0;A[Pa>>2]=A[Pa>>2]-A[g+15]|0;var sb=a+16|0;A[sb>>2]=0;e=(a+20|0)>>2;A[e]=Mb&255;b:do{if(za){for(var La=V;;){if(0==(La|0)){break b}var Gb=La-1|0;if(0!=(A[(La<<2>>2)+j]|0)){break}La=Gb}A[sb>>2]=A[((Gb<<2)+28>>2)+h];for(var Ob=V+1|0,$a=A[e]=Ob;;){if($a>>>0>ea>>>0){break b}if(0!=(A[($a<<2>>2)+j]|0)){break}$a=$a+1|0}A[e]=$a}}while(0);A[h+23]=-1;A[h+40]=1048575;A[h+3]=32-A[Y>>2]|0;x=1}}while(0);v=k;return x}Oc.X=1;function Pc(a){var c;0!=(a|0)&&(c=A[a-4>>2],a=a-8|0,c=0==(c|0)?4:(c|0)==(A[a>>2]^-1|0)?5:4,4==c&&Ec(R.da|0,645),Nc(a))}function Qc(a){var a=0==(a|0)?1:a,c=Mc((a<<1)+8|0,0);0==(c|0)?a=0:(A[c+4>>2]=a,A[c>>2]=a^-1,a=c+8|0);return a}function Rc(a){var c;0!=(a|0)&&(c=A[a-4>>2],a=a-8|0,c=0==(c|0)?4:(c|0)==(A[a>>2]^-1|0)?5:4,4==c&&Ec(R.da|0,645),Nc(a))}function Sc(a){var a=0==(a|0)?1:a,c=Mc((a<<2)+8|0,0);0==(c|0)?a=0:(A[c+4>>2]=a,A[c>>2]=a^-1,a=c+8|0);return a}function Tc(a){return(B[a|0]&255)<<8|B[a+1|0]&255}function Uc(a){return(B[a+1|0]&255)<<16|(B[a|0]&255)<<24|B[a+3|0]&255|(B[a+2|0]&255)<<8}function Vc(a){return B[a|0]&255}function Wc(a){return B[a+2|0]&255|(B[a|0]&255)<<16|(B[a+1|0]&255)<<8}function Xc(a,c){if(0==a&&0==c||9==a&&0==c){var d=4}else{1==a&&0==c||2==a&&0==c||7==a&&0==c||8==a&&0==c||3==a&&0==c||4==a&&0==c||5==a&&0==c||6==a&&0==c?d=8:(Ec(R.Ia|0,2664),d=0)}return d}function Yc(a,c){return 0==(a|0)|74>c>>>0?0:18552!=(Tc(a)|0)?0:74>Tc(a+2|0)>>>0?0:Uc(a+6|0)>>>0>c>>>0?0:a}function Zc(a,c,d){var f=d>>2;0==(a|0)|74>c>>>0|0==(d|0)?f=0:40!=(A[f]|0)?f=0:(a=Yc(a,c),0==(a|0)?f=0:(A[f+1]=Tc(a+12|0),A[f+2]=Tc(a+14|0),A[f+3]=Vc(a+16|0),A[f+4]=Vc(a+17|0),c=a+18|0,d=d+32|0,A[d>>2]=Vc(c),A[d+4>>2]=0,d=Vc(c),A[f+5]=0==(d|0)?8:9==(d|0)?8:16,A[f+6]=Uc(a+25|0),A[f+7]=Uc(a+29|0),f=1));return f}Zc.X=1;function $c(a){A[a>>2]=0;ad(a+4|0);A[a+20>>2]=0}function bd(a){if(0!=(a|0)){var c=A[a+168>>2];0!=(c|0)&&Rc(c);c=A[a+176>>2];0!=(c|0)&&Pc(c);Nc(a)}}function cd(a){A[a>>2]=0;dd(a+4|0);var a=a+20|0,c=A[a>>2];0!=(c|0)&&(bd(c),A[a>>2]=0)}function ed(a){var c=A[a+20>>2];0!=(c|0)&&bd(c);dd(a+4|0)}function fd(a){a>>=2;A[a]=0;A[a+1]=0;A[a+2]=0;A[a+3]=0;A[a+4]=0;A[a+5]=0}function gd(a,c){if((a|0)!=(c|0)){var d=a+168|0,f=A[d>>2];0!=(f|0)&&(Rc(f),A[d>>2]=0,A[a+164>>2]=0);d=a+176|0;f=A[d>>2];0!=(f|0)&&(Pc(f),A[d>>2]=0,A[a+172>>2]=0);hd(a,c,180);d=c+168|0;if(0!=(A[d>>2]|0)){var f=a+164|0,e=Sc(A[f>>2]);A[a+168>>2]=e;0!=(e|0)&&hd(e,A[d>>2],A[f>>2]<<2)}d=c+176|0;0!=(A[d>>2]|0)&&(f=a+172|0,e=Qc(A[f>>2]),A[a+176>>2]=e,0!=(e|0)&&hd(e,A[d>>2],A[f>>2]<<1))}}function dd(a){var c=a|0,d=A[c>>2];if(0!=(d|0)){var f=a+4|0;Nc(d);A[c>>2]=0;A[f>>2]=0;A[a+8>>2]=0}z[a+12|0]=0}function id(a,c){var d;d=(a+4|0)>>2;var f=E[d],e=(f|0)==(c|0);do{if(e){var i=1}else{if(f>>>0<=c>>>0){if(E[a+8>>2]>>>0<c>>>0){if(!jd(a,c,(f+1|0)==(c|0))){i=0;break}i=A[d]}else{i=f}Zb(A[a>>2]+i|0,0,c-i|0)}A[d]=c;i=1}}while(0);return i}function kd(a,c){E[a+4>>2]>>>0>c>>>0||Ec(R.F|0,904);return A[a>>2]+c|0}function ld(a){var c=a+4|0,d=A[c+4>>2];0!=(d|0)&8193>d>>>0||Ec(R.Ja|0,2998);var f=a|0;A[f>>2]=d;var e=a+20|0,i=E[e>>2];0==(i|0)?(d=Mc(180,0),0==(d|0)?d=0:0==(d|0)?d=0:(A[d+164>>2]=0,A[d+168>>2]=0,A[d+172>>2]=0,A[d+176>>2]=0),e=A[e>>2]=d,f=A[f>>2]):(e=i,f=d);var c=kd(c,0),a=E[a>>2],j;if(16<a>>>0){d=1<a>>>0;a:do{if(d){for(var g=0,i=a;;){g=g+1|0;if(3>=i>>>0){j=g;break a}i>>>=1}}else{j=0}}while(0);j=32==(j|0)?32:(1<<j>>>0<a>>>0&1)+j|0;j=(11>(j+1|0)>>>0?j+1|0:11)&255}else{j=0}return Oc(e,f,c,j)}function md(a,c){if(0==(c|0)){var d=0}else{if(16<c>>>0){var d=nd(a,c-16|0),f=nd(a,16),d=d<<16|f}else{d=nd(a,c)}}return d}function S(a,c){var d,f,e,i;e=E[c+20>>2]>>2;f=(a+20|0)>>2;var j=E[f];if(24>(j|0)){d=(a+4|0)>>2;var g=E[d],h=E[a+8>>2];i=g>>>0<h>>>0;16>(j|0)?(i?(i=g+1|0,g=(B[g]&255)<<8):(i=g,g=0),i>>>0<h>>>0?(h=i+1|0,i=B[i]&255):(h=i,i=0),A[d]=h,A[f]=j+16|0,d=a+16|0,j=(i|g)<<16-j|A[d>>2]):(i?(A[d]=g+1|0,g=B[g]&255):g=0,A[f]=j+8|0,d=a+16|0,j=g<<24-j|A[d>>2]);A[d>>2]=j}else{j=A[a+16>>2]}d=a+16|0;g=(j>>>16)+1|0;h=g>>>0>E[e+4]>>>0;do{if(h){i=E[e+5];var k=i-1|0,o=g>>>0>E[((k<<2)+28>>2)+e]>>>0;a:do{if(o){for(var m=i;;){var w=m+1|0;if(g>>>0<=E[((m<<2)+28>>2)+e]>>>0){var t=w,x=m;break a}m=w}}else{t=i,x=k}}while(0);i=(j>>>((32-t|0)>>>0))+A[((x<<2)+96>>2)+e]|0;if(i>>>0<E[c>>2]>>>0){q=t,s=C[A[e+44]+(i<<1)>>1]&65535,i=22}else{Ec(R.ca|0,3267);var u=0;i=23}}else{q=E[A[e+42]+(j>>>((32-A[e+2]|0)>>>0)<<2)>>2];-1==(q|0)&&Ec(R.Na|0,3245);s=q&65535;q>>>=16;i=c+4|0;k=s;E[i+4>>2]>>>0>k>>>0||Ec(R.F|0,903);if((B[A[i>>2]+k|0]&255|0)==(q|0)){var q=q,s=s}else{Ec(R.Oa|0,3249)}i=22}}while(0);22==i&&(A[d>>2]<<=q,A[f]=A[f]-q|0,u=s);return u}S.X=1;function od(a,c,d){0==(d|0)?a=0:(A[a>>2]=c,A[a+4>>2]=c,A[a+12>>2]=d,A[a+8>>2]=c+d|0,A[a+16>>2]=0,A[a+20>>2]=0,a=1);return a}function nd(a,c){var d;33>c>>>0||Ec(R.La|0,3191);d=(a+20|0)>>2;var f=E[d],e=(f|0)<(c|0);a:do{if(e){for(var i=a+4|0,j=a+8|0,g=a+16|0,h=f;;){var k=A[i>>2];(k|0)==(A[j>>2]|0)?k=0:(A[i>>2]=k+1|0,k=B[k]&255);h=h+8|0;A[d]=h;33>(h|0)||(Ec(R.Ma|0,3200),h=A[d]);k=k<<32-h|A[g>>2];A[g>>2]=k;if((h|0)>=(c|0)){var o=h,m=k;break a}}}else{o=f,m=A[a+16>>2]}}while(0);A[a+16>>2]=m<<c;A[d]=o-c|0;return m>>>((32-c|0)>>>0)}nd.X=1;function pd(a,c){var d,f=v;v+=24;a:do{for(var e=0,i=8192;;){if(i>>>=1,e=e+1|0,0==(i|0)){d=e;break a}}}while(0);d=md(a,d);e=0==(d|0);do{if(e){cd(c),i=1}else{if(i=c+4|0,id(i,d)){var j=kd(i,0);Zb(j,0,d);j=md(a,5);if(0==(j|0)|21<j>>>0){i=0}else{$c(f);var g=f+4|0,h=id(g,21);a:do{if(h){for(var k=0;;){var o=md(a,3),m=kd(g,B[R.za+k|0]&255);z[m]=o&255;k=k+1|0;if((k|0)==(j|0)){break}}if(ld(f)){k=0;b:for(;;){for(var m=k>>>0<d>>>0,o=d-k|0,w=0==(k|0),t=k-1|0;;){if(!m){if((k|0)!=(d|0)){p=0;break a}p=ld(c);break a}var x=S(a,f);if(17>x>>>0){o=kd(i,k);z[o]=x&255;k=k+1|0;continue b}if(17==(x|0)){m=md(a,3)+3|0;if(m>>>0>o>>>0){p=0;break a}k=m+k|0;continue b}else{if(18==(x|0)){m=md(a,7)+11|0;if(m>>>0>o>>>0){p=0;break a}k=m+k|0;continue b}else{if(2<=(x-19|0)>>>0){Ec(R.ca|0,3141);p=0;break a}x=19==(x|0)?md(a,2)+3|0:md(a,6)+7|0;if(w|x>>>0>o>>>0){p=0;break a}var u=kd(i,t),u=B[u];if(0==u<<24>>24){p=0;break a}var q=x+k|0;if(k>>>0<q>>>0){var s=k;break}}}}for(;;){o=kd(i,s);m=s+1|0;z[o]=u;if((m|0)==(q|0)){k=q;continue b}s=m}}}else{var p=0}}else{p=0}}while(0);ed(f);i=p}}else{i=0}}}while(0);v=f;return i}pd.X=1;function qd(a,c,d,f,e,i,j){var g=a+88|0,h=E[g>>2],k=((1<Tc(h+12|0)>>>(j>>>0)>>>0?Tc(h+12|0)>>>(j>>>0):1)+3|0)>>>2,j=((1<Tc(h+14|0)>>>(j>>>0)>>>0?Tc(h+14|0)>>>(j>>>0):1)+3|0)>>>2,h=Vc(h+18|0),h=(0==(h|0)?8:9==(h|0)?8:16)*k|0;if(0==(i|0)){var o=h,i=5}else{if(h>>>0<=i>>>0&0==(i&3|0)){o=i,i=5}else{var m=0,i=12}}5==i&&((o*j|0)>>>0>e>>>0?m=0:(e=(k+1|0)>>>1,m=(j+1|0)>>>1,od(a+92|0,c,d)?(c=Vc(A[g>>2]+18|0),0==(c|0)?(rd(a,f,0,o,k,j,e,m),m=1):2==(c|0)||3==(c|0)||5==(c|0)||6==(c|0)||4==(c|0)?(sd(a,f,0,o,k,j,e,m),m=1):9==(c|0)?(td(a,f,0,o,k,j,e,m),m=1):7==(c|0)||8==(c|0)?(ud(a,f,0,o,k,j,e,m),m=1):m=0):m=0));return m}qd.X=1;Module._crn_get_width=(function(a,c){var d=v;v+=40;vd(d);Zc(a,c,d);var f=A[d+4>>2];v=d;return f});Module._crn_get_height=(function(a,c){var d=v;v+=40;vd(d);Zc(a,c,d);var f=A[d+8>>2];v=d;return f});Module._crn_get_levels=(function(a,c){var d=v;v+=40;vd(d);Zc(a,c,d);var f=A[d+12>>2];v=d;return f});Module._crn_get_dxt_format=(function(a,c){var d=v;v+=40;vd(d);Zc(a,c,d);var f=A[(d+32|0)>>2];v=d;return f});Module._crn_get_uncompressed_size=(function(a,c){var d=v;v+=40;vd(d);Zc(a,c,d);var f=(A[d+4>>2]+3|0)>>>2,e=(A[d+8>>2]+3|0)>>>2,i=d+32|0,i=Xc(A[i>>2],A[i+4>>2])<<1&536870910;v=d;return e*f*i|0});Module._crn_decompress=(function(a,c,d,f){var e=v;v+=44;var i=e+40;vd(e);Zc(a,c,e);var j=(A[e+4>>2]+3|0)>>>2,g=e+32|0,g=Xc(A[g>>2],A[g+4>>2])<<1&536870910,j=j*g|0,h;if(0==(a|0)|62>c>>>0){h=0}else{if(g=Mc(300,0),0==(g|0)?g=0:0==(g|0)?g=0:(A[g>>2]=519686845,A[g+4>>2]=0,A[g+8>>2]=0,A[g+88>>2]=0,fd(g+92|0),$c(g+116|0),$c(g+140|0),$c(g+164|0),$c(g+188|0),$c(g+212|0),wd(g+236|0),wd(g+252|0),xd(g+268|0),xd(g+284|0)),0==(g|0)){h=0}else{var k=Yc(a,c);A[g+88>>2]=k;if(0==(k|0)){h=0}else{A[g+4>>2]=a;A[g+8>>2]=c;var c=g+92|0,k=A[g+4>>2],a=(g+88|0)>>2,o=A[a],k=od(c,k+Wc(o+67|0)|0,Tc(o+65|0));do{if(k){if(pd(c,g+116|0)){o=A[a];if(0==(Tc(o+39|0)|0)){if(0==(Tc(o+55|0)|0)){o=0;break}}else{if(!pd(c,g+140|0)){o=0;break}if(!pd(c,g+188|0)){o=0;break}o=A[a]}if(0!=(Tc(o+55|0)|0)){if(!pd(c,g+164|0)){o=0;break}if(!pd(c,g+212|0)){o=0;break}}o=1}else{o=0}}else{o=0}}while(0);if(o){a=g+88|0;c=A[a>>2];if(0==(Tc(c+39|0)|0)){h=c,a=5}else{if(yd(g)){zd(g)?(h=A[a>>2],a=5):(m=0,a=9)}else{var m=0,a=9}}do{if(5==a){if(0!=(Tc(h+55|0)|0)){if(!Ad(g)){m=0;break}if(!Bd(g)){m=0;break}}m=1}}while(0);h=m}else{h=0}}h?h=g:(0!=(g|0)&&(Cd(g),Nc(g)),h=0)}}i|=0;A[i>>2]=d;!(0==(h|0)|0==(i|0)|8>f>>>0|0)&&519686845==(A[h>>2]|0)&&(m=E[h+88>>2],d=Uc(0+m+70|0),g=A[h+8>>2],m=1<Vc(m+16|0)>>>0?Uc(4+m+70|0):g,m>>>0>d>>>0||Ec(R.Qa|0,3705),qd(h,A[h+4>>2]+d|0,m-d|0,i,f,j,0));0!=(h|0)&&519686845==(A[h>>2]|0)&&0!=(h|0)&&(Cd(h),Nc(h));v=e});function xd(a){A[a>>2]=0;A[a+4>>2]=0;A[a+8>>2]=0;z[a+12|0]=0}function wd(a){A[a>>2]=0;A[a+4>>2]=0;A[a+8>>2]=0;z[a+12|0]=0}function ad(a){A[a>>2]=0;A[a+4>>2]=0;A[a+8>>2]=0;z[a+12|0]=0}function vd(a){A[a>>2]=40}function Dd(a){var c=a|0,d=A[c>>2];if(0!=(d|0)){var f=a+4|0;Nc(d);A[c>>2]=0;A[f>>2]=0;A[a+8>>2]=0}z[a+12|0]=0}function Ed(a){var c=a|0,d=A[c>>2];if(0!=(d|0)){var f=a+4|0;Nc(d);A[c>>2]=0;A[f>>2]=0;A[a+8>>2]=0}z[a+12|0]=0}function jd(a,c,d){Jc(a,c,d,1,0)?a=1:(z[a+12|0]=1,a=0);return a}function rd(a,c,d,f,e,i,j,g){var h,k,o,m,w,t=v;v+=24;w=t>>2;var x=t+4;m=x>>2;var d=t+8>>2,u=a+236|0,q=A[u+4>>2],s=a+252|0,p=A[s+4>>2];A[w]=0;A[m]=0;var y=Vc(A[a+88>>2]+17|0),D=f>>>2,O=0==(y|0);a:do{if(!O){for(var M=0==(g|0),G=g-1|0,J=0!=(i&1|0),K=f<<1,F=a+92|0,ea=a+116|0,P=a+188|0,ma=D+1|0,ba=D+2|0,ta=D+3|0,ha=j-1|0,fa=a+140|0,Ha=ha<<4,wa=0!=(e&1|0),na=0,Aa=1;;){b:do{if(M){var Ba=Aa}else{for(var $=A[c+(na<<2)>>2],oa=0,ia=Aa;;){if(0==(oa&1|0)){var ra=$,xa=16,Da=1,ya=j,ca=0}else{ra=$+Ha|0,xa=-16,ya=Da=-1,ca=ha}var ua=(oa|0)==(G|0),U=ua&J,V=(ca|0)==(ya|0);c:do{if(V){var Y=ia}else{var za=ua&J^1,L=ia,Z=ra;o=Z>>2;for(var va=ca;;){var ja=1==(L|0)?S(F,ea)|512:L,L=ja&7,ja=ja>>>3;k=B[R.D+L|0]&255;for(var da=0,Q=A[w];;){var H=S(F,fa);A[w]=Q+H|0;Fd(t,q);Q=E[w];H=Gd(u,Q);A[(da<<2>>2)+d]=A[H>>2];da=da+1|0;if(da>>>0>=k>>>0){break}}da=(va|0)==(ha|0)&wa;k=Z>>2;Q=U|da;d:do{if(Q){for(H=0;;){var pa=H*f|0;h=pa>>2;var ga=Z+pa|0,ka=0==(H|0)|za,W=H<<1,sa=S(F,P);A[m]=A[m]+sa|0;Fd(x,p);da?(ka&&(A[ga>>2]=A[((B[(L<<2)+Hd+W|0]&255)<<2>>2)+d],W=Gd(s,A[m]),A[h+(o+1)]=A[W>>2]),h=S(F,P),A[m]=A[m]+h|0,Fd(x,p)):ka?(A[ga>>2]=A[((B[(L<<2)+Hd+W|0]&255)<<2>>2)+d],ga=Gd(s,A[m]),A[h+(o+1)]=A[ga>>2],pa=pa+(Z+8)|0,ga=S(F,P),A[m]=A[m]+ga|0,Fd(x,p),A[pa>>2]=A[((B[(L<<2)+Hd+(W|1)|0]&255)<<2>>2)+d],W=Gd(s,A[m]),A[h+(o+3)]=A[W>>2]):(h=S(F,P),A[m]=A[m]+h|0,Fd(x,p));H=H+1|0;if(2==(H|0)){break d}}}else{A[k]=A[((B[(L<<2)+Hd|0]&255)<<2>>2)+d],H=S(F,P),A[m]=A[m]+H|0,Fd(x,p),H=Gd(s,A[m]),A[o+1]=A[H>>2],A[o+2]=A[((B[(L<<2)+Hd+1|0]&255)<<2>>2)+d],H=S(F,P),A[m]=A[m]+H|0,Fd(x,p),H=Gd(s,A[m]),A[o+3]=A[H>>2],A[(D<<2>>2)+k]=A[((B[(L<<2)+Hd+2|0]&255)<<2>>2)+d],H=S(F,P),A[m]=A[m]+H|0,Fd(x,p),H=Gd(s,A[m]),A[(ma<<2>>2)+k]=A[H>>2],A[(ba<<2>>2)+k]=A[((B[(L<<2)+Hd+3|0]&255)<<2>>2)+d],H=S(F,P),A[m]=A[m]+H|0,Fd(x,p),H=Gd(s,A[m]),A[(ta<<2>>2)+k]=A[H>>2]}}while(0);va=va+Da|0;if((va|0)==(ya|0)){Y=ja;break c}L=ja;Z=Z+xa|0;o=Z>>2}}}while(0);o=oa+1|0;if((o|0)==(g|0)){Ba=Y;break b}$=$+K|0;oa=o;ia=Y}}}while(0);na=na+1|0;if((na|0)==(y|0)){break a}Aa=Ba}}}while(0);v=t;return 1}rd.X=1;function Cd(a){A[a>>2]=0;Ed(a+284|0);Ed(a+268|0);Dd(a+252|0);Dd(a+236|0);var c=a+188|0;ed(a+212|0);ed(c);c=a+140|0;ed(a+164|0);ed(c);ed(a+116|0)}Cd.X=1;function Fd(a,c){var d=A[a>>2],f=d-c|0,e=f>>31;A[a>>2]=e&d|f&(e^-1)}function sd(a,c,d,f,e,i,j,g){var h,k,o,m,w,t,x,u,q=v;v+=48;u=q>>2;var s=q+4;x=s>>2;var p=q+8;t=p>>2;var y=q+12;w=y>>2;m=q+16>>2;var d=q+32>>2,D=a+236|0,O=A[D+4>>2],M=a+252|0,G=A[M+4>>2],J=a+268|0,K=A[J+4>>2],F=A[a+88>>2],ea=Tc(F+63|0);A[u]=0;A[x]=0;A[t]=0;A[w]=0;var F=Vc(F+17|0),P=0==(F|0);a:do{if(!P){for(var ma=0==(g|0),ba=g-1|0,ta=0==(i&1|0),ha=f<<1,fa=a+92|0,Ha=a+116|0,wa=a+212|0,na=a+188|0,Aa=a+284|0,Ba=a+140|0,$=a+164|0,oa=j-1|0,ia=oa<<5,ra=0!=(e&1|0),xa=0,Da=1;;){b:do{if(ma){var ya=Da}else{for(var ca=A[c+(xa<<2)>>2],ua=0,U=Da;;){if(0==(ua&1|0)){var V=ca,Y=32,za=1,L=j,Z=0}else{V=ca+ia|0,Y=-32,L=za=-1,Z=oa}var va=ta|(ua|0)!=(ba|0),ja=(Z|0)==(L|0);c:do{if(ja){var da=U}else{for(var Q=U,H=V,pa=Z;;){var ga=1==(Q|0)?S(fa,Ha)|512:Q,Q=ga&7,ga=ga>>>3;o=B[R.D+Q|0]&255;for(var ka=0,W=A[t];;){var sa=S(fa,$);A[t]=W+sa|0;Fd(p,K);W=E[t];sa=Id(J,W);A[(ka<<2>>2)+d]=C[sa>>1]&65535;ka=ka+1|0;if(ka>>>0>=o>>>0){break}}ka=0;for(W=A[u];!(sa=S(fa,Ba),A[u]=W+sa|0,Fd(q,O),W=E[u],sa=Gd(D,W),A[(ka<<2>>2)+m]=A[sa>>2],ka=ka+1|0,ka>>>0>=o>>>0);){}ka=(pa|0)==(oa|0)&ra;W=H;o=W>>2;for(sa=0;;){var Oa=0==(sa|0)|va;h=sa<<1;k=S(fa,wa);A[w]=A[w]+k|0;Fd(y,ea);k=S(fa,na);A[x]=A[x]+k|0;Fd(s,G);if(Oa){var Va=W,Ga=B[(Q<<2)+Hd+h|0]&255;k=Id(Aa,3*A[w]|0)>>1;A[Va>>2]=(C[k]&65535)<<16|A[(Ga<<2>>2)+d];A[o+1]=(C[k+2]&65535)<<16|C[k+1]&65535;A[o+2]=A[(Ga<<2>>2)+m];k=Gd(M,A[x]);A[o+3]=A[k>>2]}k=S(fa,wa);A[w]=A[w]+k|0;Fd(y,ea);k=S(fa,na);A[x]=A[x]+k|0;Fd(s,G);ka|Oa^1||(Oa=W+16|0,k=B[(Q<<2)+Hd+(h|1)|0]&255,h=Id(Aa,3*A[w]|0)>>1,A[Oa>>2]=(C[h]&65535)<<16|A[(k<<2>>2)+d],A[o+5]=(C[h+2]&65535)<<16|C[h+1]&65535,A[o+6]=A[(k<<2>>2)+m],h=Gd(M,A[x]),A[o+7]=A[h>>2]);sa=sa+1|0;if(2==(sa|0)){break}W=W+f|0;o=W>>2}pa=pa+za|0;if((pa|0)==(L|0)){da=ga;break c}Q=ga;H=H+Y|0}}}while(0);ua=ua+1|0;if((ua|0)==(g|0)){ya=da;break b}ca=ca+ha|0;U=da}}}while(0);xa=xa+1|0;if((xa|0)==(F|0)){break a}Da=ya}}}while(0);v=q;return 1}sd.X=1;function td(a,c,d,f,e,i,j,g){var h,k,o,m,w,t=v;v+=24;w=t>>2;var x=t+4;m=x>>2;var d=t+8>>2,u=a+268|0,q=A[u+4>>2],s=A[a+88>>2],p=Tc(s+63|0);A[w]=0;A[m]=0;var s=Vc(s+17|0),y=0==(s|0);a:do{if(!y){for(var D=0==(g|0),O=g-1|0,M=0==(i&1|0),G=f<<1,J=a+92|0,K=a+116|0,F=0==(e&1|0),ea=a+164|0,P=a+212|0,ma=a+284|0,ba=j-1|0,ta=ba<<4,ha=0,fa=1;;){b:do{if(D){var Ha=fa}else{for(var wa=A[c+(ha<<2)>>2],na=0,Aa=fa;;){if(0==(na&1|0)){var Ba=wa,$=16,oa=1,ia=j,ra=0}else{Ba=wa+ta|0,$=-16,ia=oa=-1,ra=ba}var xa=M|(na|0)!=(O|0),Da=(ra|0)==(ia|0);c:do{if(Da){var ya=Aa}else{for(var ca=Aa,ua=Ba,U=ra;;){var V=1==(ca|0)?S(J,K)|512:ca,ca=V&7,V=V>>>3,Y=B[R.D+ca|0]&255,za=F|(U|0)!=(ba|0);h=0;for(k=A[w];;){var L=S(J,ea);A[w]=k+L|0;Fd(t,q);k=E[w];L=Id(u,k);A[(h<<2>>2)+d]=C[L>>1]&65535;h=h+1|0;if(h>>>0>=Y>>>0){var Z=ua;o=Z>>2;var va=0;break}}for(;;){Y=Z;k=0==(va|0)|xa;h=va<<1;L=S(J,P);A[m]=A[m]+L|0;Fd(x,p);za?k?(L=B[(ca<<2)+Hd+h|0]&255,k=Id(ma,3*A[m]|0)>>1,A[Y>>2]=(C[k]&65535)<<16|A[(L<<2>>2)+d],A[o+1]=(C[k+2]&65535)<<16|C[k+1]&65535,Y=Z+8|0,k=S(J,P),A[m]=A[m]+k|0,Fd(x,p),k=B[(ca<<2)+Hd+(h|1)|0]&255,h=Id(ma,3*A[m]|0)>>1,A[Y>>2]=(C[h]&65535)<<16|A[(k<<2>>2)+d],A[o+3]=(C[h+2]&65535)<<16|C[h+1]&65535):(Y=S(J,P),A[m]=A[m]+Y|0,Fd(x,p)):(k&&(k=B[(ca<<2)+Hd+h|0]&255,h=Id(ma,3*A[m]|0)>>1,A[Y>>2]=(C[h]&65535)<<16|A[(k<<2>>2)+d],A[o+1]=(C[h+2]&65535)<<16|C[h+1]&65535),Y=S(J,P),A[m]=A[m]+Y|0,Fd(x,p));Y=va+1|0;if(2==(Y|0)){break}Z=Z+f|0;o=Z>>2;va=Y}U=U+oa|0;if((U|0)==(ia|0)){ya=V;break c}ca=V;ua=ua+$|0}}}while(0);na=na+1|0;if((na|0)==(g|0)){Ha=ya;break b}wa=wa+G|0;Aa=ya}}}while(0);ha=ha+1|0;if((ha|0)==(s|0)){break a}fa=Ha}}}while(0);v=t;return 1}td.X=1;function ud(a,c,d,f,e,i,j,g){var h,k,o,m,w,t,x,u,q,s=v;v+=48;q=s>>2;var p=s+4;u=p>>2;var y=s+8;x=y>>2;var D=s+12;t=D>>2;w=s+16>>2;var d=s+32>>2,O=a+268|0,M=A[O+4>>2],G=A[a+88>>2],J=Tc(G+63|0);A[q]=0;A[u]=0;A[x]=0;A[t]=0;var G=Vc(G+17|0),K=0==(G|0);a:do{if(!K){for(var F=0==(g|0),ea=g-1|0,P=0==(i&1|0),ma=f<<1,ba=a+92|0,ta=a+116|0,ha=a+212|0,fa=a+284|0,Ha=a+164|0,wa=j-1|0,na=wa<<5,Aa=0!=(e&1|0),Ba=0,$=1;;){b:do{if(F){var oa=$}else{for(var ia=A[c+(Ba<<2)>>2],ra=0,xa=$;;){if(0==(ra&1|0)){var Da=ia,ya=32,ca=1,ua=j,U=0}else{Da=ia+na|0,ya=-32,ua=ca=-1,U=wa}var V=P|(ra|0)!=(ea|0),Y=(U|0)==(ua|0);c:do{if(Y){var za=xa}else{for(var L=xa,Z=Da,va=U;;){var ja=1==(L|0)?S(ba,ta)|512:L,L=ja&7,ja=ja>>>3;m=B[R.D+L|0]&255;for(var da=0,Q=A[q];;){var H=S(ba,Ha);A[q]=Q+H|0;Fd(s,M);Q=E[q];H=Id(O,Q);A[(da<<2>>2)+w]=C[H>>1]&65535;da=da+1|0;if(da>>>0>=m>>>0){break}}da=0;for(Q=A[x];!(H=S(ba,Ha),A[x]=Q+H|0,Fd(y,M),Q=E[x],H=Id(O,Q),A[(da<<2>>2)+d]=C[H>>1]&65535,da=da+1|0,da>>>0>=m>>>0);){}da=(va|0)==(wa|0)&Aa;Q=Z;m=Q>>2;for(H=0;;){var pa=0==(H|0)|V;h=H<<1;k=S(ba,ha);A[u]=A[u]+k|0;Fd(p,J);k=S(ba,ha);A[t]=A[t]+k|0;Fd(D,J);if(pa){var ga=Q,ka=B[(L<<2)+Hd+h|0]&255;o=Id(fa,3*A[u]|0)>>1;k=Id(fa,3*A[t]|0)>>1;A[ga>>2]=(C[o]&65535)<<16|A[(ka<<2>>2)+w];A[m+1]=(C[o+2]&65535)<<16|C[o+1]&65535;A[m+2]=(C[k]&65535)<<16|A[(ka<<2>>2)+d];A[m+3]=(C[k+2]&65535)<<16|C[k+1]&65535}k=S(ba,ha);A[u]=A[u]+k|0;Fd(p,J);k=S(ba,ha);A[t]=A[t]+k|0;Fd(D,J);da|pa^1||(pa=Q+16|0,o=B[(L<<2)+Hd+(h|1)|0]&255,k=Id(fa,3*A[u]|0)>>1,h=Id(fa,3*A[t]|0)>>1,A[pa>>2]=(C[k]&65535)<<16|A[(o<<2>>2)+w],A[m+5]=(C[k+2]&65535)<<16|C[k+1]&65535,A[m+6]=(C[h]&65535)<<16|A[(o<<2>>2)+d],A[m+7]=(C[h+2]&65535)<<16|C[h+1]&65535);H=H+1|0;if(2==(H|0)){break}Q=Q+f|0;m=Q>>2}va=va+ca|0;if((va|0)==(ua|0)){za=ja;break c}L=ja;Z=Z+ya|0}}}while(0);ra=ra+1|0;if((ra|0)==(g|0)){oa=za;break b}ia=ia+ma|0;xa=za}}}while(0);Ba=Ba+1|0;if((Ba|0)==(G|0)){break a}$=oa}}}while(0);v=s;return 1}ud.X=1;function Id(a,c){E[a+4>>2]>>>0>c>>>0||Ec(R.F|0,904);return(c<<1)+A[a>>2]|0}function Gd(a,c){E[a+4>>2]>>>0>c>>>0||Ec(R.F|0,904);return(c<<2)+A[a>>2]|0}function Jd(a,c){var d;d=(a+4|0)>>2;var f=E[d],e=(f|0)==(c|0);do{if(e){var i=1}else{if(f>>>0<=c>>>0){if(E[a+8>>2]>>>0<c>>>0){i=a;Jc(i,c,(f+1|0)==(c|0),2,0)?i=1:(z[i+12|0]=1,i=0);if(!i){i=0;break}i=A[d]}else{i=f}Zb((i<<1)+A[a>>2]|0,0,(c-i|0)<<1)}A[d]=c;i=1}}while(0);return i}function Kd(a,c){var d;d=(a+4|0)>>2;var f=E[d],e=(f|0)==(c|0);do{if(e){var i=1}else{if(f>>>0<=c>>>0){if(E[a+8>>2]>>>0<c>>>0){i=a;Jc(i,c,(f+1|0)==(c|0),4,0)?i=1:(z[i+12|0]=1,i=0);if(!i){i=0;break}i=A[d]}else{i=f}Zb((i<<2)+A[a>>2]|0,0,(c-i|0)<<2)}A[d]=c;i=1}}while(0);return i}function yd(a){var c=v;v+=48;var d,f=a+88|0,e=Tc(A[f>>2]+39|0),i=a+236|0,j=Kd(i,e);do{if(j){var g=a+92|0,h=A[f>>2];if(od(g,A[a+4>>2]+Wc(h+33|0)|0,Wc(h+36|0))){h=c|0;$c(h);var k=c+24|0;$c(k);for(var o=0;;){if(2<=o>>>0){d=9;break}if(!pd(g,c+24*o|0)){var m=0;d=11;break}o=o+1|0}a:do{if(9==d){var w=Gd(i,0);if(0==(e|0)){m=1}else{for(var t=o=0,x=0,u=0,q=0,s=0,p=0;;){var s=S(g,h)+s&31,q=S(g,k)+q&63,u=S(g,h)+u&31,y=S(g,h)+x|0,x=y&31,t=S(g,k)+t&63,o=S(g,h)+o&31;A[w>>2]=q<<5|s<<11|u|y<<27|t<<21|o<<16;p=p+1|0;if((p|0)==(e|0)){m=1;break a}w=w+4|0}}}}while(0);ed(k);ed(h);g=m}else{g=0}}else{g=0}}while(0);v=c;return g}yd.X=1;function zd(a){var c=v;v+=480;var d=c+24,f=c+220,e=c+416,i=A[a+88>>2],j=Tc(i+47|0),g=a+92|0;if(od(g,A[a+4>>2]+Wc(i+41|0)|0,Wc(i+44|0))){$c(c);i=pd(g,c);a:do{if(i){for(var h=-3,k=-3,o=0;;){A[d+(o<<2)>>2]=h;A[f+(o<<2)>>2]=k;var h=h+1|0,m=3<(h|0),k=(m&1)+k|0,o=o+1|0;if(49==(o|0)){break}h=m?-3:h}Zb(e,0,64);k=a+252|0;if(Kd(k,j)){var w=Gd(k,0);if(0==(j|0)){ba=1}else{for(var k=e|0,o=e+4|0,h=e+8|0,m=e+12|0,t=e+16|0,x=e+20|0,u=e+24|0,q=e+28|0,s=e+32|0,p=e+36|0,y=e+40|0,D=e+44|0,O=e+48|0,M=e+52|0,G=e+56|0,J=e+60|0,K=0;;){for(var F=0;;){var ea=S(g,c),P=F<<1,ma=(P<<2)+e|0;A[ma>>2]=A[ma>>2]+A[d+(ea<<2)>>2]&3;P=((P|1)<<2)+e|0;A[P>>2]=A[P>>2]+A[f+(ea<<2)>>2]&3;F=F+1|0;if(8==(F|0)){break}}A[w>>2]=(B[R.h+A[o>>2]|0]&255)<<2|B[R.h+A[k>>2]|0]&255|(B[R.h+A[h>>2]|0]&255)<<4|(B[R.h+A[m>>2]|0]&255)<<6|(B[R.h+A[t>>2]|0]&255)<<8|(B[R.h+A[x>>2]|0]&255)<<10|(B[R.h+A[u>>2]|0]&255)<<12|(B[R.h+A[q>>2]|0]&255)<<14|(B[R.h+A[s>>2]|0]&255)<<16|(B[R.h+A[p>>2]|0]&255)<<18|(B[R.h+A[y>>2]|0]&255)<<20|(B[R.h+A[D>>2]|0]&255)<<22|(B[R.h+A[O>>2]|0]&255)<<24|(B[R.h+A[M>>2]|0]&255)<<26|(B[R.h+A[G>>2]|0]&255)<<28|(B[R.h+A[J>>2]|0]&255)<<30;K=K+1|0;if((K|0)==(j|0)){ba=1;break a}w=w+4|0}}}else{var ba=0}}else{ba=0}}while(0);ed(c);a=ba}else{a=0}v=c;return a}zd.X=1;function Ad(a){var c=v;v+=24;var d=A[a+88>>2],f=Tc(d+55|0),e=a+92|0;if(od(e,A[a+4>>2]+Wc(d+49|0)|0,Wc(d+52|0))){$c(c);d=pd(e,c);a:do{if(d){var i=a+268|0;if(Jd(i,f)){if(i=Id(i,0),0==(f|0)){m=1}else{for(var j=0,g=0,h=0;;){var k=S(e,c),o=S(e,c),j=k+j&255,g=o+g&255;hb[i>>1]=(g<<8|j)&65535;h=h+1|0;if((h|0)==(f|0)){m=1;break a}i=i+2|0}}}else{var m=0}}else{m=0}}while(0);ed(c);a=m}else{a=0}v=c;return a}Ad.X=1;function Bd(a){var c,d=v;v+=1888;var f=d+24,e=d+924,i=d+1824,j=A[a+88>>2],g=Tc(j+63|0),h=a+92|0;if(od(h,A[a+4>>2]+Wc(j+57|0)|0,Wc(j+60|0))){$c(d);j=pd(h,d);a:do{if(j){for(var k=-7,o=-7,m=0;;){A[f+(m<<2)>>2]=k;A[e+(m<<2)>>2]=o;var k=k+1|0,w=7<(k|0),o=(w&1)+o|0,m=m+1|0;if(225==(m|0)){break}k=w?-7:k}Zb(i,0,64);o=a+284|0;if(Jd(o,3*g|0)){if(c=Id(o,0),0==(g|0)){ta=1}else{var o=i|0,m=i+4|0,k=i+8|0,w=i+12|0,t=i+16|0,x=i+20|0,u=i+24|0,q=i+28|0,s=i+32|0,p=i+36|0,y=i+40|0,D=i+44|0,O=i+48|0,M=i+52|0,G=i+56|0,J=i+60|0,K=c;c=K>>1;for(var F=0;;){for(var ea=0;;){var P=S(h,d),ma=ea<<1,ba=(ma<<2)+i|0;A[ba>>2]=A[ba>>2]+A[f+(P<<2)>>2]&7;ma=((ma|1)<<2)+i|0;A[ma>>2]=A[ma>>2]+A[e+(P<<2)>>2]&7;ea=ea+1|0;if(8==(ea|0)){break}}hb[c]=(B[R.g+A[m>>2]|0]&255)<<3|B[R.g+A[o>>2]|0]&255|(B[R.g+A[k>>2]|0]&255)<<6|(B[R.g+A[w>>2]|0]&255)<<9|(B[R.g+A[t>>2]|0]&255)<<12|(B[R.g+A[x>>2]|0]&255)<<15;hb[c+1]=(B[R.g+A[u>>2]|0]&255)<<2|(B[R.g+A[x>>2]|0]&255)>>>1|(B[R.g+A[q>>2]|0]&255)<<5|(B[R.g+A[s>>2]|0]&255)<<8|(B[R.g+A[p>>2]|0]&255)<<11|(B[R.g+A[y>>2]|0]&255)<<14;hb[c+2]=(B[R.g+A[D>>2]|0]&255)<<1|(B[R.g+A[y>>2]|0]&255)>>>2|(B[R.g+A[O>>2]|0]&255)<<4|(B[R.g+A[M>>2]|0]&255)<<7|(B[R.g+A[G>>2]|0]&255)<<10|(B[R.g+A[J>>2]|0]&255)<<13;F=F+1|0;if((F|0)==(g|0)){ta=1;break a}K=K+6|0;c=K>>1}}}else{var ta=0}}else{ta=0}}while(0);ed(d);a=ta}else{a=0}v=d;return a}Bd.X=1;function Yb(a){if(245>a>>>0){var c=11>a>>>0?16:a+11&-8,d=c>>>3,a=E[T>>2],f=a>>>(d>>>0);if(0!=(f&3|0)){var e=(f&1^1)+d|0,c=e<<1,d=(c<<2)+T+40|0,i=(c+2<<2)+T+40|0,f=E[i>>2],c=f+8|0,j=E[c>>2];(d|0)==(j|0)?A[T>>2]=a&(1<<e^-1):(j>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[i>>2]=j,A[j+12>>2]=d);a=e<<3;A[f+4>>2]=a|3;a=f+(a|4)|0;A[a>>2]|=1;e=c;a=38}else{if(c>>>0>E[T+8>>2]>>>0){if(0!=(f|0)){var e=2<<d,e=f<<d&(e|-e),d=(e&-e)-1|0,e=d>>>12&16,f=d>>>(e>>>0),d=f>>>5&8,i=f>>>(d>>>0),f=i>>>2&4,j=i>>>(f>>>0),i=j>>>1&2,j=j>>>(i>>>0),g=j>>>1&1,d=(d|e|f|i|g)+(j>>>(g>>>0))|0,e=d<<1,i=(e<<2)+T+40|0,j=(e+2<<2)+T+40|0,f=E[j>>2],e=f+8|0,g=E[e>>2];(i|0)==(g|0)?A[T>>2]=a&(1<<d^-1):(g>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[j>>2]=g,A[g+12>>2]=i);i=d<<3;a=i-c|0;A[f+4>>2]=c|3;d=f+c|0;A[f+(c|4)>>2]=a|1;A[f+i>>2]=a;g=E[T+8>>2];0!=(g|0)&&(c=A[T+20>>2],i=g>>>2&1073741822,f=(i<<2)+T+40|0,j=E[T>>2],g=1<<(g>>>3),0==(j&g|0)?(A[T>>2]=j|g,j=f,i=(i+2<<2)+T+40|0):(i=(i+2<<2)+T+40|0,j=E[i>>2],j>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"))),A[i>>2]=c,A[j+12>>2]=c,A[(c+8|0)>>2]=j,A[(c+12|0)>>2]=f);A[T+8>>2]=a;A[T+20>>2]=d;a=38}else{0==(A[T+4>>2]|0)?(h=c,a=30):(a=Ld(c),0==(a|0)?(h=c,a=30):(e=a,a=38))}}else{var h=c,a=30}}}else{4294967231<a>>>0?(h=-1,a=30):(a=a+11&-8,0==(A[T+4>>2]|0)?(h=a,a=30):(c=Md(a),0==(c|0)?(h=a,a=30):(e=c,a=38)))}30==a&&(c=E[T+8>>2],h>>>0>c>>>0?(a=E[T+12>>2],h>>>0<a>>>0?(a=a-h|0,A[T+12>>2]=a,c=E[T+24>>2],A[T+24>>2]=c+h|0,A[h+(c+4)>>2]=a|1,A[c+4>>2]=h|3,e=c+8|0):e=Nd(h)):(e=c-h|0,a=E[T+20>>2],15<e>>>0?(A[T+20>>2]=a+h|0,A[T+8>>2]=e,A[h+(a+4)>>2]=e|1,A[a+c>>2]=e,A[a+4>>2]=h|3):(A[T+8>>2]=0,A[T+20>>2]=0,A[a+4>>2]=c|3,h=c+(a+4)|0,A[h>>2]|=1),e=a+8|0));return e}Module._malloc=Yb;Yb.X=1;function Ld(a){var c,d,f=A[T+4>>2],e=(f&-f)-1|0,f=e>>>12&16,i=e>>>(f>>>0),e=i>>>5&8;d=i>>>(e>>>0);var i=d>>>2&4,j=d>>>(i>>>0);d=j>>>1&2;var j=j>>>(d>>>0),g=j>>>1&1,f=e=E[T+((e|f|i|d|g)+(j>>>(g>>>0))<<2)+304>>2];d=f>>2;e=(A[e+4>>2]&-8)-a|0;a:for(;;){for(i=f;;){j=A[i+16>>2];if(0==(j|0)){if(i=A[i+20>>2],0==(i|0)){break a}}else{i=j}j=(A[i+4>>2]&-8)-a|0;if(j>>>0<e>>>0){f=i;d=f>>2;e=j;continue a}}}var j=f,h=E[T+16>>2],g=j>>>0<h>>>0;do{if(!g){var k=j+a|0,i=k;if(j>>>0<k>>>0){var g=E[d+6],k=E[d+3],o=(k|0)==(f|0);do{if(o){c=f+20|0;var m=A[c>>2];if(0==(m|0)&&(c=f+16|0,m=A[c>>2],0==(m|0))){m=0;c=m>>2;break}for(;;){var w=m+20|0,t=A[w>>2];if(0==(t|0)&&(w=m+16|0,t=E[w>>2],0==(t|0))){break}c=w;m=t}c>>>0<h>>>0&&(X(),b("Reached an unreachable!"));A[c>>2]=0}else{c=E[d+2],c>>>0<h>>>0&&(X(),b("Reached an unreachable!")),A[c+12>>2]=k,A[k+8>>2]=c,m=k}c=m>>2}while(0);h=0==(g|0);a:do{if(!h){k=f+28|0;o=(A[k>>2]<<2)+T+304|0;w=(f|0)==(A[o>>2]|0);do{if(w){A[o>>2]=m;if(0!=(m|0)){break}A[T+4>>2]&=1<<A[k>>2]^-1;break a}g>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));t=g+16|0;(A[t>>2]|0)==(f|0)?A[t>>2]=m:A[g+20>>2]=m;if(0==(m|0)){break a}}while(0);m>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));A[c+6]=g;k=E[d+4];0!=(k|0)&&(k>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[c+4]=k,A[k+24>>2]=m);k=E[d+5];0!=(k|0)&&(k>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[c+5]=k,A[k+24>>2]=m)}}while(0);16>e>>>0?(a=e+a|0,A[d+1]=a|3,a=a+(j+4)|0,A[a>>2]|=1):(A[d+1]=a|3,A[a+(j+4)>>2]=e|1,A[j+e+a>>2]=e,h=E[T+8>>2],0!=(h|0)&&(a=E[T+20>>2],j=h>>>2&1073741822,d=(j<<2)+T+40|0,g=E[T>>2],h=1<<(h>>>3),0==(g&h|0)?(A[T>>2]=g|h,g=d,j=(j+2<<2)+T+40|0):(j=(j+2<<2)+T+40|0,g=E[j>>2],g>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"))),A[j>>2]=a,A[g+12>>2]=a,A[a+8>>2]=g,A[a+12>>2]=d),A[T+8>>2]=e,A[T+20>>2]=i);return f+8|0}}}while(0);X();b("Reached an unreachable!")}Ld.X=1;function Nd(a){var c,d;0==(A[Od>>2]|0)&&Pd();var f=0==(A[T+440>>2]&4|0);do{if(f){d=A[T+24>>2];if(0==(d|0)){d=6}else{if(d=Qd(d),0==(d|0)){d=6}else{var e=A[Od+8>>2],e=a+47-A[T+12>>2]+e&-e;if(2147483647>e>>>0){var i=Rd(e);if((i|0)==(A[d>>2]+A[d+4>>2]|0)){var j=i,g=e;c=i;d=13}else{var h=i,k=e;d=15}}else{d=14}}}if(6==d){if(d=Rd(0),-1==(d|0)){d=14}else{var e=A[Od+8>>2],e=e+(a+47)&-e,i=d,o=A[Od+4>>2],m=o-1|0,e=0==(m&i|0)?e:e-i+(m+i&-o)|0;2147483647>e>>>0?(i=Rd(e),(i|0)==(d|0)?(j=d,g=e,c=i,d=13):(h=i,k=e,d=15)):d=14}}if(13==d){if(-1!=(j|0)){var w=g,t=j;d=26;break}h=c;k=g}else{if(14==d){A[T+440>>2]|=4;d=23;break}}d=-k|0;if(-1!=(h|0)&2147483647>k>>>0){if(k>>>0<(a+48|0)>>>0){e=A[Od+8>>2],e=a+47-k+e&-e,2147483647>e>>>0?-1==(Rd(e)|0)?(Rd(d),d=22):(x=e+k|0,d=21):(x=k,d=21)}else{var x=k;d=21}}else{x=k,d=21}if(21==d&&-1!=(h|0)){w=x;t=h;d=26;break}A[T+440>>2]|=4}d=23}while(0);23==d&&(f=A[Od+8>>2],f=f+(a+47)&-f,2147483647>f>>>0?(f=Rd(f),j=Rd(0),-1!=(j|0)&-1!=(f|0)&f>>>0<j>>>0?(j=j-f|0,j>>>0<=(a+40|0)>>>0|-1==(f|0)?d=49:(w=j,t=f,d=26)):d=49):d=49);a:do{if(26==d){f=A[T+432>>2]+w|0;A[T+432>>2]=f;f>>>0>E[T+436>>2]>>>0&&(A[T+436>>2]=f);f=E[T+24>>2];j=0==(f|0);b:do{if(j){g=E[T+16>>2];0==(g|0)|t>>>0<g>>>0&&(A[T+16>>2]=t);A[T+444>>2]=t;A[T+448>>2]=w;A[T+456>>2]=0;A[T+36>>2]=A[Od>>2];A[T+32>>2]=-1;for(g=0;!(c=g<<1,h=(c<<2)+T+40|0,A[T+(c+3<<2)+40>>2]=h,A[T+(c+2<<2)+40>>2]=h,g=g+1|0,32==(g|0));){}Sd(t,w-40|0)}else{h=T+444|0;for(c=h>>2;0!=(h|0);){g=E[c];h=h+4|0;k=E[h>>2];x=g+k|0;if((t|0)==(x|0)){if(0!=(A[c+3]&8|0)){break}c=f;if(!(c>>>0>=g>>>0&c>>>0<x>>>0)){break}A[h>>2]=k+w|0;Sd(A[T+24>>2],A[T+12>>2]+w|0);break b}h=A[c+2];c=h>>2}t>>>0<E[T+16>>2]>>>0&&(A[T+16>>2]=t);c=t+w|0;for(h=T+444|0;0!=(h|0);){k=h|0;g=E[k>>2];if((g|0)==(c|0)){if(0!=(A[h+12>>2]&8|0)){break}A[k>>2]=t;var u=h+4|0;A[u>>2]=A[u>>2]+w|0;u=Td(t,g,a);d=50;break a}h=A[h+8>>2]}Ud(t,w)}}while(0);f=E[T+12>>2];f>>>0>a>>>0?(u=f-a|0,A[T+12>>2]=u,j=f=E[T+24>>2],A[T+24>>2]=j+a|0,A[a+(j+4)>>2]=u|1,A[f+4>>2]=a|3,u=f+8|0,d=50):d=49}}while(0);49==d&&(A[Vd>>2]=12,u=0);return u}Nd.X=1;function Md(a){var c,d,f,e,i,j=a>>2,g=-a|0,h=a>>>8;if(0==(h|0)){var k=0}else{if(16777215<a>>>0){k=31}else{var o=(h+1048320|0)>>>16&8,m=h<<o,w=(m+520192|0)>>>16&4,t=m<<w,x=(t+245760|0)>>>16&2,u=14-(w|o|x)+(t<<x>>>15)|0,k=a>>>((u+7|0)>>>0)&1|u<<1}}var q=E[T+(k<<2)+304>>2],s=0==(q|0);a:do{if(s){var p=0,y=g,D=0}else{var O=31==(k|0)?0:25-(k>>>1)|0,M=0,G=g,J=q;i=J>>2;for(var K=a<<O,F=0;;){var ea=A[i+1]&-8,P=ea-a|0;if(P>>>0<G>>>0){if((ea|0)==(a|0)){p=J;y=P;D=J;break a}var ma=J,ba=P}else{ma=M,ba=G}var ta=E[i+5],ha=E[((K>>>31<<2)+16>>2)+i],fa=0==(ta|0)|(ta|0)==(ha|0)?F:ta;if(0==(ha|0)){p=ma;y=ba;D=fa;break a}M=ma;G=ba;J=ha;i=J>>2;K<<=1;F=fa}}}while(0);if(0==(D|0)&0==(p|0)){var Ha=2<<k,wa=A[T+4>>2]&(Ha|-Ha);if(0==(wa|0)){var na=D}else{var Aa=(wa&-wa)-1|0,Ba=Aa>>>12&16,$=Aa>>>(Ba>>>0),oa=$>>>5&8,ia=$>>>(oa>>>0),ra=ia>>>2&4,xa=ia>>>(ra>>>0),Da=xa>>>1&2,ya=xa>>>(Da>>>0),ca=ya>>>1&1,na=A[T+((oa|Ba|ra|Da|ca)+(ya>>>(ca>>>0))<<2)+304>>2]}}else{na=D}var ua=0==(na|0);a:do{if(ua){var U=y,V=p;e=V>>2}else{var Y=na;f=Y>>2;for(var za=y,L=p;;){var Z=(A[f+1]&-8)-a|0,va=Z>>>0<za>>>0,ja=va?Z:za,da=va?Y:L,Q=E[f+4];if(0!=(Q|0)){Y=Q}else{var H=E[f+5];if(0==(H|0)){U=ja;V=da;e=V>>2;break a}Y=H}f=Y>>2;za=ja;L=da}}}while(0);var pa=0==(V|0);a:do{if(pa){var ga=0}else{if(U>>>0<(A[T+8>>2]-a|0)>>>0){var ka=V;d=ka>>2;var W=E[T+16>>2],sa=ka>>>0<W>>>0;do{if(!sa){var Oa=ka+a|0,Va=Oa;if(ka>>>0<Oa>>>0){var Ga=E[e+6],Za=E[e+3],wb=(Za|0)==(V|0);do{if(wb){var xb=V+20|0,Jb=A[xb>>2];if(0==(Jb|0)){var Kb=V+16|0,db=A[Kb>>2];if(0==(db|0)){var la=0;c=la>>2;break}var Ra=Kb,Ka=db}else{Ra=xb,Ka=Jb}for(;;){var mb=Ka+20|0,nb=A[mb>>2];if(0!=(nb|0)){Ra=mb,Ka=nb}else{var yb=Ka+16|0,zb=E[yb>>2];if(0==(zb|0)){break}Ra=yb;Ka=zb}}Ra>>>0<W>>>0&&(X(),b("Reached an unreachable!"));A[Ra>>2]=0;la=Ka}else{var eb=E[e+2];eb>>>0<W>>>0&&(X(),b("Reached an unreachable!"));A[eb+12>>2]=Za;A[Za+8>>2]=eb;la=Za}c=la>>2}while(0);var Lb=0==(Ga|0);b:do{if(!Lb){var Ab=V+28|0,Mb=(A[Ab>>2]<<2)+T+304|0,Nb=(V|0)==(A[Mb>>2]|0);do{if(Nb){A[Mb>>2]=la;if(0!=(la|0)){break}A[T+4>>2]&=1<<A[Ab>>2]^-1;break b}Ga>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));var fb=Ga+16|0;(A[fb>>2]|0)==(V|0)?A[fb>>2]=la:A[Ga+20>>2]=la;if(0==(la|0)){break b}}while(0);la>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));A[c+6]=Ga;var Wa=E[e+4];0!=(Wa|0)&&(Wa>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[c+4]=Wa,A[Wa+24>>2]=la);var Ia=E[e+5];0!=(Ia|0)&&(Ia>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[c+5]=Ia,A[Ia+24>>2]=la)}}while(0);var Bb=16>U>>>0;b:do{if(Bb){var Cb=U+a|0;A[e+1]=Cb|3;var Db=Cb+(ka+4)|0;A[Db>>2]|=1}else{if(A[e+1]=a|3,A[j+(d+1)]=U|1,A[(U>>2)+d+j]=U,256>U>>>0){var ob=U>>>2&1073741822,pb=(ob<<2)+T+40|0,Eb=E[T>>2],Fb=1<<(U>>>3);if(0==(Eb&Fb|0)){A[T>>2]=Eb|Fb;var qb=pb,gb=(ob+2<<2)+T+40|0}else{var rb=(ob+2<<2)+T+40|0,Sa=E[rb>>2];Sa>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));qb=Sa;gb=rb}A[gb>>2]=Va;A[qb+12>>2]=Va;A[j+(d+2)]=qb;A[j+(d+3)]=pb}else{var Pa=Oa,sb=U>>>8;if(0==(sb|0)){var La=0}else{if(16777215<U>>>0){La=31}else{var Gb=(sb+1048320|0)>>>16&8,Ob=sb<<Gb,$a=(Ob+520192|0)>>>16&4,cc=Ob<<$a,jc=(cc+245760|0)>>>16&2,kc=14-($a|Gb|jc)+(cc<<jc>>>15)|0,La=U>>>((kc+7|0)>>>0)&1|kc<<1}}var lc=(La<<2)+T+304|0;A[j+(d+7)]=La;var mc=a+(ka+16)|0;A[j+(d+5)]=0;A[mc>>2]=0;var jb=A[T+4>>2],nc=1<<La;if(0==(jb&nc|0)){A[T+4>>2]=jb|nc,A[lc>>2]=Pa,A[j+(d+6)]=lc,A[j+(d+3)]=Pa,A[j+(d+2)]=Pa}else{for(var Rb=U<<(31==(La|0)?0:25-(La>>>1)|0),kb=A[lc>>2];;){if((A[kb+4>>2]&-8|0)==(U|0)){var Ac=kb+8|0,Sb=E[Ac>>2],oc=E[T+16>>2],Bc=kb>>>0<oc>>>0;do{if(!Bc&&Sb>>>0>=oc>>>0){A[Sb+12>>2]=Pa;A[Ac>>2]=Pa;A[j+(d+2)]=Sb;A[j+(d+3)]=kb;A[j+(d+6)]=0;break b}}while(0);X();b("Reached an unreachable!")}var dc=(Rb>>>31<<2)+kb+16|0,Cc=E[dc>>2];if(0==(Cc|0)){if(dc>>>0>=E[T+16>>2]>>>0){A[dc>>2]=Pa;A[j+(d+6)]=kb;A[j+(d+3)]=Pa;A[j+(d+2)]=Pa;break b}X();b("Reached an unreachable!")}Rb<<=1;kb=Cc}}}}}while(0);ga=V+8|0;break a}}}while(0);X();b("Reached an unreachable!")}ga=0}}while(0);return ga}Md.X=1;function Wd(a){var c;0==(A[Od>>2]|0)&&Pd();var d=4294967232>a>>>0;a:do{if(d){var f=E[T+24>>2];if(0!=(f|0)){var e=E[T+12>>2],i=e>>>0>(a+40|0)>>>0;do{if(i){var j=E[Od+8>>2],g=(Math.floor(((-40-a-1+e+j|0)>>>0)/(j>>>0))-1)*j|0,h=Qd(f);if(0==(A[h+12>>2]&8|0)){var k=Rd(0);c=(h+4|0)>>2;if((k|0)==(A[h>>2]+A[c]|0)&&(g=Rd(-(2147483646<g>>>0?-2147483648-j|0:g)|0),j=Rd(0),-1!=(g|0)&j>>>0<k>>>0&&(g=k-j|0,(k|0)!=(j|0)))){A[c]=A[c]-g|0;A[T+432>>2]=A[T+432>>2]-g|0;Sd(A[T+24>>2],A[T+12>>2]-g|0);c=(k|0)!=(j|0);break a}}}}while(0);E[T+12>>2]>>>0>E[T+28>>2]>>>0&&(A[T+28>>2]=-1)}}c=0}while(0);return c&1}Wd.X=1;function Xd(a){var c,d,f,e,i,j,g=a>>2,h,k=0==(a|0);a:do{if(!k){var o=a-8|0,m=o,w=E[T+16>>2],t=o>>>0<w>>>0;b:do{if(!t){var x=E[a-4>>2],u=x&3;if(1!=(u|0)){var q=x&-8;j=q>>2;var s=a+(q-8)|0,p=s,y=0==(x&1|0);c:do{if(y){var D=E[o>>2];if(0==(u|0)){break a}var O=-8-D|0;i=O>>2;var M=a+O|0,G=M,J=D+q|0;if(M>>>0<w>>>0){break b}if((G|0)==(A[T+20>>2]|0)){e=(a+(q-4)|0)>>2;if(3!=(A[e]&3|0)){var K=G;f=K>>2;var F=J;break}A[T+8>>2]=J;A[e]&=-2;A[i+(g+1)]=J|1;A[s>>2]=J;break a}if(256>D>>>0){var ea=E[i+(g+2)],P=E[i+(g+3)];if((ea|0)==(P|0)){A[T>>2]&=1<<(D>>>3)^-1,K=G,f=K>>2,F=J}else{var ma=((D>>>2&1073741822)<<2)+T+40|0,ba=(ea|0)!=(ma|0)&ea>>>0<w>>>0;do{if(!ba&&(P|0)==(ma|0)|P>>>0>=w>>>0){A[ea+12>>2]=P;A[P+8>>2]=ea;K=G;f=K>>2;F=J;break c}}while(0);X();b("Reached an unreachable!")}}else{var ta=M,ha=E[i+(g+6)],fa=E[i+(g+3)],Ha=(fa|0)==(ta|0);do{if(Ha){var wa=O+(a+20)|0,na=A[wa>>2];if(0==(na|0)){var Aa=O+(a+16)|0,Ba=A[Aa>>2];if(0==(Ba|0)){var $=0;d=$>>2;break}var oa=Aa,ia=Ba}else{oa=wa,ia=na,h=21}for(;;){var ra=ia+20|0,xa=A[ra>>2];if(0!=(xa|0)){oa=ra,ia=xa}else{var Da=ia+16|0,ya=E[Da>>2];if(0==(ya|0)){break}oa=Da;ia=ya}}oa>>>0<w>>>0&&(X(),b("Reached an unreachable!"));A[oa>>2]=0;$=ia}else{var ca=E[i+(g+2)];ca>>>0<w>>>0&&(X(),b("Reached an unreachable!"));A[ca+12>>2]=fa;A[fa+8>>2]=ca;$=fa}d=$>>2}while(0);if(0!=(ha|0)){var ua=O+(a+28)|0,U=(A[ua>>2]<<2)+T+304|0,V=(ta|0)==(A[U>>2]|0);do{if(V){A[U>>2]=$;if(0!=($|0)){break}A[T+4>>2]&=1<<A[ua>>2]^-1;K=G;f=K>>2;F=J;break c}ha>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));var Y=ha+16|0;(A[Y>>2]|0)==(ta|0)?A[Y>>2]=$:A[ha+20>>2]=$;if(0==($|0)){K=G;f=K>>2;F=J;break c}}while(0);$>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));A[d+6]=ha;var za=E[i+(g+4)];0!=(za|0)&&(za>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[d+4]=za,A[za+24>>2]=$);var L=E[i+(g+5)];0!=(L|0)&&(L>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[d+5]=L,A[L+24>>2]=$)}K=G;f=K>>2;F=J}}else{K=m,f=K>>2,F=q}}while(0);var Z=K;if(Z>>>0<s>>>0){var va=a+(q-4)|0,ja=E[va>>2];if(0!=(ja&1|0)){var da=0==(ja&2|0);do{if(da){if((p|0)==(A[T+24>>2]|0)){var Q=A[T+12>>2]+F|0;A[T+12>>2]=Q;A[T+24>>2]=K;A[f+1]=Q|1;(K|0)==(A[T+20>>2]|0)&&(A[T+20>>2]=0,A[T+8>>2]=0);if(Q>>>0<=E[T+28>>2]>>>0){break a}Wd(0);break a}if((p|0)==(A[T+20>>2]|0)){var H=A[T+8>>2]+F|0;A[T+8>>2]=H;A[T+20>>2]=K;A[f+1]=H|1;A[(Z+H|0)>>2]=H;break a}var pa=(ja&-8)+F|0,ga=ja>>>3,ka=256>ja>>>0;c:do{if(ka){var W=E[g+j],sa=E[((q|4)>>2)+g];if((W|0)==(sa|0)){A[T>>2]&=1<<ga^-1}else{var Oa=((ja>>>2&1073741822)<<2)+T+40|0;h=(W|0)==(Oa|0)?63:W>>>0<E[T+16>>2]>>>0?66:63;do{if(63==h&&!((sa|0)!=(Oa|0)&&sa>>>0<E[T+16>>2]>>>0)){A[W+12>>2]=sa;A[sa+8>>2]=W;break c}}while(0);X();b("Reached an unreachable!")}}else{var Va=s,Ga=E[j+(g+4)],Za=E[((q|4)>>2)+g],wb=(Za|0)==(Va|0);do{if(wb){var xb=q+(a+12)|0,Jb=A[xb>>2];if(0==(Jb|0)){var Kb=q+(a+8)|0,db=A[Kb>>2];if(0==(db|0)){var la=0;c=la>>2;break}var Ra=Kb,Ka=db}else{Ra=xb,Ka=Jb,h=73}for(;;){var mb=Ka+20|0,nb=A[mb>>2];if(0!=(nb|0)){Ra=mb,Ka=nb}else{var yb=Ka+16|0,zb=E[yb>>2];if(0==(zb|0)){break}Ra=yb;Ka=zb}}Ra>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));A[Ra>>2]=0;la=Ka}else{var eb=E[g+j];eb>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));A[eb+12>>2]=Za;A[Za+8>>2]=eb;la=Za}c=la>>2}while(0);if(0!=(Ga|0)){var Lb=q+(a+20)|0,Ab=(A[Lb>>2]<<2)+T+304|0,Mb=(Va|0)==(A[Ab>>2]|0);do{if(Mb){A[Ab>>2]=la;if(0!=(la|0)){break}A[T+4>>2]&=1<<A[Lb>>2]^-1;break c}Ga>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));var Nb=Ga+16|0;(A[Nb>>2]|0)==(Va|0)?A[Nb>>2]=la:A[Ga+20>>2]=la;if(0==(la|0)){break c}}while(0);la>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));A[c+6]=Ga;var fb=E[j+(g+2)];0!=(fb|0)&&(fb>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[c+4]=fb,A[fb+24>>2]=la);var Wa=E[j+(g+3)];0!=(Wa|0)&&(Wa>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[c+5]=Wa,A[Wa+24>>2]=la)}}}while(0);A[f+1]=pa|1;A[Z+pa>>2]=pa;if((K|0)!=(A[T+20>>2]|0)){var Ia=pa}else{A[T+8>>2]=pa;break a}}else{A[va>>2]=ja&-2,A[f+1]=F|1,Ia=A[Z+F>>2]=F}}while(0);if(256>Ia>>>0){var Bb=Ia>>>2&1073741822,Cb=(Bb<<2)+T+40|0,Db=E[T>>2],ob=1<<(Ia>>>3);if(0==(Db&ob|0)){A[T>>2]=Db|ob;var pb=Cb,Eb=(Bb+2<<2)+T+40|0}else{var Fb=(Bb+2<<2)+T+40|0,qb=E[Fb>>2];qb>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));pb=qb;Eb=Fb}A[Eb>>2]=K;A[pb+12>>2]=K;A[f+2]=pb;A[f+3]=Cb;break a}var gb=K,rb=Ia>>>8;if(0==(rb|0)){var Sa=0}else{if(16777215<Ia>>>0){Sa=31}else{var Pa=(rb+1048320|0)>>>16&8,sb=rb<<Pa,La=(sb+520192|0)>>>16&4,Gb=sb<<La,Ob=(Gb+245760|0)>>>16&2,$a=14-(La|Pa|Ob)+(Gb<<Ob>>>15)|0,Sa=Ia>>>(($a+7|0)>>>0)&1|$a<<1}}var cc=(Sa<<2)+T+304|0;A[f+7]=Sa;A[f+5]=0;A[f+4]=0;var jc=A[T+4>>2],kc=1<<Sa,lc=0==(jc&kc|0);c:do{if(lc){A[T+4>>2]=jc|kc,A[cc>>2]=gb,A[f+6]=cc,A[f+3]=K,A[f+2]=K}else{for(var mc=Ia<<(31==(Sa|0)?0:25-(Sa>>>1)|0),jb=A[cc>>2];;){if((A[jb+4>>2]&-8|0)==(Ia|0)){var nc=jb+8|0,Rb=E[nc>>2],kb=E[T+16>>2],Ac=jb>>>0<kb>>>0;do{if(!Ac&&Rb>>>0>=kb>>>0){A[Rb+12>>2]=gb;A[nc>>2]=gb;A[f+2]=Rb;A[f+3]=jb;A[f+6]=0;break c}}while(0);X();b("Reached an unreachable!")}var Sb=(mc>>>31<<2)+jb+16|0,oc=E[Sb>>2];if(0==(oc|0)){if(Sb>>>0>=E[T+16>>2]>>>0){A[Sb>>2]=gb;A[f+6]=jb;A[f+3]=K;A[f+2]=K;break c}X();b("Reached an unreachable!")}mc<<=1;jb=oc}}}while(0);var Bc=A[T+32>>2]-1|0;A[T+32>>2]=Bc;if(0!=(Bc|0)){break a}var dc=A[T+452>>2],Cc=0==(dc|0);c:do{if(!Cc){for(var ie=dc;;){var je=A[ie+8>>2];if(0==(je|0)){break c}ie=je}}}while(0);A[T+32>>2]=-1;break a}}}}}while(0);X();b("Reached an unreachable!")}}while(0)}Module._free=Xd;Xd.X=1;function Yd(a,c){var d,f,e,i=4294967231<c>>>0;a:do{if(i){A[Vd>>2]=12;var j=0}else{e=d=a-8|0;f=(a-4|0)>>2;var g=E[f],h=g&-8,k=h-8|0,o=a+k|0,m=d>>>0<E[T+16>>2]>>>0;do{if(!m){var w=g&3;if(1!=(w|0)&-8<(k|0)&&(d=(a+(h-4)|0)>>2,0!=(A[d]&1|0))){i=11>c>>>0?16:c+11&-8;if(0==(w|0)){var t=0,x,g=A[e+4>>2]&-8;x=256>i>>>0?0:g>>>0>=(i+4|0)>>>0&&(g-i|0)>>>0<=A[Od+8>>2]<<1>>>0?e:0;e=17}else{h>>>0<i>>>0?(o|0)!=(A[T+24>>2]|0)?e=21:(d=A[T+12>>2]+h|0,d>>>0>i>>>0?(t=d-i|0,x=a+(i-8)|0,A[f]=i|g&1|2,A[a+(i-4)>>2]=t|1,A[T+24>>2]=x,A[T+12>>2]=t,t=0,x=e,e=17):e=21):(t=h-i|0,15<t>>>0?(A[f]=i|g&1|2,A[a+(i-4)>>2]=t|3,A[d]|=1,t=a+i|0):t=0,x=e,e=17)}do{if(17==e&&0!=(x|0)){0!=(t|0)&&Xd(t);j=x+8|0;break a}}while(0);e=Yb(c);if(0==(e|0)){j=0;break a}f=h-(0==(A[f]&3|0)?8:4)|0;hd(e,a,f>>>0<c>>>0?f:c);Xd(a);j=e;break a}}}while(0);X();b("Reached an unreachable!")}}while(0);return j}Yd.X=1;function Pd(){if(0==(A[Od>>2]|0)){var a=Zd();0==(a-1&a|0)?(A[Od+8>>2]=a,A[Od+4>>2]=a,A[Od+12>>2]=-1,A[Od+16>>2]=2097152,A[Od+20>>2]=0,A[T+440>>2]=0,A[Od>>2]=Math.floor(Date.now()/1e3)&-16^1431655768):(X(),b("Reached an unreachable!"))}}function $d(a){if(0==(a|0)){a=0}else{var a=A[a-4>>2],c=a&3,a=1==(c|0)?0:(a&-8)-(0==(c|0)?8:4)|0}return a}function Qd(a){var c,d=T+444|0;for(c=d>>2;;){var f=E[c];if(f>>>0<=a>>>0&&(f+A[c+1]|0)>>>0>a>>>0){var e=d;break}c=E[c+2];if(0==(c|0)){e=0;break}d=c;c=d>>2}return e}function Sd(a,c){var d=a+8|0,d=0==(d&7|0)?0:-d&7,f=c-d|0;A[T+24>>2]=a+d|0;A[T+12>>2]=f;A[d+(a+4)>>2]=f|1;A[c+(a+4)>>2]=40;A[T+28>>2]=A[Od+16>>2]}function Td(a,c,d){var f,e,i,j=c>>2,g=a>>2,h,k=a+8|0,k=0==(k&7|0)?0:-k&7;e=c+8|0;var o=0==(e&7|0)?0:-e&7;i=o>>2;var m=c+o|0,w=k+d|0;e=w>>2;var t=a+w|0,x=m-(a+k)-d|0;A[(k+4>>2)+g]=d|3;d=(m|0)==(A[T+24>>2]|0);a:do{if(d){var u=A[T+12>>2]+x|0;A[T+12>>2]=u;A[T+24>>2]=t;A[e+(g+1)]=u|1}else{if((m|0)==(A[T+20>>2]|0)){u=A[T+8>>2]+x|0,A[T+8>>2]=u,A[T+20>>2]=t,A[e+(g+1)]=u|1,A[(a+u+w|0)>>2]=u}else{var q=E[i+(j+1)];if(1==(q&3|0)){var u=q&-8,s=q>>>3,p=256>q>>>0;b:do{if(p){var y=E[((o|8)>>2)+j],D=E[i+(j+3)];if((y|0)==(D|0)){A[T>>2]&=1<<s^-1}else{var O=((q>>>2&1073741822)<<2)+T+40|0;h=(y|0)==(O|0)?15:y>>>0<E[T+16>>2]>>>0?18:15;do{if(15==h&&!((D|0)!=(O|0)&&D>>>0<E[T+16>>2]>>>0)){A[y+12>>2]=D;A[D+8>>2]=y;break b}}while(0);X();b("Reached an unreachable!")}}else{h=m;y=E[((o|24)>>2)+j];D=E[i+(j+3)];O=(D|0)==(h|0);do{if(O){f=o|16;var M=f+(c+4)|0,G=A[M>>2];if(0==(G|0)){if(f=c+f|0,G=A[f>>2],0==(G|0)){G=0;f=G>>2;break}}else{f=M}for(;;){var M=G+20|0,J=A[M>>2];if(0==(J|0)&&(M=G+16|0,J=E[M>>2],0==(J|0))){break}f=M;G=J}f>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));A[f>>2]=0}else{f=E[((o|8)>>2)+j],f>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[f+12>>2]=D,A[D+8>>2]=f,G=D}f=G>>2}while(0);if(0!=(y|0)){D=o+(c+28)|0;O=(A[D>>2]<<2)+T+304|0;M=(h|0)==(A[O>>2]|0);do{if(M){A[O>>2]=G;if(0!=(G|0)){break}A[T+4>>2]&=1<<A[D>>2]^-1;break b}y>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));J=y+16|0;(A[J>>2]|0)==(h|0)?A[J>>2]=G:A[y+20>>2]=G;if(0==(G|0)){break b}}while(0);G>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"));A[f+6]=y;h=o|16;y=E[(h>>2)+j];0!=(y|0)&&(y>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[f+4]=y,A[y+24>>2]=G);h=E[(h+4>>2)+j];0!=(h|0)&&(h>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!")),A[f+5]=h,A[h+24>>2]=G)}}}while(0);q=c+(u|o)|0;u=u+x|0}else{q=m,u=x}q=q+4|0;A[q>>2]&=-2;A[e+(g+1)]=u|1;A[(u>>2)+g+e]=u;if(256>u>>>0){s=u>>>2&1073741822,q=(s<<2)+T+40|0,p=E[T>>2],u=1<<(u>>>3),0==(p&u|0)?(A[T>>2]=p|u,u=q,s=(s+2<<2)+T+40|0):(s=(s+2<<2)+T+40|0,u=E[s>>2],u>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"))),A[s>>2]=t,A[u+12>>2]=t,A[e+(g+2)]=u,A[e+(g+3)]=q}else{if(q=t,p=u>>>8,0==(p|0)?s=0:16777215<u>>>0?s=31:(s=(p+1048320|0)>>>16&8,h=p<<s,p=(h+520192|0)>>>16&4,h<<=p,y=(h+245760|0)>>>16&2,s=14-(p|s|y)+(h<<y>>>15)|0,s=u>>>((s+7|0)>>>0)&1|s<<1),p=(s<<2)+T+304|0,A[e+(g+7)]=s,h=w+(a+16)|0,A[e+(g+5)]=0,A[h>>2]=0,h=A[T+4>>2],y=1<<s,0==(h&y|0)){A[T+4>>2]=h|y,A[p>>2]=q,A[e+(g+6)]=p,A[e+(g+3)]=q,A[e+(g+2)]=q}else{s=u<<(31==(s|0)?0:25-(s>>>1)|0);for(p=A[p>>2];;){if((A[p+4>>2]&-8|0)==(u|0)){h=p+8|0;y=E[h>>2];D=E[T+16>>2];O=p>>>0<D>>>0;do{if(!O&&y>>>0>=D>>>0){A[y+12>>2]=q;A[h>>2]=q;A[e+(g+2)]=y;A[e+(g+3)]=p;A[e+(g+6)]=0;break a}}while(0);X();b("Reached an unreachable!")}h=(s>>>31<<2)+p+16|0;y=E[h>>2];if(0==(y|0)){if(h>>>0>=E[T+16>>2]>>>0){A[h>>2]=q;A[e+(g+6)]=p;A[e+(g+3)]=q;A[e+(g+2)]=q;break a}X();b("Reached an unreachable!")}s<<=1;p=y}}}}}}while(0);return a+(k|8)|0}Td.X=1;function ae(a){A[a>>2]=be+8|0}function ce(a){de(a|0)}function Ud(a,c){var d,f,e=E[T+24>>2];f=e>>2;var i=Qd(e),j=A[i>>2];d=A[i+4>>2];var i=j+d|0,g=j+(d-39)|0,j=j+(d-47)+(0==(g&7|0)?0:-g&7)|0,j=j>>>0<(e+16|0)>>>0?e:j,g=j+8|0;d=g>>2;Sd(a,c-40|0);A[(j+4|0)>>2]=27;A[d]=A[T+444>>2];A[d+1]=A[T+448>>2];A[d+2]=A[T+452>>2];A[d+3]=A[T+456>>2];A[T+444>>2]=a;A[T+448>>2]=c;A[T+456>>2]=0;A[T+452>>2]=g;d=j+28|0;A[d>>2]=7;g=(j+32|0)>>>0<i>>>0;a:do{if(g){for(var h=d;;){var k=h+4|0;A[k>>2]=7;if((h+8|0)>>>0>=i>>>0){break a}h=k}}}while(0);i=(j|0)==(e|0);a:do{if(!i){if(d=j-e|0,g=e+d|0,h=d+(e+4)|0,A[h>>2]&=-2,A[f+1]=d|1,A[g>>2]=d,256>d>>>0){h=d>>>2&1073741822,g=(h<<2)+T+40|0,k=E[T>>2],d=1<<(d>>>3),0==(k&d|0)?(A[T>>2]=k|d,d=g,h=(h+2<<2)+T+40|0):(h=(h+2<<2)+T+40|0,d=E[h>>2],d>>>0<E[T+16>>2]>>>0&&(X(),b("Reached an unreachable!"))),A[h>>2]=e,A[d+12>>2]=e,A[f+2]=d,A[f+3]=g}else{g=e;k=d>>>8;if(0==(k|0)){h=0}else{if(16777215<d>>>0){h=31}else{var h=(k+1048320|0)>>>16&8,o=k<<h,k=(o+520192|0)>>>16&4,o=o<<k,m=(o+245760|0)>>>16&2,h=14-(k|h|m)+(o<<m>>>15)|0,h=d>>>((h+7|0)>>>0)&1|h<<1}}k=(h<<2)+T+304|0;A[f+7]=h;A[f+5]=0;A[f+4]=0;o=A[T+4>>2];m=1<<h;if(0==(o&m|0)){A[T+4>>2]=o|m,A[k>>2]=g,A[f+6]=k,A[f+3]=e,A[f+2]=e}else{h=d<<(31==(h|0)?0:25-(h>>>1)|0);for(k=A[k>>2];;){if((A[k+4>>2]&-8|0)==(d|0)){var o=k+8|0,m=E[o>>2],w=E[T+16>>2],t=k>>>0<w>>>0;do{if(!t&&m>>>0>=w>>>0){A[m+12>>2]=g;A[o>>2]=g;A[f+2]=m;A[f+3]=k;A[f+6]=0;break a}}while(0);X();b("Reached an unreachable!")}o=(h>>>31<<2)+k+16|0;m=E[o>>2];if(0==(m|0)){if(o>>>0>=E[T+16>>2]>>>0){A[o>>2]=g;A[f+6]=k;A[f+3]=e;A[f+2]=e;break a}X();b("Reached an unreachable!")}h<<=1;k=m}}}}}while(0)}Ud.X=1;var ee=(function(){function a(a,c){a!=n&&("number"==typeof a?this.k(a):c==n&&"string"!=typeof a?this.q(a,256):this.q(a,c))}function c(){return new a(n)}function d(a,c){var d=i[a.charCodeAt(c)];return d==n?-1:d}function f(a){var d=c();d.t(a);return d}var e;e=(function(a,c){this.d=a|0;this.e=c|0});e.W={};e.t=(function(a){if(-128<=a&&128>a){var c=e.W[a];if(c){return c}}c=new e(a|0,0>a?-1:0);-128<=a&&128>a&&(e.W[a]=c);return c});e.k=(function(a){return isNaN(a)||!isFinite(a)?e.ZERO:a<=-e.$?e.MIN_VALUE:a+1>=e.$?e.MAX_VALUE:0>a?e.k(-a).f():new e(a%e.r|0,a/e.r|0)});e.p=(function(a,c){return new e(a,c)});e.q=(function(a,c){0==a.length&&b(Error("number format error: empty string"));var d=c||10;(2>d||36<d)&&b(Error("radix out of range: "+d));if("-"==a.charAt(0)){return e.q(a.substring(1),d).f()}0<=a.indexOf("-")&&b(Error('number format error: interior "-" character: '+a));for(var f=e.k(Math.pow(d,8)),g=e.ZERO,h=0;h<a.length;h+=8){var i=Math.min(8,a.length-h),j=parseInt(a.substring(h,h+i),d);8>i?(i=e.k(Math.pow(d,i)),g=g.multiply(i).add(e.k(j))):(g=g.multiply(f),g=g.add(e.k(j)))}return g});e.L=65536;e.ob=16777216;e.r=e.L*e.L;e.pb=e.r/2;e.qb=e.r*e.L;e.ya=e.r*e.r;e.$=e.ya/2;e.ZERO=e.t(0);e.ONE=e.t(1);e.Y=e.t(-1);e.MAX_VALUE=e.p(-1,2147483647);e.MIN_VALUE=e.p(0,-2147483648);e.Z=e.t(16777216);e.prototype.K=(function(){return this.e*e.r+this.eb()});e.prototype.toString=(function(a){a=a||10;(2>a||36<a)&&b(Error("radix out of range: "+a));if(this.v()){return"0"}if(this.i()){if(this.j(e.MIN_VALUE)){var c=e.k(a),d=this.o(c),c=d.multiply(c).u(this);return d.toString(a)+c.d.toString(a)}return"-"+this.f().toString(a)}for(var d=e.k(Math.pow(a,6)),c=this,f="";;){var g=c.o(d),h=c.u(g.multiply(d)).d.toString(a),c=g;if(c.v()){return h+f}for(;6>h.length;){h="0"+h}f=""+h+f}});e.prototype.eb=(function(){return 0<=this.d?this.d:e.r+this.d});e.prototype.v=(function(){return 0==this.e&&0==this.d});e.prototype.i=(function(){return 0>this.e});e.prototype.la=(function(){return 1==(this.d&1)});e.prototype.j=(function(a){return this.e==a.e&&this.d==a.d});e.prototype.pa=(function(a){return 0>this.O(a)});e.prototype.fb=(function(a){return 0<this.O(a)});e.prototype.gb=(function(a){return 0<=this.O(a)});e.prototype.O=(function(a){if(this.j(a)){return 0}var c=this.i(),d=a.i();return c&&!d?-1:!c&&d?1:this.u(a).i()?-1:1});e.prototype.f=(function(){return this.j(e.MIN_VALUE)?e.MIN_VALUE:this.kb().add(e.ONE)});e.prototype.add=(function(a){var c=this.e>>>16,d=this.e&65535,f=this.d>>>16,h=a.e>>>16,g=a.e&65535,i=a.d>>>16,j;j=0+((this.d&65535)+(a.d&65535));a=0+(j>>>16);a+=f+i;f=0+(a>>>16);f+=d+g;d=0+(f>>>16);return e.p((a&65535)<<16|j&65535,(d+(c+h)&65535)<<16|f&65535)});e.prototype.u=(function(a){return this.add(a.f())});e.prototype.multiply=(function(a){if(this.v()||a.v()){return e.ZERO}if(this.j(e.MIN_VALUE)){return a.la()?e.MIN_VALUE:e.ZERO}if(a.j(e.MIN_VALUE)){return this.la()?e.MIN_VALUE:e.ZERO}if(this.i()){return a.i()?this.f().multiply(a.f()):this.f().multiply(a).f()}if(a.i()){return this.multiply(a.f()).f()}if(this.pa(e.Z)&&a.pa(e.Z)){return e.k(this.K()*a.K())}var c=this.e>>>16,d=this.e&65535,f=this.d>>>16,h=this.d&65535,g=a.e>>>16,i=a.e&65535,j=a.d>>>16,a=a.d&65535,s,p,y,D;D=0+h*a;y=0+(D>>>16);y+=f*a;p=0+(y>>>16);y=(y&65535)+h*j;p+=y>>>16;p+=d*a;s=0+(p>>>16);p=(p&65535)+f*j;s+=p>>>16;p=(p&65535)+h*i;s+=p>>>16;return e.p((y&65535)<<16|D&65535,(s+(c*a+d*j+f*i+h*g)&65535)<<16|p&65535)});e.prototype.o=(function(a){a.v()&&b(Error("division by zero"));if(this.v()){return e.ZERO}if(this.j(e.MIN_VALUE)){if(a.j(e.ONE)||a.j(e.Y)){return e.MIN_VALUE}if(a.j(e.MIN_VALUE)){return e.ONE}var c=this.mb().o(a).shiftLeft(1);if(c.j(e.ZERO)){return a.i()?e.ONE:e.Y}var d=this.u(a.multiply(c));return c.add(d.o(a))}if(a.j(e.MIN_VALUE)){return e.ZERO}if(this.i()){return a.i()?this.f().o(a.f()):this.f().o(a).f()}if(a.i()){return this.o(a.f()).f()}for(var f=e.ZERO,d=this;d.gb(a);){for(var c=Math.max(1,Math.floor(d.K()/a.K())),h=Math.ceil(Math.log(c)/Math.LN2),h=48>=h?1:Math.pow(2,h-48),g=e.k(c),i=g.multiply(a);i.i()||i.fb(d);){c-=h,g=e.k(c),i=g.multiply(a)}g.v()&&(g=e.ONE);f=f.add(g);d=d.u(i)}return f});e.prototype.ra=(function(a){return this.u(this.o(a).multiply(a))});e.prototype.kb=(function(){return e.p(~this.d,~this.e)});e.prototype.shiftLeft=(function(a){a&=63;if(0==a){return this}var c=this.d;return 32>a?e.p(c<<a,this.e<<a|c>>>32-a):e.p(0,c<<a-32)});e.prototype.mb=(function(){var a;a=1;if(0==a){return this}var c=this.e;return 32>a?e.p(this.d>>>a|c<<32-a,c>>a):e.p(c>>a-32,0<=c?0:-1)});a.prototype.M=(function(a,c,d,e){for(var f=0,h=0;0<=--e;){var g=a*this[f++]+c[d]+h,h=Math.floor(g/67108864);c[d++]=g&67108863}return h});a.prototype.c=26;a.prototype.n=67108863;a.prototype.C=67108864;a.prototype.xa=Math.pow(2,52);a.prototype.U=26;a.prototype.V=0;var i=[],j,g;j=48;for(g=0;9>=g;++g){i[j++]=g}j=97;for(g=10;36>g;++g){i[j++]=g}j=65;for(g=10;36>g;++g){i[j++]=g}a.prototype.copyTo=(function(a){for(var c=this.a-1;0<=c;--c){a[c]=this[c]}a.a=this.a;a.b=this.b});a.prototype.t=(function(a){this.a=1;this.b=0>a?-1:0;0<a?this[0]=a:-1>a?this[0]=a+DV:this.a=0});a.prototype.q=(function(c,e){var f;if(16==e){f=4}else{if(8==e){f=3}else{if(256==e){f=8}else{if(2==e){f=1}else{if(32==e){f=5}else{if(4==e){f=2}else{this.cb(c,e);return}}}}}}this.b=this.a=0;for(var h=c.length,g=r,i=0;0<=--h;){var j=8==f?c[h]&255:d(c,h);0>j?"-"==c.charAt(h)&&(g=l):(g=r,0==i?this[this.a++]=j:i+f>this.c?(this[this.a-1]|=(j&(1<<this.c-i)-1)<<i,this[this.a++]=j>>this.c-i):this[this.a-1]|=j<<i,i+=f,i>=this.c&&(i-=this.c))}8==f&&0!=(c[0]&128)&&(this.b=-1,0<i&&(this[this.a-1]|=(1<<this.c-i)-1<<i));this.s();g&&a.ZERO.m(this,this)});a.prototype.s=(function(){for(var a=this.b&this.n;0<this.a&&this[this.a-1]==a;){--this.a}});a.prototype.P=(function(a,c){var d;for(d=this.a-1;0<=d;--d){c[d+a]=this[d]}for(d=a-1;0<=d;--d){c[d]=0}c.a=this.a+a;c.b=this.b});a.prototype.bb=(function(a,c){for(var d=a;d<this.a;++d){c[d-a]=this[d]}c.a=Math.max(this.a-a,0);c.b=this.b});a.prototype.oa=(function(a,c){var d=a%this.c,e=this.c-d,f=(1<<e)-1,h=Math.floor(a/this.c),g=this.b<<d&this.n,i;for(i=this.a-1;0<=i;--i){c[i+h+1]=this[i]>>e|g,g=(this[i]&f)<<d}for(i=h-1;0<=i;--i){c[i]=0}c[h]=g;c.a=this.a+h+1;c.b=this.b;c.s()});a.prototype.lb=(function(a,c){c.b=this.b;var d=Math.floor(a/this.c);if(d>=this.a){c.a=0}else{var e=a%this.c,f=this.c-e,h=(1<<e)-1;c[0]=this[d]>>e;for(var g=d+1;g<this.a;++g){c[g-d-1]|=(this[g]&h)<<f,c[g-d]=this[g]>>e}0<e&&(c[this.a-d-1]|=(this.b&h)<<f);c.a=this.a-d;c.s()}});a.prototype.m=(function(a,c){for(var d=0,e=0,f=Math.min(a.a,this.a);d<f;){e+=this[d]-a[d],c[d++]=e&this.n,e>>=this.c}if(a.a<this.a){for(e-=a.b;d<this.a;){e+=this[d],c[d++]=e&this.n,e>>=this.c}e+=this.b}else{for(e+=this.b;d<a.a;){e-=a[d],c[d++]=e&this.n,e>>=this.c}e-=a.b}c.b=0>e?-1:0;-1>e?c[d++]=this.C+e:0<e&&(c[d++]=e);c.a=d;c.s()});a.prototype.jb=(function(c,d){var e=this.abs(),f=c.abs(),h=e.a;for(d.a=h+f.a;0<=--h;){d[h]=0}for(h=0;h<f.a;++h){d[h+e.a]=e.M(f[h],d,h,e.a)}d.b=0;d.s();this.b!=c.b&&a.ZERO.m(d,d)});a.prototype.w=(function(d,e,f){var h=d.abs();if(!(0>=h.a)){var g=this.abs();if(g.a<h.a){e!=n&&e.t(0),f!=n&&this.copyTo(f)}else{f==n&&(f=c());var i=c(),j=this.b,d=d.b,q=h[h.a-1],s=1,p;if(0!=(p=q>>>16)){q=p,s+=16}if(0!=(p=q>>8)){q=p,s+=8}if(0!=(p=q>>4)){q=p,s+=4}if(0!=(p=q>>2)){q=p,s+=2}0!=q>>1&&(s+=1);q=this.c-s;0<q?(h.oa(q,i),g.oa(q,f)):(h.copyTo(i),g.copyTo(f));h=i.a;g=i[h-1];if(0!=g){p=g*(1<<this.U)+(1<h?i[h-2]>>this.V:0);s=this.xa/p;p=(1<<this.U)/p;var y=1<<this.V,D=f.a,O=D-h,M=e==n?c():e;i.P(O,M);0<=f.ab(M)&&(f[f.a++]=1,f.m(M,f));a.ONE.P(h,M);for(M.m(i,i);i.a<h;){i[i.a++]=0}for(;0<=--O;){var G=f[--D]==g?this.n:Math.floor(f[D]*s+(f[D-1]+y)*p);if((f[D]+=i.M(G,f,O,h))<G){i.P(O,M);for(f.m(M,f);f[D]<--G;){f.m(M,f)}}}e!=n&&(f.bb(h,e),j!=d&&a.ZERO.m(e,e));f.a=h;f.s();0<q&&f.lb(q,f);0>j&&a.ZERO.m(f,f)}}}});a.prototype.toString=(function(a){if(0>this.b){return"-"+this.f().toString(a)}if(16==a){a=4}else{if(8==a){a=3}else{if(2==a){a=1}else{if(32==a){a=5}else{if(4==a){a=2}else{return this.nb(a)}}}}}var c=(1<<a)-1,d,e=r,f="",h=this.a,g=this.c-h*this.c%a;if(0<h--){if(g<this.c&&0<(d=this[h]>>g)){e=l,f="0123456789abcdefghijklmnopqrstuvwxyz".charAt(d)}for(;0<=h;){g<a?(d=(this[h]&(1<<g)-1)<<a-g,d|=this[--h]>>(g+=this.c-a)):(d=this[h]>>(g-=a)&c,0>=g&&(g+=this.c,--h)),0<d&&(e=l),e&&(f+="0123456789abcdefghijklmnopqrstuvwxyz".charAt(d))}}return e?f:"0"});a.prototype.f=(function(){var d=c();a.ZERO.m(this,d);return d});a.prototype.abs=(function(){return 0>this.b?this.f():this});a.prototype.ab=(function(a){var c=this.b-a.b;if(0!=c){return c}var d=this.a,c=d-a.a;if(0!=c){return c}for(;0<=--d;){if(0!=(c=this[d]-a[d])){return c}}return 0});a.ZERO=f(0);a.ONE=f(1);a.prototype.cb=(function(c,e){this.t(0);e==n&&(e=10);for(var f=this.fa(e),h=Math.pow(e,f),g=r,i=0,j=0,q=0;q<c.length;++q){var s=d(c,q);0>s?"-"==c.charAt(q)&&0==this.S()&&(g=l):(j=e*j+s,++i>=f&&(this.ha(h),this.ga(j),j=i=0))}0<i&&(this.ha(Math.pow(e,i)),this.ga(j));g&&a.ZERO.m(this,this)});a.prototype.fa=(function(a){return Math.floor(Math.LN2*this.c/Math.log(a))});a.prototype.S=(function(){return 0>this.b?-1:0>=this.a||1==this.a&&0>=this[0]?0:1});a.prototype.ha=(function(a){this[this.a]=this.M(a-1,this,0,this.a);++this.a;this.s()});a.prototype.ga=(function(a){var c=0;if(0!=a){for(;this.a<=c;){this[this.a++]=0}for(this[c]+=a;this[c]>=this.C;){this[c]-=this.C,++c>=this.a&&(this[this.a++]=0),++this[c]}}});a.prototype.nb=(function(a){a==n&&(a=10);if(0==this.S()||2>a||36<a){return"0"}var d=this.fa(a),d=Math.pow(a,d),e=f(d),h=c(),g=c(),i="";for(this.w(e,h,g);0<h.S();){i=(d+g.ja()).toString(a).substr(1)+i,h.w(e,h,g)}return g.ja().toString(a)+i});a.prototype.ja=(function(){if(0>this.b){if(1==this.a){return this[0]-this.C}if(0==this.a){return-1}}else{if(1==this.a){return this[0]}if(0==this.a){return 0}}return(this[1]&(1<<32-this.c)-1)<<this.c|this[0]});a.prototype.ea=(function(a,c){for(var d=0,e=0,f=Math.min(a.a,this.a);d<f;){e+=this[d]+a[d],c[d++]=e&this.n,e>>=this.c}if(a.a<this.a){for(e+=a.b;d<this.a;){e+=this[d],c[d++]=e&this.n,e>>=this.c}e+=this.b}else{for(e+=this.b;d<a.a;){e+=a[d],c[d++]=e&this.n,e>>=this.c}e+=a.b}c.b=0>e?-1:0;0<e?c[d++]=e:-1>e&&(c[d++]=this.C+e);c.a=d;c.s()});var h={result:[0,0],add:(function(a,c,d,f){a=(new e(a,c)).add(new e(d,f));h.result[0]=a.d;h.result[1]=a.e}),u:(function(a,c,d,f){a=(new e(a,c)).u(new e(d,f));h.result[0]=a.d;h.result[1]=a.e}),multiply:(function(a,c,d,f){a=(new e(a,c)).multiply(new e(d,f));h.result[0]=a.d;h.result[1]=a.e}),qa:(function(){h.B=new a;h.B.q("4294967296",10)}),I:(function(c,d){var e=new a;e.q(d.toString(),10);var f=new a;e.jb(h.B,f);e=new a;e.q(c.toString(),10);var g=new a;e.ea(f,g);return g}),Hb:(function(c,d,f,g,i){h.B||h.qa();i?(c=h.I(c>>>0,d>>>0),g=h.I(f>>>0,g>>>0),f=new a,c.w(g,f,n),g=new a,c=new a,f.w(h.B,c,g),h.result[0]=parseInt(g.toString())|0,h.result[1]=parseInt(c.toString())|0):(c=new e(c,d),g=new e(f,g),f=c.o(g),h.result[0]=f.d,h.result[1]=f.e)}),ra:(function(c,d,f,g,i){h.B||h.qa();i?(c=h.I(c>>>0,d>>>0),g=h.I(f>>>0,g>>>0),f=new a,c.w(g,n,f),g=new a,c=new a,f.w(h.B,c,g),h.result[0]=parseInt(g.toString())|0,h.result[1]=parseInt(c.toString())|0):(c=new e(c,d),g=new e(f,g),f=c.ra(g),h.result[0]=f.d,h.result[1]=f.e)}),stringify:(function(c,d,f){c=(new e(c,d)).toString();f&&"-"==c[0]&&(h.T||(h.T=new a,h.T.q("18446744073709551616",10)),f=new a,f.q(c,10),c=new a,h.T.ea(f,c),c=c.toString(10));return c})};return h})();function Fc(a,c){function d(a){var d;"double"===a?d=(Wb[0]=A[c+e>>2],Wb[1]=A[c+e+4>>2],Vb[0]):"i64"==a?d=[A[c+e>>2],A[c+e+4>>2]]:(a="i32",d=A[c+e>>2]);e+=Math.max(Ta(a),Ua);return d}for(var f=a,e=0,i=[],j,g;;){var h=f;j=z[f];if(0===j){break}g=z[f+1];if(37==j){var k=r,o=r,m=r,w=r;a:for(;;){switch(g){case 43:k=l;break;case 45:o=l;break;case 35:m=l;break;case 48:if(w){break a}else{w=l;break};default:break a}f++;g=z[f+1]}var t=0;if(42==g){t=d("i32"),f++,g=z[f+1]}else{for(;48<=g&&57>=g;){t=10*t+(g-48),f++,g=z[f+1]}}var x=r;if(46==g){var u=0,x=l;f++;g=z[f+1];if(42==g){u=d("i32"),f++}else{for(;;){g=z[f+1];if(48>g||57<g){break}u=10*u+(g-48);f++}}g=z[f+1]}else{u=6}var q;switch(String.fromCharCode(g)){case"h":g=z[f+2];104==g?(f++,q=1):q=2;break;case"l":g=z[f+2];108==g?(f++,q=8):q=4;break;case"L":case"q":case"j":q=8;break;case"z":case"t":case"I":q=4;break;default:q=n}q&&f++;g=z[f+1];if(-1!="d,i,u,o,x,X,p".split(",").indexOf(String.fromCharCode(g))){h=100==g||105==g;q=q||4;var s=j=d("i"+8*q),p;8==q&&(j=117==g?(j[0]>>>0)+4294967296*(j[1]>>>0):(j[0]>>>0)+4294967296*(j[1]|0));4>=q&&(j=(h?yc:xc)(j&Math.pow(256,q)-1,8*q));var y=Math.abs(j),h="";if(100==g||105==g){p=8==q&&ee?ee.stringify(s[0],s[1]):yc(j,8*q).toString(10)}else{if(117==g){p=8==q&&ee?ee.stringify(s[0],s[1],l):xc(j,8*q).toString(10),j=Math.abs(j)}else{if(111==g){p=(m?"0":"")+y.toString(8)}else{if(120==g||88==g){h=m?"0x":"";if(0>j){j=-j;p=(y-1).toString(16);m=[];for(s=0;s<p.length;s++){m.push((15-parseInt(p[s],16)).toString(16))}for(p=m.join("");p.length<2*q;){p="f"+p}}else{p=y.toString(16)}88==g&&(h=h.toUpperCase(),p=p.toUpperCase())}else{112==g&&(0===y?p="(nil)":(h="0x",p=y.toString(16)))}}}}if(x){for(;p.length<u;){p="0"+p}}for(k&&(h=0>j?"-"+h:"+"+h);h.length+p.length<t;){o?p+=" ":w?p="0"+p:h=" "+h}p=h+p;p.split("").forEach((function(a){i.push(a.charCodeAt(0))}))}else{if(-1!="f,F,e,E,g,G".split(",").indexOf(String.fromCharCode(g))){j=d("double");if(isNaN(j)){p="nan",w=r}else{if(isFinite(j)){x=r;q=Math.min(u,20);if(103==g||71==g){x=l,u=u||1,q=parseInt(j.toExponential(q).split("e")[1],10),u>q&&-4<=q?(g=(103==g?"f":"F").charCodeAt(0),u-=q+1):(g=(103==g?"e":"E").charCodeAt(0),u--),q=Math.min(u,20)}if(101==g||69==g){p=j.toExponential(q),/[eE][-+]\d$/.test(p)&&(p=p.slice(0,-1)+"0"+p.slice(-1))}else{if(102==g||70==g){p=j.toFixed(q)}}h=p.split("e");if(x&&!m){for(;1<h[0].length&&-1!=h[0].indexOf(".")&&("0"==h[0].slice(-1)||"."==h[0].slice(-1));){h[0]=h[0].slice(0,-1)}}else{for(m&&-1==p.indexOf(".")&&(h[0]+=".");u>q++;){h[0]+="0"}}p=h[0]+(1<h.length?"e"+h[1]:"");69==g&&(p=p.toUpperCase());k&&0<=j&&(p="+"+p)}else{p=(0>j?"-":"")+"inf",w=r}}for(;p.length<t;){p=o?p+" ":w&&("-"==p[0]||"+"==p[0])?p[0]+"0"+p.slice(1):(w?"0":" ")+p}97>g&&(p=p.toUpperCase());p.split("").forEach((function(a){i.push(a.charCodeAt(0))}))}else{if(115==g){(k=d("i8*"))?(k=wc(k),x&&k.length>u&&(k=k.slice(0,u))):k=gc("(null)",l);if(!o){for(;k.length<t--;){i.push(32)}}i=i.concat(k);if(o){for(;k.length<t--;){i.push(32)}}}else{if(99==g){for(o&&i.push(d("i8"));0<--t;){i.push(32)}o||i.push(d("i8"))}else{if(110==g){o=d("i32*"),A[o>>2]=i.length}else{if(37==g){i.push(j)}else{for(s=h;s<f+2;s++){i.push(z[s])}}}}}}}f+=2}else{i.push(j),f+=1}}return i}var fe=13,ge=9,he=22,ke=5,le=21,me=6;function ne(a){Vd||(Vd=N([0],"i32",I));A[Vd>>2]=a}var Vd,oe=0,Gc=0,pe=0,qe=2,Ic=[n],re=l;function se(a,c){if("string"!==typeof a){return n}c===aa&&(c="/");a&&"/"==a[0]&&(c="");for(var d=(c+"/"+a).split("/").reverse(),f=[""];d.length;){var e=d.pop();""==e||"."==e||(".."==e?1<f.length&&f.pop():f.push(e))}return 1==f.length?"/":f.join("/")}function te(a,c,d){var f={ib:r,Q:r,error:0,name:n,path:n,object:n,sa:r,ua:n,ta:n},a=se(a);if("/"==a){f.ib=l,f.Q=f.sa=l,f.name="/",f.path=f.ua="/",f.object=f.ta=ue}else{if(a!==n){for(var d=d||0,a=a.slice(1).split("/"),e=ue,i=[""];a.length;){1==a.length&&e.z&&(f.sa=l,f.ua=1==i.length?"/":i.join("/"),f.ta=e,f.name=a[0]);var j=a.shift();if(e.z){if(e.va){if(!e.l.hasOwnProperty(j)){f.error=2;break}}else{f.error=fe;break}}else{f.error=20;break}e=e.l[j];if(e.link&&!(c&&0==a.length)){if(40<d){f.error=40;break}f=se(e.link,i.join("/"));f=te([f].concat(a).join("/"),c,d+1);break}i.push(j);0==a.length&&(f.Q=l,f.path=i.join("/"),f.object=e)}}}return f}function ve(a){we();a=te(a,aa);if(a.Q){return a.object}ne(a.error);return n}function xe(a,c,d,f,e){a||(a="/");"string"===typeof a&&(a=ve(a));a||(ne(fe),b(Error("Parent path must exist.")));a.z||(ne(20),b(Error("Parent must be a folder.")));!a.write&&!re&&(ne(fe),b(Error("Parent folder must be writeable.")));if(!c||"."==c||".."==c){ne(2),b(Error("Name must not be empty."))}a.l.hasOwnProperty(c)&&(ne(17),b(Error("Can't overwrite object.")));a.l[c]={va:f===aa?l:f,write:e===aa?r:e,timestamp:Date.now(),hb:qe++};for(var i in d){d.hasOwnProperty(i)&&(a.l[c][i]=d[i])}return a.l[c]}function ye(a,c){return xe(a,c,{z:l,G:r,l:{}},l,l)}function ze(){var a="dev/shm/tmp",c=ve("/");c===n&&b(Error("Invalid parent."));for(a=a.split("/").reverse();a.length;){var d=a.pop();d&&(c.l.hasOwnProperty(d)||ye(c,d),c=c.l[d])}}function Ae(a,c,d,f){!d&&!f&&b(Error("A device must have at least one callback defined."));var e={G:l,input:d,A:f};e.z=r;return xe(a,c,e,Boolean(d),Boolean(f))}function we(){ue||(ue={va:l,write:l,z:l,G:r,timestamp:Date.now(),hb:1,l:{}})}function Be(){var a,c,d;function f(a){a===n||10===a?(c.J(c.buffer.join("")),c.buffer=[]):c.buffer.push(String.fromCharCode(a))}Xa(!Ce,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");Ce=l;we();a=a||Module.stdin;c=c||Module.stdout;d=d||Module.stderr;var e=l,i=l,j=l;a||(e=r,a=(function(){if(!a.N||!a.N.length){var c;"undefined"!=typeof window&&"function"==typeof window.prompt?c=window.prompt("Input: "):"function"==typeof readline&&(c=readline());c||(c="");a.N=gc(c+"\n",l)}return a.N.shift()}));c||(i=r,c=f);c.J||(c.J=Module.print);c.buffer||(c.buffer=[]);d||(j=r,d=f);d.J||(d.J=Module.print);d.buffer||(d.buffer=[]);ye("/","tmp");var g=ye("/","dev"),h=Ae(g,"stdin",a),k=Ae(g,"stdout",n,c);d=Ae(g,"stderr",n,d);Ae(g,"tty",a,c);Ic[1]={path:"/dev/stdin",object:h,position:0,ma:l,H:r,ka:r,na:!e,error:r,ia:r,wa:[]};Ic[2]={path:"/dev/stdout",object:k,position:0,ma:r,H:l,ka:r,na:!i,error:r,ia:r,wa:[]};Ic[3]={path:"/dev/stderr",object:d,position:0,ma:r,H:l,ka:r,na:!j,error:r,ia:r,wa:[]};oe=N([1],"void*",I);Gc=N([2],"void*",I);pe=N([3],"void*",I);ze();Ic[oe]=Ic[1];Ic[Gc]=Ic[2];Ic[pe]=Ic[3];N([N([0,0,0,0,oe,0,0,0,Gc,0,0,0,pe,0,0,0],"void*",I)],"void*",I)}var Ce,ue;function Hc(a,c,d){var f=Ic[a];if(f){if(f.H){if(0>d){return ne(he),-1}if(f.object.G){if(f.object.A){for(var e=0;e<d;e++){try{f.object.A(z[c+e])}catch(i){return ne(ke),-1}}f.object.timestamp=Date.now();return e}ne(me);return-1}e=f.position;a=Ic[a];if(!a||a.object.G){ne(ge),c=-1}else{if(a.H){if(a.object.z){ne(le),c=-1}else{if(0>d||0>e){ne(he),c=-1}else{for(var j=a.object.l;j.length<e;){j.push(0)}for(var g=0;g<d;g++){j[e+g]=B[c+g]}a.object.timestamp=Date.now();c=g}}}else{ne(fe),c=-1}}-1!=c&&(f.position+=c);return c}ne(fe);return-1}ne(ge);return-1}function Zb(a,c,d){if(20<=d){for(d=a+d;a%4;){z[a++]=c}0>c&&(c+=256);for(var a=a>>2,f=d>>2,e=c|c<<8|c<<16|c<<24;a<f;){A[a++]=e}for(a<<=2;a<d;){z[a++]=c}}else{for(;d--;){z[a++]=c}}}function hd(a,c,d){if(20<=d&&c%2==a%2){if(c%4==a%4){for(d=c+d;c%4;){z[a++]=z[c++]}for(var c=c>>2,a=a>>2,f=d>>2;c<f;){A[a++]=A[c++]}c<<=2;for(a<<=2;c<d;){z[a++]=z[c++]}}else{d=c+d;c%2&&(z[a++]=z[c++]);c>>=1;a>>=1;for(f=d>>1;c<f;){hb[a++]=hb[c++]}c<<=1;a<<=1;c<d&&(z[a++]=z[c++])}}else{for(;d--;){z[a++]=z[c++]}}}function X(){b("abort() at "+Error().stack)}function Zd(){switch(8){case 8:return ac;case 54:case 56:case 21:case 61:case 63:case 22:case 67:case 23:case 24:case 25:case 26:case 27:case 69:case 28:case 101:case 70:case 71:case 29:case 30:case 199:case 75:case 76:case 32:case 43:case 44:case 80:case 46:case 47:case 45:case 48:case 49:case 42:case 82:case 33:case 7:case 108:case 109:case 107:case 112:case 119:case 121:return 200809;case 13:case 104:case 94:case 95:case 34:case 35:case 77:case 81:case 83:case 84:case 85:case 86:case 87:case 88:case 89:case 90:case 91:case 94:case 95:case 110:case 111:case 113:case 114:case 115:case 116:case 117:case 118:case 120:case 40:case 16:case 79:case 19:return-1;case 92:case 93:case 5:case 72:case 6:case 74:case 92:case 93:case 96:case 97:case 98:case 99:case 102:case 103:case 105:return 1;case 38:case 66:case 50:case 51:case 4:return 1024;case 15:case 64:case 41:return 32;case 55:case 37:case 17:return 2147483647;case 18:case 1:return 47839;case 59:case 57:return 99;case 68:case 58:return 2048;case 0:return 2097152;case 3:return 65536;case 14:return 32768;case 73:return 32767;case 39:return 16384;case 60:return 1e3;case 106:return 700;case 52:return 256;case 62:return 255;case 2:return 100;case 65:return 64;case 36:return 20;case 100:return 16;case 20:return 6;case 53:return 4}ne(he);return-1}function Rd(a){De||(bb=bb+4095>>12<<12,De=l);var c=bb;0!=a&&ab(a);return c}var De,de;rc.unshift({R:(function(){!Module.noFSInit&&!Ce&&Be()})});sc.push({R:(function(){re=r})});tc.push({R:(function(){Ce&&(Ic[2]&&0<Ic[2].object.A.buffer.length&&Ic[2].object.A(10),Ic[3]&&0<Ic[3].object.A.buffer.length&&Ic[3].object.A(10))})});ne(0);N(12,"void*",I);Module.$a=(function(a){function c(){for(var a=0;3>a;a++){f.push(0)}}var d=a.length+1,f=[N(gc("/bin/this.program"),"i8",I)];c();for(var e=0;e<d-1;e+=1){f.push(N(gc(a[e]),"i8",I)),c()}f.push(0);f=N(f,"i32",I);return _main(d,f,0)});var Kc,Lc,Hd,T,Od,be,Ee,Fe,Ge,He;R.Ca=N([37,115,40,37,117,41,58,32,65,115,115,101,114,116,105,111,110,32,102,97,105,108,117,114,101,58,32,34,37,115,34,10,0],"i8",I);R.Da=N([109,95,115,105,122,101,32,60,61,32,109,95,99,97,112,97,99,105,116,121,0],"i8",I);R.Ka=N([46,47,99,114,110,95,100,101,99,111,109,112,46,104,0],"i8",I);R.Pa=N([109,105,110,95,110,101,119,95,99,97,112,97,99,105,116,121,32,60,32,40,48,120,55,70,70,70,48,48,48,48,85,32,47,32,101,108,101,109,101,110,116,95,115,105,122,101,41,0],"i8",I);R.Ta=N([110,101,119,95,99,97,112,97,99,105,116,121,32,38,38,32,40,110,101,119,95,99,97,112,97,99,105,116,121,32,62,32,109,95,99,97,112,97,99,105,116,121,41,0],"i8",I);R.Ua=N([110,117,109,95,99,111,100,101,115,91,99,93,0],"i8",I);R.Va=N([115,111,114,116,101,100,95,112,111,115,32,60,32,116,111,116,97,108,95,117,115,101,100,95,115,121,109,115,0],"i8",I);R.Wa=N([112,67,111,100,101,115,105,122,101,115,91,115,121,109,95,105,110,100,101,120,93,32,61,61,32,99,111,100,101,115,105,122,101,0],"i8",I);R.Xa=N([116,32,60,32,40,49,85,32,60,60,32,116,97,98,108,101,95,98,105,116,115,41,0],"i8",I);R.Ya=N([109,95,108,111,111,107,117,112,91,116,93,32,61,61,32,99,85,73,78,84,51,50,95,77,65,88,0],"i8",I);Kc=N([2],["i8* (i8*, i32, i32*, i1, i8*)*",0,0,0,0],I);N([4],["i32 (i8*, i8*)*",0,0,0,0],I);Lc=N(1,"i8*",I);R.aa=N([99,114,110,100,95,109,97,108,108,111,99,58,32,115,105,122,101,32,116,111,111,32,98,105,103,0],"i8",I);R.Ea=N([99,114,110,100,95,109,97,108,108,111,99,58,32,111,117,116,32,111,102,32,109,101,109,111,114,121,0],"i8",I);R.ba=N([40,40,117,105,110,116,51,50,41,112,95,110,101,119,32,38,32,40,67,82,78,68,95,77,73,78,95,65,76,76,79,67,95,65,76,73,71,78,77,69,78,84,32,45,32,49,41,41,32,61,61,32,48,0],"i8",I);R.Fa=N([99,114,110,100,95,114,101,97,108,108,111,99,58,32,98,97,100,32,112,116,114,0],"i8",I);R.Ga=N([99,114,110,100,95,102,114,101,101,58,32,98,97,100,32,112,116,114,0],"i8",I);R.wb=N([99,114,110,100,95,109,115,105,122,101,58,32,98,97,100,32,112,116,114,0],"i8",I);N([1,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,128,0,0,0,256,0,0,0,512,0,0,0,1024,0,0,0,2048,0,0,0,4096,0,0,0,8192,0,0,0,16384,0,0,0,32768,0,0,0,65536,0,0,0,131072,0,0,0,262144,0,0,0,524288,0,0,0,1048576,0,0,0,2097152,0,0,0,4194304,0,0,0,8388608,0,0,0,16777216,0,0,0,33554432,0,0,0,67108864,0,0,0,134217728,0,0,0,268435456,0,0,0,536870912,0,0,0,1073741824,0,0,0,-2147483648,0,0,0],["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0],I);R.Ia=N([102,97,108,115,101,0],"i8",I);R.xb=N([99,114,110,100,95,118,97,108,105,100,97,116,101,95,102,105,108,101,40,38,110,101,119,95,104,101,97,100,101,114,44,32,97,99,116,117,97,108,95,98,97,115,101,95,100,97,116,97,95,115,105,122,101,44,32,78,85,76,76,41,0],"i8",I);R.yb=N([40,116,111,116,97,108,95,115,121,109,115,32,62,61,32,49,41,32,38,38,32,40,116,111,116,97,108,95,115,121,109,115,32,60,61,32,112,114,101,102,105,120,95,99,111,100,105,110,103,58,58,99,77,97,120,83,117,112,112,111,114,116,101,100,83,121,109,115,41,32,38,38,32,40,99,111,100,101,95,115,105,122,101,95,108,105,109,105,116,32,62,61,32,49,41,0],"i8",I);R.Ja=N([40,116,111,116,97,108,95,115,121,109,115,32,62,61,32,49,41,32,38,38,32,40,116,111,116,97,108,95,115,121,109,115,32,60,61,32,112,114,101,102,105,120,95,99,111,100,105,110,103,58,58,99,77,97,120,83,117,112,112,111,114,116,101,100,83,121,109,115,41,0],"i8",I);R.za=N([17,18,19,20,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15,16],"i8",I);R.ca=N([48,0],"i8",I);R.La=N([110,117,109,95,98,105,116,115,32,60,61,32,51,50,85,0],"i8",I);R.Ma=N([109,95,98,105,116,95,99,111,117,110,116,32,60,61,32,99,66,105,116,66,117,102,83,105,122,101,0],"i8",I);R.Na=N([116,32,33,61,32,99,85,73,78,84,51,50,95,77,65,88,0],"i8",I);R.Oa=N([109,111,100,101,108,46,109,95,99,111,100,101,95,115,105,122,101,115,91,115,121,109,93,32,61,61,32,108,101,110,0],"i8",I);N([1,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,7,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,7,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,8,0,0,0],["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0],I);N([0,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,7,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,8,0,0,0],["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0],I);R.rb=N([0,3,1,2],"i8",I);R.h=N([0,2,3,1],"i8",I);R.sb=N([0,7,1,2,3,4,5,6],"i8",I);R.g=N([0,2,3,4,5,6,7,1],"i8",I);R.tb=N([1,0,5,4,3,2,6,7],"i8",I);R.ub=N([1,0,7,6,5,4,3,2],"i8",I);R.Ab=N([105,110,100,101,120,32,60,32,50,0],"i8",I);R.Bb=N([40,108,111,32,60,61,32,48,120,70,70,70,70,85,41,32,38,38,32,40,104,105,32,60,61,32,48,120,70,70,70,70,85,41,0],"i8",I);R.Cb=N([40,120,32,60,32,99,68,88,84,66,108,111,99,107,83,105,122,101,41,32,38,38,32,40,121,32,60,32,99,68,88,84,66,108,111,99,107,83,105,122,101,41,0],"i8",I);R.Db=N([118,97,108,117,101,32,60,61,32,48,120,70,70,0],"i8",I);R.Eb=N([118,97,108,117,101,32,60,61,32,48,120,70,0],"i8",I);R.Fb=N([40,108,111,32,60,61,32,48,120,70,70,41,32,38,38,32,40,104,105,32,60,61,32,48,120,70,70,41,0],"i8",I);R.F=N([105,32,60,32,109,95,115,105,122,101,0],"i8",I);R.da=N([110,117,109,32,38,38,32,40,110,117,109,32,61,61,32,126,110,117,109,95,99,104,101,99,107,41,0],"i8",I);R.D=N([1,2,2,3,3,3,3,4],"i8",I);Hd=N([0,0,0,0,0,0,1,1,0,1,0,1,0,0,1,2,1,2,0,0,0,1,0,2,1,0,2,0,0,1,2,3],"i8",I);R.Qa=N([110,101,120,116,95,108,101,118,101,108,95,111,102,115,32,62,32,99,117,114,95,108,101,118,101,108,95,111,102,115,0],"i8",I);R.Sa=N([40,108,101,110,32,62,61,32,49,41,32,38,38,32,40,108,101,110,32,60,61,32,99,77,97,120,69,120,112,101,99,116,101,100,67,111,100,101,83,105,122,101,41,0],"i8",I);T=N(468,["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0],I);Od=N(24,"i32",I);R.Gb=N([109,97,120,32,115,121,115,116,101,109,32,98,121,116,101,115,32,61,32,37,49,48,108,117,10,0],"i8",I);R.vb=N([115,121,115,116,101,109,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0],"i8",I);R.zb=N([105,110,32,117,115,101,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0],"i8",I);N([0],"i8",I);N(1,"void ()*",I);be=N([0,0,0,0,0,0,0,0,6,0,0,0,8,0,0,0,10,0,0,0],["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0],I);N(1,"void*",I);R.Ra=N([115,116,100,58,58,98,97,100,95,97,108,108,111,99,0],"i8",I);Ee=N([0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,14,0,0,0],["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0],I);N(1,"void*",I);R.Ha=N([98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0],"i8",I);R.Ba=N([83,116,57,98,97,100,95,97,108,108,111,99,0],"i8",I);Ge=N(12,"*",I);R.Aa=N([83,116,50,48,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0],"i8",I);He=N(12,"*",I);A[be+4>>2]=Ge;A[Ee+4>>2]=He;Fe=N([2,0,0,0,0],["i8*",0,0,0,0],I);A[Ge>>2]=Fe+8|0;A[Ge+4>>2]=R.Ba|0;A[Ge+8>>2]=aa;A[He>>2]=Fe+8|0;A[He+4>>2]=R.Aa|0;A[He+8>>2]=Ge;$b=[0,0,(function(a,c,d,f){if(0==(a|0)){a=Yb(c),0!=(d|0)&&(A[d>>2]=0==(a|0)?0:$d(a)),d=a}else{if(0==(c|0)){Xd(a),0!=(d|0)&&(A[d>>2]=0),d=0}else{var e=0==(a|0)?Yb(c):Yd(a,c),i=0!=(e|0),j=i?e:a;i|f^1?a=j:(e=0==(a|0)?Yb(c):Yd(a,c),0==(e|0)?e=0:a=e);0!=(d|0)&&(A[d>>2]=$d(a));d=e}}return d}),0,(function(a){return 0==(a|0)?0:$d(a)}),0,ce,0,(function(a){ce(a);0!=(a|0)&&Xd(a)}),0,(function(){return R.Ra|0}),0,(function(a){ce(a|0);0!=(a|0)&&Xd(a)}),0,(function(){return R.Ha|0}),0,$c,0,(function(a,c){A[a>>2]=0;ad(a+4|0);A[a+20>>2]=0;var d;if((a|0)!=(c|0)){A[a>>2]=A[c>>2];d=a+4|0;var f=c+4|0,e,i=(d|0)==(f|0);do{if(!i){e=(f+4|0)>>2;if((A[d+8>>2]|0)==(A[e]|0)){id(d,0)}else{if(dd(d),!jd(d,A[e],0)){break}}hd(A[d>>2],A[f>>2],A[e]);A[d+4>>2]=A[e]}}while(0);0!=(z[d+12|0]&1)<<24>>24?cd(a):(f=A[c+20>>2],d=(a+20|0)>>2,e=A[d],0==(f|0)?(bd(e),A[d]=0):0==(e|0)?(e=Mc(180,0),0==(e|0)?f=0:0==(e|0)?f=0:(A[e+164>>2]=0,A[e+168>>2]=0,A[e+172>>2]=0,A[e+176>>2]=0,gd(e,f),f=e),A[d]=f):gd(e,f))}}),0,ed,0,fd,0,ae,0,(function(a){ae(a|0);A[a>>2]=Ee+8|0}),0];Module.FUNCTION_TABLE=$b;function Ie(a){a=a||Module.arguments;Module.setStatus&&Module.setStatus("");Module.preRun&&Module.preRun();var c=n;Module._main&&(qc(sc),c=Module.$a(a),Module.noExitRuntime||qc(tc));Module.postRun&&Module.postRun();return c}Module.run=Ie;qc(rc);Module.noInitialRun&&(zc++,Module.monitorRunDependencies&&Module.monitorRunDependencies(zc));0==zc&&Ie()

}).call(this,require('_process'),"/src")

},{"_process":11,"fs":9,"path":10}],5:[function(require,module,exports){
function extensionChooser(supportedExtensions) {
    supportedExtensions = supportedExtensions || [];

    var imageParser = require('./imageParser')();

    return function (resource, next) {
        var ext = resource.metadata.choice;
        if (!ext) {
            return next();
        }
        //let us choose extension!
        var url = resource.url;
        if (!resource._defaultUrlChoice) {
            resource._defaultUrlChoice = url;
            var k = url.lastIndexOf(".");
            if (k >= 0) {
                resource._baseUrl = url.substring(0, k);
            } else {
                return next();
            }
        }
        for (var i = ext.length - 1; i >= 0; i--) {
            url = resource._baseUrl + ext[i];
            var isSupported = false;
            for (var j = 0; j < supportedExtensions.length; j++) {
                if (ext[i] === supportedExtensions[j]) {
                    resource.url = url;
                    resource.loadType = resource._determineLoadType();
                    return imageParser(resource, next);
                }
            }
        }
        return imageParser(resource, next);
    };
}

module.exports = extensionChooser;

},{"./imageParser":7}],6:[function(require,module,exports){
var core = PIXI,
    utils = core.utils,
    extensionFixer = require('./CompressedImage');

function textureExtensionFixer(supportedExtensions) {
    return function (resource, next) {
        if (resource.texture && resource._defaultUrlChoice && resource._defaultUrl != resource.url) {
            var texture = resource.texture;
            var baseTexture = texture.baseTexture;
            delete utils.BaseTextureCache[baseTexture.imageUrl];
            delete utils.TextureCache[baseTexture.imageUrl];
            baseTexture.imageUrl = resource._defaultUrlChoice;
            core.utils.BaseTextureCache[baseTexture.imageUrl] = baseTexture;
            core.utils.TextureCache[baseTexture.imageUrl] = texture;
        }
        next();
    };
}

module.exports = textureExtensionFixer;

},{"./CompressedImage":1}],7:[function(require,module,exports){
var core = PIXI,
    utils = core.utils,
    CompressedImage = require('./CompressedImage'),
    Resource = core.loaders.Resource;

Resource.setExtensionXhrType('dds', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('crn', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('pvr', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('etc1', Resource.XHR_RESPONSE_TYPE.BUFFER);

function imageParser() {
    return function (resource, next) {
        if (resource.url.indexOf('.crn') != -1 || resource.url.indexOf('.dds') != -1 || resource.url.indexOf('.pvr') != -1 || resource.url.indexOf('.etc1') != -1) {
            var compressedImage = resource.compressedImage || new CompressedImage(resource.url);
            if (resource.data) {
                throw "compressedImageParser middleware must be specified in loader.before() and must have zero resource.data";
            }
            resource.isCompressedImage = true;
            resource.data = compressedImage;
            resource.onComplete.add(function() {
                resource.type = Resource.TYPE.IMAGE;
                compressedImage.loadFromArrayBuffer(resource.data, resource.url.includes(".crn"));
                resource.data = compressedImage;
            });
        }
        next();
    };
}

module.exports = imageParser;

},{"./CompressedImage":1}],8:[function(require,module,exports){
(function (global){
var plugin = {
    CompressedTextureManager: require('./CompressedTextureManager'),
    imageParser: require('./imageParser'),
    extensionChooser: require('./extensionChooser'),
    extensionFixer: require('./extensionFixer'),
    GLTextureMixin: require('./GLTextureMixin'),
    crn: require('./crn'),
    detectExtensions: function (renderer, resolution) {
        var extensions = [];
        if (renderer instanceof PIXI.WebGLRenderer) {
            var data = renderer.plugins.compressedTextureManager.getSupportedExtensions();
            if (data.dxt) extensions.push('.dds');
            if (data.pvrtc) extensions.push('.pvr');
            if (data.atc) extensions.push('.atc');
        } else if (renderer instanceof PIXI.CanvasRenderer) {
            //nothing special for canvas
        }
        //retina or not
        resolution = resolution || renderer.resolution;
        var res = "@"+resolution+"x";
        var ext = extensions.slice(0);
        while (ext.length > 0) {
            extensions.push(res + ext.pop());
        }
        extensions.push(res + ".png");
        extensions.push(res + ".jpg");
        //atlas support @1x @2x @.5x
        extensions.push(res + ".json");
        extensions.push(res + ".atlas");
        return extensions;
    }
};

Object.assign(PIXI.glCore.GLTexture.prototype, plugin.GLTextureMixin);

PIXI.loaders.Loader.addPixiMiddleware(plugin.extensionFixer);
PIXI.loader.use(plugin.extensionFixer());

module.exports = global.PIXI.compressedTextures = plugin;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./CompressedTextureManager":2,"./GLTextureMixin":3,"./crn":4,"./extensionChooser":5,"./extensionFixer":6,"./imageParser":7}],9:[function(require,module,exports){

},{}],10:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":11}],11:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[8])(8)
});


//# sourceMappingURL=pixi-compressed-textures.js.map
