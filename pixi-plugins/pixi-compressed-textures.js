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
        CompressedImage.prototype.init = function (src, data, type, width, height, levels, internalFormat) {
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
            var levels = this.levels;
            var width = this.width;
            var height = this.height;
            var offset = 0;
            for (var i = 0; i < levels; ++i) {
                var levelSize = this._internalLoader.levelBufferSize(width, height, i);
                var dxtLevel = new Uint8Array(this.data.buffer, this.data.byteOffset + offset, levelSize);
                gl.compressedTexImage2D(gl.TEXTURE_2D, i, this.internalFormat, width, height, 0, dxtLevel);
                width = width >> 1;
                if (width < 1) {
                    width = 1;
                }
                height = height >> 1;
                if (height < 1) {
                    height = 1;
                }
                offset += levelSize;
            }
            this._internalLoader.free();
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
            var loaders = pixi_compressed_textures.Loaders;
            if (!loaders || !loaders.length) {
                throw "Registered compressed loaders is missing. Call `TextureSystem.initCompressed` before loading!";
            }
            var selectedLoaderCtr = undefined;
            for (var _i = 0, loaders_1 = loaders; _i < loaders_1.length; _i++) {
                var loader = loaders_1[_i];
                if (!crnLoad) {
                    if (loader.test(arrayBuffer)) {
                        selectedLoaderCtr = loader;
                        break;
                    }
                }
                else {
                    if (loader.type === "CRN") {
                        selectedLoaderCtr = loader;
                        break;
                    }
                }
            }
            if (selectedLoaderCtr) {
                this._internalLoader = new selectedLoaderCtr(this);
                return this._internalLoader.load(arrayBuffer);
            }
            else {
                throw new Error("Compressed texture format is not recognized: " + this.src);
            }
        };
        return CompressedImage;
    }(PIXI.resources.Resource));
    pixi_compressed_textures.CompressedImage = CompressedImage;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var AbstractInternalLoader = (function () {
        function AbstractInternalLoader(_image) {
            if (_image === void 0) { _image = new pixi_compressed_textures.CompressedImage("unknown"); }
            this._image = _image;
            this._format = 0;
        }
        AbstractInternalLoader.prototype.free = function () { };
        ;
        AbstractInternalLoader.test = function (arrayBuffer) {
            return false;
        };
        AbstractInternalLoader.type = "ABSTRACT";
        return AbstractInternalLoader;
    }());
    pixi_compressed_textures.AbstractInternalLoader = AbstractInternalLoader;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var _a;
    var ASTC_HEADER_LENGTH = 16;
    var ASTC_HEADER_DIM_X = 4;
    var ASTC_HEADER_DIM_Y = 5;
    var ASTC_HEADER_WIDTH = 7;
    var ASTC_HEADER_HEIGHT = 10;
    var ASTC_MAGIC = 0x5CA1AB13;
    var COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;
    var COMPRESSED_RGBA_ASTC_5x4_KHR = 0x93B1;
    var COMPRESSED_RGBA_ASTC_5x5_KHR = 0x93B2;
    var COMPRESSED_RGBA_ASTC_6x5_KHR = 0x93B3;
    var COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4;
    var COMPRESSED_RGBA_ASTC_8x5_KHR = 0x93B5;
    var COMPRESSED_RGBA_ASTC_8x6_KHR = 0x93B6;
    var COMPRESSED_RGBA_ASTC_8x8_KHR = 0x93B7;
    var COMPRESSED_RGBA_ASTC_10x5_KHR = 0x93B8;
    var COMPRESSED_RGBA_ASTC_10x6_KHR = 0x93B9;
    var COMPRESSED_RGBA_ASTC_10x8_KHR = 0x93BA;
    var COMPRESSED_RGBA_ASTC_10x10_KHR = 0x93BB;
    var COMPRESSED_RGBA_ASTC_12x10_KHR = 0x93BC;
    var COMPRESSED_RGBA_ASTC_12x12_KHR = 0x93BD;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 0x93D0;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 0x93D1;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 0x93D2;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 0x93D3;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 0x93D4;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 0x93D5;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 0x93D6;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 0x93D7;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 0x93D8;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 0x93D9;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 0x93DA;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 0x93DB;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 0x93DC;
    var COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 0x93DD;
    var ASTC_DIMS_TO_FORMAT = (_a = {},
        _a[4 * 4] = 0,
        _a[5 * 4] = 1,
        _a[5 * 5] = 2,
        _a[6 * 5] = 3,
        _a[6 * 6] = 4,
        _a[8 * 5] = 5,
        _a[8 * 6] = 6,
        _a[8 * 8] = 7,
        _a[10 * 5] = 8,
        _a[10 * 6] = 9,
        _a[10 * 8] = 10,
        _a[10 * 10] = 11,
        _a[12 * 10] = 12,
        _a[12 * 12] = 13,
        _a);
    var ASTCLoader = (function (_super) {
        __extends(ASTCLoader, _super);
        function ASTCLoader(_image, useSRGB) {
            if (useSRGB === void 0) { useSRGB = false; }
            var _this = _super.call(this, _image) || this;
            _this.useSRGB = useSRGB;
            _this._blockSize = { x: 0, y: 0 };
            return _this;
        }
        ASTCLoader.prototype.load = function (buffer) {
            if (!ASTCLoader.test(buffer)) {
                throw "Invalid magic number in ASTC header";
            }
            var header = new Uint8Array(buffer, 0, ASTC_HEADER_LENGTH);
            var dim_x = header[ASTC_HEADER_DIM_X];
            var dim_y = header[ASTC_HEADER_DIM_Y];
            var width = (header[ASTC_HEADER_WIDTH]) + (header[ASTC_HEADER_WIDTH + 1] << 8) + (header[ASTC_HEADER_WIDTH + 2] << 16);
            var height = (header[ASTC_HEADER_HEIGHT]) + (header[ASTC_HEADER_HEIGHT + 1] << 8) + (header[ASTC_HEADER_HEIGHT + 2] << 16);
            var internalFormat = ASTC_DIMS_TO_FORMAT[dim_x * dim_y] + (this.useSRGB ? COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : COMPRESSED_RGBA_ASTC_4x4_KHR);
            var astcData = new Uint8Array(buffer, ASTC_HEADER_LENGTH);
            this._format = internalFormat;
            this._blockSize.x = dim_x;
            this._blockSize.y = dim_y;
            var dest = this._image;
            dest.init(dest.src, astcData, 'ASTC', width, height, 1, internalFormat);
            return dest;
        };
        ASTCLoader.test = function (buffer) {
            var magic = new Int32Array(buffer, 0, 1);
            return magic[0] === ASTC_MAGIC;
        };
        ASTCLoader.prototype.levelBufferSize = function (width, height, mipLevel) {
            if (mipLevel === void 0) { mipLevel = 0; }
            var f_ = Math.floor;
            var dim_x = this._blockSize.x;
            var dim_y = this._blockSize.y;
            return (f_((width + dim_x - 1) / dim_x) * f_((height + dim_y - 1) / dim_y)) << 4;
        };
        ASTCLoader.type = "ASTC";
        return ASTCLoader;
    }(pixi_compressed_textures.AbstractInternalLoader));
    pixi_compressed_textures.ASTCLoader = ASTCLoader;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
function fourCCToInt32(value) {
    return value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24);
}
function int32ToFourCC(value) {
    return String.fromCharCode(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff);
}
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var _a;
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
    var COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
    var COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
    var COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
    var COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
    var COMPRESSED_RGB_ATC_WEBGL = 0x8C92;
    var COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 0x8C93;
    var COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 0x87EE;
    var FOURCC_TO_FORMAT = (_a = {},
        _a[FOURCC_DXT1] = COMPRESSED_RGB_S3TC_DXT1_EXT,
        _a[FOURCC_DXT3] = COMPRESSED_RGBA_S3TC_DXT3_EXT,
        _a[FOURCC_DXT5] = COMPRESSED_RGBA_S3TC_DXT5_EXT,
        _a[FOURCC_ATC] = COMPRESSED_RGB_ATC_WEBGL,
        _a[FOURCC_ATCA] = COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL,
        _a[FOURCC_ATCI] = COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL,
        _a);
    var DDSLoader = (function (_super) {
        __extends(DDSLoader, _super);
        function DDSLoader(_image) {
            return _super.call(this, _image) || this;
        }
        DDSLoader.prototype.load = function (arrayBuffer) {
            if (!DDSLoader.test(arrayBuffer)) {
                throw "Invalid magic number in DDS header";
            }
            var header = new Int32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);
            if (!(header[DDS_HEADER_PF_FLAGS] & DDPF_FOURCC))
                throw "Unsupported format, must contain a FourCC code";
            var fourCC = header[DDS_HEADER_PF_FOURCC];
            var internalFormat = FOURCC_TO_FORMAT[fourCC] || -1;
            if (internalFormat < 0) {
                throw "Unsupported FourCC code: " + int32ToFourCC(fourCC);
            }
            var levels = 1;
            if (header[DDS_HEADER_FLAGS] & DDSD_MIPMAPCOUNT) {
                levels = Math.max(1, header[DDS_HEADER_MIPMAPCOUNT]);
            }
            var width = header[DDS_HEADER_WIDTH];
            var height = header[DDS_HEADER_HEIGHT];
            var dataOffset = header[DDS_HEADER_SIZE] + 4;
            var dxtData = new Uint8Array(arrayBuffer, dataOffset);
            var dest = this._image;
            this._format = internalFormat;
            dest.init(dest.src, dxtData, 'DDS', width, height, levels, internalFormat);
            return dest;
        };
        DDSLoader.test = function (buffer) {
            var magic = new Int32Array(buffer, 0, 1);
            return magic[0] === DDS_MAGIC;
        };
        DDSLoader.prototype.levelBufferSize = function (width, height, mipLevel) {
            if (mipLevel === void 0) { mipLevel = 0; }
            switch (this._format) {
                case COMPRESSED_RGB_S3TC_DXT1_EXT:
                case COMPRESSED_RGB_ATC_WEBGL:
                    return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;
                case COMPRESSED_RGBA_S3TC_DXT3_EXT:
                case COMPRESSED_RGBA_S3TC_DXT5_EXT:
                case COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL:
                case COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL:
                    return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;
                default:
                    return 0;
            }
        };
        DDSLoader.type = "DDS";
        return DDSLoader;
    }(pixi_compressed_textures.AbstractInternalLoader));
    pixi_compressed_textures.DDSLoader = DDSLoader;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var _a;
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
    var PVR_TO_FORMAT = (_a = {},
        _a[PVR_FORMAT_2BPP_RGB] = COMPRESSED_RGB_PVRTC_2BPPV1_IMG,
        _a[PVR_FORMAT_2BPP_RGBA] = COMPRESSED_RGBA_PVRTC_2BPPV1_IMG,
        _a[PVR_FORMAT_4BPP_RGB] = COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
        _a[PVR_FORMAT_4BPP_RGBA] = COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
        _a[PVR_FORMAT_ETC1] = COMPRESSED_RGB_ETC1_WEBGL,
        _a[PVR_FORMAT_DXT1] = COMPRESSED_RGB_S3TC_DXT1_EXT,
        _a[PVR_FORMAT_DXT3] = COMPRESSED_RGBA_S3TC_DXT3_EXT,
        _a[PVR_FORMAT_DXT5] = COMPRESSED_RGBA_S3TC_DXT5_EXT,
        _a);
    var PVRTCLoader = (function (_super) {
        __extends(PVRTCLoader, _super);
        function PVRTCLoader(_image) {
            return _super.call(this, _image) || this;
        }
        PVRTCLoader.prototype.load = function (arrayBuffer) {
            if (!pixi_compressed_textures.DDSLoader.test(arrayBuffer)) {
                throw "Invalid magic number in PVR header";
            }
            var header = new Int32Array(arrayBuffer, 0, PVR_HEADER_LENGTH);
            var format = header[PVR_HEADER_FORMAT];
            var internalFormat = PVR_TO_FORMAT[format] || -1;
            var width = header[PVR_HEADER_WIDTH];
            var height = header[PVR_HEADER_HEIGHT];
            var levels = header[PVR_HEADER_MIPMAPCOUNT];
            var dataOffset = header[PVR_HEADER_METADATA] + 52;
            var pvrtcData = new Uint8Array(arrayBuffer, dataOffset);
            var dest = this._image;
            this._format = internalFormat;
            dest.init(dest.src, pvrtcData, 'PVR', width, height, levels, internalFormat);
            return dest;
        };
        PVRTCLoader.test = function (buffer) {
            var magic = new Int32Array(buffer, 0, 1);
            return magic[0] === PVR_MAGIC;
        };
        PVRTCLoader.prototype.levelBufferSize = function (width, height, mipLevel) {
            if (mipLevel === void 0) { mipLevel = 0; }
            switch (this._format) {
                case COMPRESSED_RGB_S3TC_DXT1_EXT:
                case COMPRESSED_RGB_ETC1_WEBGL:
                    return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;
                case COMPRESSED_RGBA_S3TC_DXT3_EXT:
                case COMPRESSED_RGBA_S3TC_DXT5_EXT:
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
        };
        PVRTCLoader.type = "PVR";
        return PVRTCLoader;
    }(pixi_compressed_textures.AbstractInternalLoader));
    pixi_compressed_textures.PVRTCLoader = PVRTCLoader;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var _a, _b;
    var BASIS_FORMAT = {
        cTFETC1: 0,
        cTFBC1: 2,
        cTFBC3: 3,
        cTFPVRTC1_4_RGB: 8,
        cTFPVRTC1_4_RGBA: 9,
        cTFASTC_4x4: 10,
        cTFRGBA32: 11
    };
    var BASIS_HAS_ALPHA = (_a = {},
        _a[3] = true,
        _a[9] = true,
        _a[10] = true,
        _a[11] = true,
        _a);
    var NON_COMPRESSED = -1;
    var COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;
    var COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
    var COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
    var COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
    var COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
    var COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
    var COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
    var COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;
    var BASIS_TO_FMT = (_b = {},
        _b[BASIS_FORMAT.cTFRGBA32] = NON_COMPRESSED,
        _b[BASIS_FORMAT.cTFETC1] = COMPRESSED_RGB_ETC1_WEBGL,
        _b[BASIS_FORMAT.cTFBC1] = COMPRESSED_RGB_S3TC_DXT1_EXT,
        _b[BASIS_FORMAT.cTFBC3] = COMPRESSED_RGBA_S3TC_DXT5_EXT,
        _b[BASIS_FORMAT.cTFPVRTC1_4_RGB] = COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
        _b[BASIS_FORMAT.cTFPVRTC1_4_RGBA] = COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
        _b[BASIS_FORMAT.cTFASTC_4x4] = COMPRESSED_RGBA_ASTC_4x4_KHR,
        _b);
    var FMT_TO_BASIS = Object.keys(BASIS_TO_FMT).reduce(function (acc, next) {
        acc[BASIS_TO_FMT[+next]] = +next;
        return acc;
    }, {});
    var BASISLoader = (function (_super) {
        __extends(BASISLoader, _super);
        function BASISLoader(_image) {
            var _this = _super.call(this, _image) || this;
            _this.type = "BASIS";
            _this._file = undefined;
            return _this;
        }
        BASISLoader.test = function (array) {
            var header = new Uint32Array(array)[0];
            var decoder = !!BASISLoader.BASIS_BINDING;
            var isValid = header === 0x134273 && decoder;
            var isSupported = BASISLoader.RGB_FORMAT && BASISLoader.RGBA_FORMAT;
            if (!isValid && isSupported) {
                console.warn("[BASIS LOADER] Is Supported, but transcoder not binded or file is not BASIS file!");
            }
            return (isSupported && isValid);
        };
        BASISLoader.bindTranscoder = function (fileCtr, ext) {
            if (!fileCtr || !ext) {
                throw "Invalid state! undef fileCtr or ext invalid!";
            }
            ;
            var plain = Object.keys(ext)
                .reduce(function (acc, key) {
                var val = ext[key];
                if (!val) {
                    return acc;
                }
                ;
                return Object.assign(acc, val.__proto__);
            }, {});
            var latestOp = undefined;
            var lastestAlpha = undefined;
            for (var v in plain) {
                var native = plain[v];
                if (FMT_TO_BASIS[native] !== undefined) {
                    var basis = FMT_TO_BASIS[native];
                    if (BASIS_HAS_ALPHA[basis]) {
                        lastestAlpha = {
                            native: native, name: v, basis: basis
                        };
                    }
                    else {
                        latestOp = {
                            native: native, name: v, basis: basis
                        };
                    }
                }
            }
            BASISLoader.RGB_FORMAT = latestOp || lastestAlpha;
            BASISLoader.RGBA_FORMAT = lastestAlpha || latestOp;
            BASISLoader.BASIS_BINDING = fileCtr;
            console.log("[BASISLoader] Supported formats:", "\nRGB:" + BASISLoader.RGB_FORMAT.name + "\nRGBA:" + BASISLoader.RGBA_FORMAT.name);
            pixi_compressed_textures.RegisterCompressedLoader(BASISLoader);
            pixi_compressed_textures.RegisterCompressedExtensions('basis');
        };
        BASISLoader.prototype.load = function (buffer) {
            if (!BASISLoader.test(buffer)) {
                throw "BASIS Transcoder not binded or transcoding not supported =(!";
            }
            this._loadAsync(buffer);
            return this._image;
        };
        BASISLoader.prototype._loadAsync = function (buffer) {
            return __awaiter(this, void 0, void 0, function () {
                var startTime, BasisFileCtr, basisFile, width, height, levels, hasAlpha, dest, target, dst, _a, name;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            startTime = performance.now();
                            BasisFileCtr = BASISLoader.BASIS_BINDING;
                            basisFile = new BasisFileCtr(new Uint8Array(buffer));
                            return [4, basisFile.getImageWidth(0, 0)];
                        case 1:
                            width = _b.sent();
                            return [4, basisFile.getImageHeight(0, 0)];
                        case 2:
                            height = _b.sent();
                            levels = 1;
                            return [4, basisFile.getHasAlpha()];
                        case 3:
                            hasAlpha = _b.sent();
                            dest = this._image;
                            return [4, basisFile.startTranscoding()];
                        case 4:
                            if (!(_b.sent())) {
                                throw "Transcoding error!";
                            }
                            target = hasAlpha ? BASISLoader.RGBA_FORMAT : BASISLoader.RGB_FORMAT;
                            console.log("Grats! BASIS will be transcoded to:", target);
                            _a = Uint8Array.bind;
                            return [4, basisFile.getImageTranscodedSizeInBytes(0, 0, target.basis)];
                        case 5:
                            dst = new (_a.apply(Uint8Array, [void 0, _b.sent()]))();
                            return [4, basisFile.transcodeImage(dst, 0, 0, target.basis, !!0, !!0)];
                        case 6:
                            if (!(_b.sent())) {
                                throw "Transcoding error!";
                            }
                            console.log("[BASISLoader] Totla transcoding time:", performance.now() - startTime);
                            this._format = target.native;
                            this._file = basisFile;
                            name = target.name.replace("COMPRESSED_", "");
                            return [2, dest.init(dest.src, dst, 'BASIS|' + name, width, height, levels, target.native)];
                    }
                });
            });
        };
        BASISLoader.prototype.levelBufferSize = function (width, height, level) {
            return this._file ? this._file.getImageTranscodedSizeInBytes(0, level, FMT_TO_BASIS[this._format]) : undefined;
        };
        BASISLoader.BASIS_BINDING = undefined;
        return BASISLoader;
    }(pixi_compressed_textures.AbstractInternalLoader));
    pixi_compressed_textures.BASISLoader = BASISLoader;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var CRN_Module = window.CRN_Module;
    function arrayBufferCopy(src, dst, dstByteOffset, numBytes) {
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
    }
    var COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
    var COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
    var COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
    var DXT_FORMAT_MAP = [
        COMPRESSED_RGB_S3TC_DXT1_EXT,
        COMPRESSED_RGBA_S3TC_DXT3_EXT,
        COMPRESSED_RGBA_S3TC_DXT5_EXT
    ];
    var CRNLoader = (function (_super) {
        __extends(CRNLoader, _super);
        function CRNLoader(_image) {
            return _super.call(this, _image) || this;
        }
        CRNLoader.prototype.load = function (arrayBuffer) {
            var srcSize = arrayBuffer.byteLength;
            var bytes = new Uint8Array(arrayBuffer);
            var src = CRN_Module._malloc(srcSize);
            arrayBufferCopy(bytes, CRN_Module.HEAPU8, src, srcSize);
            var width = CRN_Module._crn_get_width(src, srcSize);
            var height = CRN_Module._crn_get_height(src, srcSize);
            var levels = CRN_Module._crn_get_levels(src, srcSize);
            var format = CRN_Module._crn_get_dxt_format(src, srcSize);
            var dstSize = CRN_Module._crn_get_uncompressed_size(src, srcSize, 0);
            var dst = CRN_Module._malloc(dstSize);
            CRN_Module._crn_decompress(src, srcSize, dst, dstSize, 0);
            var dxtData = new Uint8Array(CRN_Module.HEAPU8.buffer, dst, dstSize);
            var internalFormat = DXT_FORMAT_MAP[format];
            var dest = this._image;
            this._format = internalFormat;
            this._caches = [src, dst];
            return dest.init(dest.src, dxtData, 'CRN', width, height, levels, internalFormat);
        };
        CRNLoader.prototype.levelBufferSize = function (width, height, mipLevel) {
            if (mipLevel === void 0) { mipLevel = 0; }
            return pixi_compressed_textures.DDSLoader.prototype.levelBufferSize.call(this, width, height, mipLevel);
        };
        CRNLoader.prototype.free = function () {
            CRN_Module._free(this._caches[0]);
            CRN_Module._free(this._caches[1]);
        };
        CRNLoader.test = function (buffer) {
            return !!CRN_Module;
        };
        CRNLoader.type = "CRN";
        return CRNLoader;
    }(pixi_compressed_textures.AbstractInternalLoader));
    pixi_compressed_textures.CRNLoader = CRNLoader;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    pixi_compressed_textures.Loaders = [
        pixi_compressed_textures.DDSLoader,
        pixi_compressed_textures.PVRTCLoader,
        pixi_compressed_textures.ASTCLoader,
        pixi_compressed_textures.CRNLoader
    ];
    PIXI.systems.TextureSystem.prototype.initCompressed = function () {
        var gl = this.gl;
        if (!this.compressedExtensions) {
            this.compressedExtensions = {
                dxt: gl.getExtension("WEBGL_compressed_texture_s3tc"),
                pvrtc: (gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc")),
                astc: gl.getExtension("WEBGL_compressed_texture_astc"),
                atc: gl.getExtension("WEBGL_compressed_texture_atc"),
                etc1: gl.getExtension("WEBGL_compressed_texture_etc1")
            };
            this.compressedExtensions.crn = this.compressedExtensions.dxt;
        }
    };
    function RegisterCompressedLoader() {
        var loaders = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            loaders[_i] = arguments[_i];
        }
        pixi_compressed_textures.Loaders = pixi_compressed_textures.Loaders || [];
        for (var e in loaders) {
            if (pixi_compressed_textures.Loaders.indexOf(loaders[e]) < 0) {
                pixi_compressed_textures.Loaders.push(loaders[e]);
            }
        }
    }
    pixi_compressed_textures.RegisterCompressedLoader = RegisterCompressedLoader;
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
    pixi_compressed_textures.TEXTURE_EXTENSIONS = [];
    function RegisterCompressedExtensions() {
        var exts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            exts[_i] = arguments[_i];
        }
        for (var e in exts) {
            if (pixi_compressed_textures.TEXTURE_EXTENSIONS.indexOf(exts[e]) < 0) {
                pixi_compressed_textures.TEXTURE_EXTENSIONS.push(exts[e]);
                Resource.setExtensionXhrType(exts[e], Resource.XHR_RESPONSE_TYPE.BUFFER);
            }
        }
    }
    pixi_compressed_textures.RegisterCompressedExtensions = RegisterCompressedExtensions;
    var ImageParser = (function () {
        function ImageParser() {
        }
        ImageParser.use = function (resource, next) {
            var url = resource.url;
            var idx = url.lastIndexOf('.');
            var amper = url.lastIndexOf('?');
            var ext = url.substring(idx + 1, amper > 0 ? amper : url.length);
            if (pixi_compressed_textures.TEXTURE_EXTENSIONS.indexOf(ext) < 0) {
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
            resource.compressedImage.loadFromArrayBuffer(resource.data, ext === 'crn');
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
    RegisterCompressedExtensions('dds', 'crn', 'pvr', 'etc1', 'astc');
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
                    if (k >= 4 && url.substring(k - 3, 3) === '@1x') {
                        resource._baseUrl = url.substring(0, k);
                    }
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