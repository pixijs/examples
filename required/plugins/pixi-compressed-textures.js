(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var compressedTextures = {
    CompressedTextureManager: require('./CompressedTextureManager.js'),
    imageParser: require('./imageParser.js'),
    extensionChooser: require('./extensionChooser.js'),
    extensionFixer: require('./extensionFixer.js'),
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

PIXI.loaders.Loader.addPixiMiddleware(compressedTextures.extensionFixer);
PIXI.loader.use(compressedTextures.extensionFixer());

module.exports = global.PIXI.compressedTextures = compressedTextures;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./CompressedTextureManager.js":3,"./extensionChooser.js":4,"./extensionFixer.js":5,"./imageParser.js":6}],2:[function(require,module,exports){
function CompressedImage(src, data, type, width, height, levels, internalFormat) {
    CompressedImage.prototype.init.apply(this, arguments);
};

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
    if (this.data == null) {
        throw "Trying to create a second (or more) webgl texture from the same CompressedImage : " + this.src;
        return;
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
 * Charge une image compressée depuis un array buffer
 * @param arrayBuffer : le buffer à partir duquel charger l'image
 * @return la CompressedImage chargée
 */
CompressedImage.loadFromArrayBuffer = function (arrayBuffer, src) {
    return new CompressedImage(src).loadFromArrayBuffer(arrayBuffer);
};

CompressedImage.prototype.loadFromArrayBuffer = function(arrayBuffer) {
    var entete = new Uint8Array(arrayBuffer, 0, 3);

    //todo: implement onload

    if (entete[0] == "DDS".charCodeAt(0) && entete[1] == "DDS".charCodeAt(1) && entete[2] == "DDS".charCodeAt(2))
        return this._loadDDS(arrayBuffer);
    else if (entete[0] == "PVR".charCodeAt(0) && entete[1] == "PVR".charCodeAt(1) && entete[2] == "PVR".charCodeAt(2))
        return this._loadPVR(arrayBuffer);
    else
        throw "Compressed texture format is not recognized: " + src;
    return this;
}

/**
 * Charge une image compressГ©e au format DDS depuis un array buffer
 * @param arrayBuffer : le buffer Г  partir duquel charger l'image
 * @return la CompressedImage chargГ©e
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
 * Charge une image compressГ©e au format PVR depuis un array buffer
 * @param arrayBuffer : le buffer Г  partir duquel charger l'image
 * @return la CompressedImage chargГ©e
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

},{}],3:[function(require,module,exports){
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
    }
};

CompressedTextureManager.prototype.updateTexture = function (texture, removeSource) {
    var source = texture.source;
    if (!(source instanceof CompressedImage)) {
        throw "Not a compressed image";
    }
    var renderer = this.renderer;
    var gl = this.renderer.gl;
    if (!source.complete) {
        throw "CompressedImage wasnt loaded yet. Check if you have `loader.before(PIXI.compressedTextures.imageParser())` thing";
    }
    if (!texture._glTextures[gl.id]) {
        texture._glTextures[gl.id] = gl.createTexture();
        texture.on('dispose', renderer.destroyTexture, renderer);
    }
    gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultipliedAlpha);
    source.generateWebGLTexture(gl, !removeSource);
};

CompressedTextureManager.prototype.updateAllCompressedTextures = function (resources, removeSource) {
    for (var key in resources) {
        var resource = resources[key];
        if (resource.isCompressedImage) {
            this.updateTexture(resource.texture, removeSource);
        }
    }
};

CompressedTextureManager.prototype.updateAllTextures = function (resources, removeSource) {
    for (var key in resources) {
        var resource = resources[key];
        if (resource.isCompressedImage) {
            this.updateTexture(resource.texture.baseTexture, removeSource);
        } else if (resource.isImage) {
            this.renderer.updateTexture(resource.texture.baseTexture);
        }
    }
};
},{"./CompressedImage":2}],4:[function(require,module,exports){
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

},{"./imageParser":6}],5:[function(require,module,exports){
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
    }
}

module.exports = textureExtensionFixer;

},{"./CompressedImage":2}],6:[function(require,module,exports){
var core = PIXI,
    utils = core.utils,
    CompressedImage = require('./CompressedImage'),
    Resource = core.loaders.Resource;

Resource.setExtensionXhrType('dds', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('pvr', Resource.XHR_RESPONSE_TYPE.BUFFER);

function imageParser() {
    return function (resource, next) {
        if (resource.url.indexOf('.dds') != -1 || resource.url.indexOf('.pvr') != -1) {
            var compressedImage = resource.compressedImage || new CompressedImage(resource.url);
            if (resource.data) {
                throw "compressedImageParser middleware must be specified in loader.before() and must have zero resource.data";
            }
            resource.isCompressedImage = true;
            resource.data = compressedImage;
            resource.once('complete', function() {
                resource.isImage = true;
                compressedImage.loadFromArrayBuffer(resource.data);
                resource.data = compressedImage;
            });
        }
        next();
    }
}

module.exports = imageParser;

},{"./CompressedImage":2}]},{},[1])


//# sourceMappingURL=pixi-compressed-textures.js.map
