var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
    var COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01;
    var COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
    var COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03;
    var COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;
    var PVR_FORMAT_2BPP_RGB = 0;
    var PVR_FORMAT_2BPP_RGBA = 1;
    var PVR_FORMAT_4BPP_RGB = 2;
    var PVR_FORMAT_4BPP_RGBA = 3;
    var PVR_FORMAT_ETC1 = 6;
    var PVR_FORMAT_DXT1 = 7;
    var PVR_FORMAT_DXT3 = 9;
    var PVR_FORMAT_DXT5 = 5;
    var PVR_HEADER_LENGTH = 13;
    var PVR_MAGIC = 0x03525650;
    var PVR_HEADER_MAGIC = 0;
    var PVR_HEADER_FORMAT = 2;
    var PVR_HEADER_HEIGHT = 6;
    var PVR_HEADER_WIDTH = 7;
    var PVR_HEADER_MIPMAPCOUNT = 11;
    var PVR_HEADER_METADATA = 12;
    var COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
    var COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
    var COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
    var COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
    var COMPRESSED_RGB_ATC_WEBGL = 0x8C92;
    var COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 0x8C93;
    var COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 0x87EE;
    var DDS_MAGIC = 0x20534444;
    var DDSD_MIPMAPCOUNT = 0x20000;
    var DDPF_FOURCC = 0x4;
    var DDS_HEADER_LENGTH = 31;
    var DDS_HEADER_MAGIC = 0;
    var DDS_HEADER_SIZE = 1;
    var DDS_HEADER_FLAGS = 2;
    var DDS_HEADER_HEIGHT = 3;
    var DDS_HEADER_WIDTH = 4;
    var DDS_HEADER_MIPMAPCOUNT = 7;
    var DDS_HEADER_PF_FLAGS = 20;
    var DDS_HEADER_PF_FOURCC = 21;
    var FOURCC_DXT1 = fourCCToInt32("DXT1");
    var FOURCC_DXT3 = fourCCToInt32("DXT3");
    var FOURCC_DXT5 = fourCCToInt32("DXT5");
    var FOURCC_ATC = fourCCToInt32("ATC ");
    var FOURCC_ATCA = fourCCToInt32("ATCA");
    var FOURCC_ATCI = fourCCToInt32("ATCI");
    function fourCCToInt32(value) {
        return value.charCodeAt(0) +
            (value.charCodeAt(1) << 8) +
            (value.charCodeAt(2) << 16) +
            (value.charCodeAt(3) << 24);
    }
    function int32ToFourCC(value) {
        return String.fromCharCode(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff);
    }
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
    function loadFromArrayBuffer(arrayBuffer, src, crnLoad) {
        return new CompressedImage(src).loadFromArrayBuffer(arrayBuffer, crnLoad);
    }
    pixi_compressed_textures.loadFromArrayBuffer = loadFromArrayBuffer;
    var CompressedImage = (function (_super) {
        __extends(CompressedImage, _super);
        function CompressedImage(src, data, type, width, height, levels, internalFormat) {
            var _this = _super.call(this) || this;
            _this.complete = false;
            _this.isCompressedImage = true;
            _this.preserveSource = true;
            _this.onload = null;
            _this.baseTexture = null;
            _this.init(src, data, type, width, height, levels, internalFormat);
            return _this;
        }
        CompressedImage.prototype.init = function (src, data, type, width, height, levels, internalFormat, crunchCache) {
            if (width === void 0) { width = -1; }
            if (height === void 0) { height = -1; }
            this.src = src;
            this.resize(width, height);
            this._width = width;
            this._height = height;
            this.data = data;
            this.type = type;
            this.levels = levels;
            this.internalFormat = internalFormat;
            this.crunch = crunchCache;
            var oldComplete = this.complete;
            this.complete = !!data;
            if (!oldComplete && this.complete && this.onload) {
                this.onload({ target: this });
            }
            this.update();
            return this;
        };
        CompressedImage.prototype.dispose = function () {
            this.data = null;
        };
        CompressedImage.prototype.bind = function (baseTexture) {
            baseTexture.premultiplyAlpha = false;
            _super.prototype.bind.call(this, baseTexture);
        };
        CompressedImage.prototype.upload = function (renderer, baseTexture, glTexture) {
            var gl = renderer.state.gl;
            glTexture.compressed = false;
            renderer.texture.initCompressed();
            if (this.data === null) {
                throw "Trying to create a second (or more) webgl texture from the same CompressedImage : " + this.src;
            }
            var width = this.width;
            var height = this.height;
            var levels = this.levels;
            var offset = 0;
            for (var i = 0; i < this.levels; ++i) {
                var levelSize = textureLevelSize(this.internalFormat, width, height);
                var dxtLevel = new Uint8Array(this.data.buffer, this.data.byteOffset + offset, levelSize);
                gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, width, height, 0, dxtLevel);
                width = width >> 1;
                if (width < 1)
                    width = 1;
                height = height >> 1;
                if (height < 1)
                    height = 1;
                offset += levelSize;
            }
            if (this.crunch) {
                CRN_Module._free(this.crunch[0]);
                CRN_Module._free(this.crunch[1]);
            }
            if (!this.preserveSource)
                this.data = null;
            return true;
        };
        CompressedImage.prototype.style = function (renderer, baseTexture, glTexture) {
            var gl = renderer.state.gl;
            var levels = this.levels;
            if (baseTexture.scaleMode === PIXI.SCALE_MODES.LINEAR) {
                if (levels > 1) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                }
                else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
            }
            else {
                if (levels > 1) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                }
                else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                }
            }
            return true;
        };
        CompressedImage.prototype.loadFromArrayBuffer = function (arrayBuffer, crnLoad) {
            var head = new Uint8Array(arrayBuffer, 0, 3);
            if (head[0] == "DDS".charCodeAt(0) && head[1] == "DDS".charCodeAt(1) && head[2] == "DDS".charCodeAt(2))
                return this._loadDDS(arrayBuffer);
            else if (head[0] == "PVR".charCodeAt(0) && head[1] == "PVR".charCodeAt(1) && head[2] == "PVR".charCodeAt(2))
                return this._loadPVR(arrayBuffer);
            else if (crnLoad)
                return this._loadCRN(arrayBuffer);
            else
                throw new Error("Compressed texture format is not recognized: " + this.src);
        };
        CompressedImage.prototype.arrayBufferCopy = function (src, dst, dstByteOffset, numBytes) {
            var dst32Offset = dstByteOffset / 4;
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
        CompressedImage.prototype._loadCRN = function (arrayBuffer) {
            var DXT_FORMAT_MAP = [
                COMPRESSED_RGB_S3TC_DXT1_EXT,
                COMPRESSED_RGBA_S3TC_DXT3_EXT,
                COMPRESSED_RGBA_S3TC_DXT5_EXT
            ];
            var srcSize = arrayBuffer.byteLength;
            var bytes = new Uint8Array(arrayBuffer);
            var src = CRN_Module._malloc(srcSize);
            CompressedImage.prototype.arrayBufferCopy(bytes, CRN_Module.HEAPU8, src, srcSize);
            var perfTime = performance.now();
            var width = CRN_Module._crn_get_width(src, srcSize);
            var height = CRN_Module._crn_get_height(src, srcSize);
            var levels = CRN_Module._crn_get_levels(src, srcSize);
            var format = CRN_Module._crn_get_dxt_format(src, srcSize);
            var dstSize = CRN_Module._crn_get_uncompressed_size(src, srcSize, 0);
            var dst = CRN_Module._malloc(dstSize);
            CRN_Module._crn_decompress(src, srcSize, dst, dstSize, 0);
            var dxtData = new Uint8Array(CRN_Module.HEAPU8.buffer, dst, dstSize);
            perfTime = performance.now() - perfTime;
            return this.init(this.src, dxtData, 'CRN', width, height, levels, DXT_FORMAT_MAP[format], [src, dst]);
        };
        CompressedImage.prototype._loadDDS = function (arrayBuffer) {
            var header = new Int32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);
            if (header[DDS_HEADER_MAGIC] != DDS_MAGIC)
                throw "Invalid magic number in DDS header";
            if (!(header[DDS_HEADER_PF_FLAGS] & DDPF_FOURCC))
                throw "Unsupported format, must contain a FourCC code";
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
                    throw new Error("Unsupported FourCC code: " + int32ToFourCC(fourCC));
            }
            var levels = 1;
            if (header[DDS_HEADER_FLAGS] & DDSD_MIPMAPCOUNT) {
                levels = Math.max(1, header[DDS_HEADER_MIPMAPCOUNT]);
            }
            var width = header[DDS_HEADER_WIDTH];
            var height = header[DDS_HEADER_HEIGHT];
            var dataOffset = header[DDS_HEADER_SIZE] + 4;
            var dxtData = new Uint8Array(arrayBuffer, dataOffset);
            return this.init(this.src, dxtData, 'DDS', width, height, levels, internalFormat);
        };
        CompressedImage.prototype._loadPVR = function (arrayBuffer) {
            var header = new Int32Array(arrayBuffer, 0, PVR_HEADER_LENGTH);
            if (header[PVR_HEADER_MAGIC] != PVR_MAGIC)
                throw "Invalid magic number in PVR header";
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
                    throw new Error("Unsupported PVR format: " + format);
            }
            var width = header[PVR_HEADER_WIDTH];
            var height = header[PVR_HEADER_HEIGHT];
            var levels = header[PVR_HEADER_MIPMAPCOUNT];
            var dataOffset = header[PVR_HEADER_METADATA] + 52;
            var pvrtcData = new Uint8Array(arrayBuffer, dataOffset);
            return this.init(this.src, pvrtcData, 'PVR', width, height, levels, internalFormat);
        };
        return CompressedImage;
    }(PIXI.resources.Resource));
    pixi_compressed_textures.CompressedImage = CompressedImage;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    PIXI.systems.TextureSystem.prototype.initCompressed = function () {
        var gl = this.gl;
        if (!this.compressedExtensions) {
            this.compressedExtensions = {
                dxt: gl.getExtension("WEBGL_compressed_texture_s3tc"),
                pvrtc: gl.getExtension("WEBGL_compressed_texture_pvrtc"),
                astc: gl.getExtension("WEBGL_compressed_texture_astc"),
                atc: gl.getExtension("WEBGL_compressed_texture_atc"),
                etc1: gl.getExtension("WEBGL_compressed_texture_etc1")
            };
            this.compressedExtensions.crn = this.compressedExtensions.dxt;
        }
    };
    function detectExtensions(renderer, resolution) {
        var extensions = [];
        if (renderer instanceof PIXI.Renderer) {
            renderer.texture.initCompressed();
            var data = renderer.texture.compressedExtensions;
            if (data.dxt)
                extensions.push('.dds');
            if (data.pvrtc)
                extensions.push('.pvr');
            if (data.atc)
                extensions.push('.atc');
            if (data.astc)
                extensions.push('.astc');
            if (data.etc1)
                extensions.push('.etc1');
        }
        resolution = resolution || renderer.resolution;
        var res = "@" + resolution + "x";
        var ext = extensions.slice(0);
        while (ext.length > 0) {
            extensions.push(res + ext.pop());
        }
        extensions.push(res + ".png");
        extensions.push(res + ".jpg");
        extensions.push(res + ".json");
        extensions.push(res + ".atlas");
        return extensions;
    }
    pixi_compressed_textures.detectExtensions = detectExtensions;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var Resource = PIXI.LoaderResource;
    Resource.setExtensionXhrType('dds', Resource.XHR_RESPONSE_TYPE.BUFFER);
    Resource.setExtensionXhrType('crn', Resource.XHR_RESPONSE_TYPE.BUFFER);
    Resource.setExtensionXhrType('pvr', Resource.XHR_RESPONSE_TYPE.BUFFER);
    Resource.setExtensionXhrType('etc1', Resource.XHR_RESPONSE_TYPE.BUFFER);
    Resource.setExtensionXhrType('astc', Resource.XHR_RESPONSE_TYPE.BUFFER);
    var ImageParser = (function () {
        function ImageParser() {
        }
        ImageParser.use = function (resource, next) {
            if (resource.url.indexOf('.crn') < 0 && resource.url.indexOf('.dds') < 0
                && resource.url.indexOf('.pvr') < 0 && resource.url.indexOf('.etc1') < 0
                && resource.url.indexOf('.astc') < 0) {
                next();
                return;
            }
            if (!resource.data) {
                throw new Error("compressedImageParser middleware for PixiJS v5 must be specified in loader.use()" +
                    " and must have resource.data when completed");
            }
            if (resource.compressedImage) {
                next();
                return;
            }
            resource.compressedImage = new pixi_compressed_textures.CompressedImage(resource.url);
            resource.compressedImage.loadFromArrayBuffer(resource.data, resource.url.indexOf(".crn") >= 0);
            resource.isCompressedImage = true;
            resource.texture = fromResource(resource.compressedImage, resource.url, resource.name);
            next();
        };
        return ImageParser;
    }());
    pixi_compressed_textures.ImageParser = ImageParser;
    function fromResource(resource, imageUrl, name) {
        var baseTexture = new PIXI.BaseTexture(resource, {
            scaleMode: PIXI.settings.SCALE_MODE,
            resolution: PIXI.utils.getResolutionOfUrl(imageUrl),
        });
        var texture = new PIXI.Texture(baseTexture);
        if (!name) {
            name = imageUrl;
        }
        PIXI.BaseTexture.addToCache(texture.baseTexture, name);
        PIXI.Texture.addToCache(texture, name);
        if (name !== imageUrl) {
            PIXI.BaseTexture.addToCache(texture.baseTexture, imageUrl);
            PIXI.Texture.addToCache(texture, imageUrl);
        }
        return texture;
    }
    PIXI.Loader.registerPlugin(ImageParser);
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    function extensionChooser(supportedExtensions) {
        if (supportedExtensions === void 0) { supportedExtensions = []; }
        return function (resource, next) {
            var ext = resource.metadata.choice;
            if (!ext) {
                return next();
            }
            var url = resource.url;
            var k = 0;
            if (!resource._defaultUrlChoice) {
                resource._defaultUrlChoice = url;
                k = url.lastIndexOf(".");
                if (k >= 0) {
                    resource._baseUrl = url.substring(0, k);
                }
                else {
                    return next();
                }
            }
            for (var i = ext.length - 1; i >= 0; i--) {
                url = resource._baseUrl + ext[i];
                var isSupported = false;
                for (var j = 0; j < supportedExtensions.length; j++) {
                    if (ext[i] === supportedExtensions[j]) {
                        resource.url = url;
                        var pureExt = ext[i];
                        if (pureExt.indexOf('@') > -1) {
                            pureExt = pureExt.replace(/@[0-9.]*x/, "");
                        }
                        k = pureExt.indexOf('.');
                        if (k >= 0) {
                            pureExt = pureExt.substring(k + 1);
                        }
                        resource.extension = pureExt;
                        resource.loadType = resource._determineLoadType();
                        next();
                        return;
                    }
                }
            }
            next();
        };
    }
    pixi_compressed_textures.extensionChooser = extensionChooser;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var ExtensionFixer = (function () {
        function ExtensionFixer() {
        }
        ExtensionFixer.use = function (resource, next) {
            if (resource.texture && resource._defaultUrlChoice && resource._defaultUrl !== resource.url) {
                var texture = resource.texture;
                var baseTexture = texture.baseTexture;
                var oldUrl = resource.url;
                var newUrl = resource._defaultUrlChoice;
                var ind = baseTexture.textureCacheIds.indexOf(oldUrl);
                if (ind >= 0) {
                    baseTexture.textureCacheIds[ind] = newUrl;
                    delete PIXI.utils.BaseTextureCache[resource.url];
                    PIXI.utils.BaseTextureCache[newUrl] = baseTexture;
                }
                ind = texture.textureCacheIds.indexOf(oldUrl);
                if (ind >= 0) {
                    texture.textureCacheIds[ind] = newUrl;
                    delete PIXI.utils.TextureCache[resource.url];
                    PIXI.utils.TextureCache[newUrl] = baseTexture;
                }
            }
            next();
        };
        return ExtensionFixer;
    }());
    pixi_compressed_textures.ExtensionFixer = ExtensionFixer;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    PIXI.compressedTextures = pixi_compressed_textures;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
//# sourceMappingURL=pixi-compressed-textures.js.map