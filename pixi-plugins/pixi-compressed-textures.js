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
            if (baseTexture.alphaMode !== undefined) {
                baseTexture.alphaMode = PIXI.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA;
            }
            else {
                baseTexture.premultiplyAlpha = false;
            }
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
                if (levels > 1 && glTexture.mipmap) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                }
                else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
            }
            else {
                if (levels > 1 && glTexture.mipmap) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                }
                else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                }
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, glTexture.wrapMode);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, glTexture.wrapMode);
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
            _image._internalLoader = this;
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
            if (!PVRTCLoader.test(arrayBuffer)) {
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
            var header = new Uint32Array(array, 0, 1)[0];
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
            var startTime = performance.now();
            var BasisFileCtr = BASISLoader.BASIS_BINDING;
            var basisFile = new BasisFileCtr(new Uint8Array(buffer));
            var width = basisFile.getImageWidth(0, 0);
            var height = basisFile.getImageHeight(0, 0);
            var levels = 1;
            var hasAlpha = basisFile.getHasAlpha();
            var dest = this._image;
            if (!basisFile.startTranscoding()) {
                throw "Transcoding error!";
            }
            var target = hasAlpha ? BASISLoader.RGBA_FORMAT : BASISLoader.RGB_FORMAT;
            console.log("Grats! BASIS will be transcoded to:", target);
            var dst = new Uint8Array(basisFile.getImageTranscodedSizeInBytes(0, 0, target.basis));
            if (!basisFile.transcodeImage(dst, 0, 0, target.basis, !!0, !!0)) {
                throw "Transcoding error!";
            }
            console.log("[BASISLoader] Totla transcoding time:", performance.now() - startTime);
            this._format = target.native;
            this._file = basisFile;
            var name = target.name.replace("COMPRESSED_", "");
            return Promise.resolve(dest.init(dest.src, dst, 'BASIS|' + name, width, height, levels, target.native));
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
    pixi_compressed_textures.defaultDetectedExtensions = ['.png', '.jpg', '.json', '.atlas'];
    function detectExtensions(renderer, resolution, defaultResolution) {
        if (defaultResolution === void 0) { defaultResolution = 1; }
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
        var ext = extensions.slice(0);
        var resolutions = [resolution || renderer.resolution];
        if (defaultResolution) {
            resolutions.push(defaultResolution);
        }
        for (var i = 0; i < resolutions.length; i++) {
            var res = "@" + resolutions[i] + "x";
            for (var j = 0; j < ext.length; j++) {
                extensions.push(res + ext[j]);
            }
            for (var j = 0; j < pixi_compressed_textures.defaultDetectedExtensions.length; j++) {
                extensions.push(res + pixi_compressed_textures.defaultDetectedExtensions[j]);
            }
        }
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
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var WorkedBASISLoader = (function (_super) {
        __extends(WorkedBASISLoader, _super);
        function WorkedBASISLoader(_image) {
            var _this = _super.call(this, _image) || this;
            _this._mips = [];
            return _this;
        }
        WorkedBASISLoader.prototype._loadAsync = function (buffer) {
            var _this = this;
            var start = performance.now();
            var pool = pixi_compressed_textures.BASISLoader.BASIS_BINDING;
            var config = {
                genMip: true,
                rgbaFormat: pixi_compressed_textures.BASISLoader.RGBA_FORMAT.basis,
                rgbFormat: pixi_compressed_textures.BASISLoader.RGB_FORMAT.basis,
                transfer: true
            };
            return pool
                .transcode(buffer, config)
                .then(function (result) {
                var width = result.width;
                var height = result.height;
                var srcBuffer = new Uint8Array(result.buffer);
                var target = result.hasAlpha ? pixi_compressed_textures.BASISLoader.RGBA_FORMAT : pixi_compressed_textures.BASISLoader.RGB_FORMAT;
                var name = target.name.replace("COMPRESSED_", "");
                var dest = _this._image;
                _this._mips = result.mipmaps;
                console.log("[WorkedBASISLoader] Total transcoding time:", performance.now() - start);
                return dest.init(dest.src, srcBuffer, 'BASIS|' + name, width, height, 1, target.native);
            });
        };
        WorkedBASISLoader.loadAndRunTranscoder = function (options) {
            return Promise.all([
                fetch(options.path + "/basis_transcoder.js").then(function (r) { return r.text(); }),
                fetch(options.path + "/basis_transcoder.wasm").then(function (w) { return w.arrayBuffer(); }),
            ]).then(function (_a) {
                var js = _a[0], wasm = _a[1];
                WorkedBASISLoader.runTranscoder(Object.assign(options, {
                    jsSource: js, wasmSource: wasm
                }));
            });
        };
        WorkedBASISLoader.runTranscoder = function (options) {
            var trans = new pixi_compressed_textures.WorkedBASIS.TranscoderWorkerPool(options.threads || 2);
            _super.bindTranscoder.call(this, trans, options.ext);
            var idx = pixi_compressed_textures.Loaders.indexOf(pixi_compressed_textures.BASISLoader);
            pixi_compressed_textures.Loaders[idx] = WorkedBASISLoader;
            return trans.init(options.jsSource, options.wasmSource);
        };
        WorkedBASISLoader.prototype.levelBufferSize = function (width, height, mip) {
            return this._mips[mip].size;
        };
        return WorkedBASISLoader;
    }(pixi_compressed_textures.BASISLoader));
    pixi_compressed_textures.WorkedBASISLoader = WorkedBASISLoader;
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var WorkedBASIS;
    (function (WorkedBASIS) {
        var BasisWorker = (function () {
            function BasisWorker() {
                this.worker = undefined;
                this.id = BasisWorker.ID++;
                this.free = false;
                this.initDone = false;
                this.binary = undefined;
                this._rej = undefined;
                this._res = undefined;
            }
            BasisWorker.prototype.init = function (basisSource, basisBinary) {
                var _this = this;
                if (basisSource === void 0) { basisSource = undefined; }
                if (basisBinary === void 0) { basisBinary = undefined; }
                if (!this.worker) {
                    this.worker = WorkedBASIS.generateWorker(basisSource);
                }
                if (!this.worker) {
                    throw "Can't create worker";
                }
                if (this.initDone) {
                    return Promise.resolve(true);
                }
                console.log("[BASIS Worker " + this.id + "] init start!");
                this.worker.addEventListener("message", this._onMessage.bind(this));
                this.worker.addEventListener("error", this._onError.bind(this));
                this.binary = basisBinary;
                var initStart = performance.now();
                return new Promise(function (res, rej) {
                    _this._rej = rej;
                    _this._res = res;
                    _this._init(basisBinary);
                }).then(function (res) {
                    console.log("[BASIS Worker " + _this.id + "] init done!", performance.now() - initStart);
                    _this.initDone = true;
                    _this.free = true;
                    _this.binary = res.buffer;
                    return true;
                });
            };
            BasisWorker.prototype.transcode = function (buffer, options) {
                var _this = this;
                if (!this.free) {
                    throw "[BASIS Worker " + this.id + "] Is busy! Check '.free' status!";
                }
                if (!buffer
                    || options.rgbaFormat === undefined
                    || options.rgbFormat === undefined) {
                    throw "Buffer and formats requred!";
                }
                var config = {
                    rgbaFormat: options.rgbaFormat,
                    rgbFormat: options.rgbFormat,
                    genMip: options.genMip || false
                };
                this.free = false;
                return new Promise(function (res, rej) {
                    _this._rej = rej;
                    _this._res = res;
                    if (options.transfer) {
                        _this.worker.postMessage({
                            type: "transcode",
                            buffer: buffer,
                            config: config
                        }, [buffer]);
                    }
                    else {
                        _this.worker.postMessage({
                            type: "transcode",
                            buffer: buffer,
                            config: config
                        });
                    }
                }).then(function (result) {
                    _this.free = true;
                    return result;
                });
            };
            BasisWorker.prototype._init = function (bin) {
                this.worker.postMessage({
                    type: "init", id: 0, wasmBinary: bin
                }, [bin]);
            };
            BasisWorker.prototype._onMessage = function (event) {
                if (event.data.type === "error") {
                    this._onError(event.data.error);
                }
                if (this._res) {
                    this._res(event.data);
                }
            };
            BasisWorker.prototype._onError = function (reason) {
                if (this._rej) {
                    this._rej(reason);
                }
            };
            BasisWorker.prototype.destroy = function () {
                this.worker.terminate();
            };
            BasisWorker.ID = 0;
            return BasisWorker;
        }());
        WorkedBASIS.BasisWorker = BasisWorker;
        var TranscoderWorkerPool = (function () {
            function TranscoderWorkerPool(count) {
                if (count === void 0) { count = 0; }
                this.workers = [];
                this.count = 1;
                this.count = count || 1;
            }
            TranscoderWorkerPool.prototype.init = function (jsSource, wasmSource) {
                var _this = this;
                var count = 0;
                var next = function () {
                    if (++count > _this.count) {
                        return;
                    }
                    var w = new BasisWorker();
                    _this.workers.push(w);
                    return w.init(jsSource, wasmSource).then(function () {
                        wasmSource = w.binary;
                        next();
                    });
                };
                return next().then(function () {
                    return _this;
                });
            };
            TranscoderWorkerPool.prototype.transcode = function (buffer, options) {
                if (!this.workers || !this.workers.length) {
                    throw "[TranscoderWorkerPool] Pool empty, populate before!";
                }
                var workers = this.workers;
                var freeWorker = undefined;
                var iteration = 0;
                var search = function (doneCallback) {
                    for (var _i = 0, workers_1 = workers; _i < workers_1.length; _i++) {
                        var w = workers_1[_i];
                        if (w.free) {
                            freeWorker = w;
                            break;
                        }
                    }
                    if (iteration > 100) {
                        throw "[TranscoderWorkerPool] Can't found free worker after 100 interation!";
                    }
                    if (!freeWorker) {
                        setTimeout(function () { return search(doneCallback); }, 10 * iteration);
                    }
                    else {
                        doneCallback(freeWorker);
                    }
                    iteration++;
                };
                return new Promise(search).then(function (worker) {
                    console.log("[TranscoderWorkerPool] run transcoding on " + worker.id + " worker");
                    return worker.transcode(buffer, options);
                });
            };
            TranscoderWorkerPool.prototype.destroy = function () {
                this.workers.forEach(function (w) {
                    w.destroy();
                });
                this.workers = undefined;
            };
            return TranscoderWorkerPool;
        }());
        WorkedBASIS.TranscoderWorkerPool = TranscoderWorkerPool;
    })(WorkedBASIS = pixi_compressed_textures.WorkedBASIS || (pixi_compressed_textures.WorkedBASIS = {}));
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
var pixi_compressed_textures;
(function (pixi_compressed_textures) {
    var WorkedBASIS;
    (function (WorkedBASIS) {
        WorkedBASIS.basisWorkerSource = function () {
            var _BasisFile;
            function init(message) {
                var bin = message.wasmBinary;
                __init(bin).then(function () {
                    self.postMessage({ type: "init", status: true, buffer: bin }, [bin]);
                });
            }
            function transcode(message) {
                try {
                    var res = __transcode(message.buffer, message.config);
                    Object.assign(res, {
                        type: 'transcode',
                    });
                    self.postMessage(res, [res.buffer.buffer]);
                }
                catch (error) {
                    console.error(error);
                    self.postMessage({ type: 'error', id: message.id, error: error.message });
                }
            }
            onmessage = function (e) {
                var message = e.data;
                var func = self[message.type];
                if (func) {
                    func(message);
                }
            };
            function __init(wasmBinary) {
                var Module;
                return new Promise(function (resolve) {
                    Module = { wasmBinary: wasmBinary, onRuntimeInitialized: resolve };
                    return BASIS(Module);
                }).then(function () {
                    var BasisFile = Module.BasisFile, initializeBasis = Module.initializeBasis;
                    _BasisFile = BasisFile;
                    initializeBasis();
                });
            }
            function __transcode(buffer, config) {
                var basisFile = new _BasisFile(new Uint8Array(buffer));
                var width = basisFile.getImageWidth(0, 0);
                var height = basisFile.getImageHeight(0, 0);
                var levels = config.genMip ? basisFile.getNumLevels(0) : 1;
                var hasAlpha = basisFile.getHasAlpha();
                var cleanup = function () {
                    basisFile.close();
                    basisFile.delete();
                };
                if (!width || !height || !levels) {
                    cleanup();
                    throw 'Invalid .basis file';
                }
                if (!basisFile.startTranscoding()) {
                    cleanup();
                    throw '.startTranscoding failed';
                }
                var totalSize = 0;
                var offset = 0;
                var targetBuffer = undefined;
                var mipmaps = [];
                var target = hasAlpha ? config.rgbaFormat : config.rgbFormat;
                for (var mip = 0; mip < levels; mip++) {
                    var mipWidth = basisFile.getImageWidth(0, mip);
                    var mipHeight = basisFile.getImageHeight(0, mip);
                    var size = basisFile.getImageTranscodedSizeInBytes(0, mip, target);
                    totalSize += size;
                    mipmaps.push({ width: mipWidth, height: mipHeight, format: target, size: size });
                }
                targetBuffer = new Uint8Array(totalSize);
                for (var mip = 0; mip < levels; mip++) {
                    var size = mipmaps[mip].size;
                    var dst = new Uint8Array(targetBuffer.buffer, offset, size);
                    var status_1 = basisFile.transcodeImage(dst, 0, mip, target, 0, 0);
                    if (!status_1) {
                        cleanup();
                        throw '.transcodeImage failed.';
                    }
                    offset += size;
                }
                cleanup();
                return { width: width, height: height, hasAlpha: hasAlpha, mipmaps: mipmaps, buffer: targetBuffer };
            }
        };
        function generateWorker(basisJSSource) {
            var source = WorkedBASIS.basisWorkerSource.toString();
            var b0 = source.indexOf("{");
            var b1 = source.lastIndexOf("}");
            source = basisJSSource + "\n" + source.substring(b0 + 1, b1);
            return new Worker(URL.createObjectURL(new Blob([source])));
        }
        WorkedBASIS.generateWorker = generateWorker;
    })(WorkedBASIS = pixi_compressed_textures.WorkedBASIS || (pixi_compressed_textures.WorkedBASIS = {}));
})(pixi_compressed_textures || (pixi_compressed_textures = {}));
//# sourceMappingURL=pixi-compressed-textures.js.map