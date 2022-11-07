/* eslint-disable */
 
/*!
 * pixi-webfont-loader - v1.0.2
 * Compiled Fri, 13 Aug 2021 19:36:11 UTC
 *
 * pixi-webfont-loader is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2021, Milton Candelero <miltoncandelero@gmail.com>, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/loaders')) :
	typeof define === 'function' && define.amd ? define(['exports', '@pixi/loaders'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pixi_webfont_loader = {}, global.PIXI));
}(this, (function (exports, loaders) { 'use strict';

	function parseRule(css)
	{
	    const tokenizer = /\s*([a-z\-]+)\s*:\s*((?:[^;]*url\(.*?\)[^;]*|[^;]*)*)\s*(?:;|$)/gi;
	    const obj = {};
	    let token;

	    while ((token = tokenizer.exec(css)))
	    {
	        obj[token[1].toLowerCase()] = token[2];
	    }

	    return obj;
	}

	function stringifyRule(style)
	{
	    let text = '';
	    const keys = Object.keys(style).sort();

	    for (let i = 0; i < keys.length; i++)
	    {
	        text += ` ${keys[i]}: ${style[keys[i]] };`;
	    }

	    return text.substring(1);
	}

	/**	Parse a CSS StyleSheet into an Array of homebrew CSSStyleRule objects,
	*	each having normalized `selectorText` and `style` properties.
	*	Hardcore regex stolen from: https://jsfiddle.net/developit/vzkckrw4/
	*/
	function parseCss(text)
	{
	    const tokenizer = /([\s\S]+?)\{([\s\S]*?)\}/gi;
	    const rules = [];
	    let rule;
	    let token;

	    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
	    while ((token = tokenizer.exec(text)))
	    {
	        const style = parseRule(token[2].trim());

	        style.cssText = stringifyRule(style);
	        rule = {
	            selectorText: token[1].trim().replace(/\s*\,\s*/, ', '),
	            style,
	            cssText: '',
	        };
	        rule.cssText = `${rule.selectorText} { ${rule.style.cssText } }`;
	        rules.push(rule);
	    }

	    return rules;
	}

	function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
	class WebfontLoaderPlugin 
	{
	    /**
	     * Unsuported formats:
	     * EOT => Internet explorer only. Deprecated. We use promises, we don't support IE anyway.
	     * SVG => Safari only. Deprecated. Spec removed from SVG 2.0. Support being removed from browsers.
	     */
	     static  __initStatic() {this.supportedFontExtensions = ['ttf', 'otf', 'woff', 'woff2'];}

	    static add(..._params)
	    {
	        if (!document.fonts || !FontFace || !Promise)
	        {
	            throw new Error(
	                'WebfontLoaderPlugin relies heavily on Promises and the FontFace API and your browser doesn\'t support them.'
	            );
	        }

	        loaders.LoaderResource.setExtensionLoadType('css', loaders.LoaderResource.LOAD_TYPE.XHR);
	        loaders.LoaderResource.setExtensionXhrType('css', loaders.LoaderResource.XHR_RESPONSE_TYPE.TEXT);

	        loaders.LoaderResource.setExtensionLoadType('ttf', loaders.LoaderResource.LOAD_TYPE.XHR);
	        loaders.LoaderResource.setExtensionXhrType('ttf', loaders.LoaderResource.XHR_RESPONSE_TYPE.BUFFER);

	        for (const ext of WebfontLoaderPlugin.supportedFontExtensions)
	        {
	            loaders.LoaderResource.setExtensionLoadType(ext, loaders.LoaderResource.LOAD_TYPE.XHR);
	            loaders.LoaderResource.setExtensionXhrType(ext, loaders.LoaderResource.XHR_RESPONSE_TYPE.BUFFER);
	        }
	    }

	    static use(resource, next)
	    {
	        if (resource.extension.endsWith('css') || resource.extension.endsWith('css2'))
	        {
	            // this promise _shouldnt_ reject but just to be sure, finally;
	            WebfontLoaderPlugin.loadFromCSS(resource).finally(() => next());

	            return;
	        }

	        if (WebfontLoaderPlugin.supportedFontExtensions.some((ext) => resource.extension.endsWith(ext)))
	        {
	            // this promise _shouldnt_ reject but just to be sure, finally;
	            WebfontLoaderPlugin.loadFromBuffer(resource).finally(() => next());

	            return;
	        }

	        // fallback, it wasn't for us
	        next();
	    }

	    /**
	     * Overwriteable function in case you want to implement your own waiter
	     * (e.g: FontFaceObserver)
	     */
	     static __initStatic2() {this.waitFont = async (
	        fontDescriptor,
	        testString,
	        timeout) =>
	    {
	        const fontStyle = _nullishCoalesce(fontDescriptor['font-style'], () => ( ''));
	        const fontWeight = _nullishCoalesce(fontDescriptor['font-weight'], () => ( ''));
	        const fontStretch = _nullishCoalesce(fontDescriptor['font-stretch'], () => ( ''));
	        const fontFamily = fontDescriptor['font-family'];

	        timeout = timeout || Infinity; // timeout=0 -> wait forever
	        let now = new Date().getTime();
	        const backThen = now;
	        const mergedFontStyle = [fontStyle, fontWeight, fontStretch, '100px', fontFamily].join(' ');
	        let loadedFonts = 0;

	        do
	        {
	            loadedFonts = (await document.fonts.load(mergedFontStyle, testString)).length;
	            if (loadedFonts > 0)
	            {
	                // Font loaded!
	                return;
	            }

	            // sleep for a while or the browser can't load the fonts!
	            await new Promise((resolve) => setTimeout(resolve, 16));

	            now = new Date().getTime();
	        } while (now - backThen < timeout);

	        // We timed out! :(
	        console.warn(`Error loading font! Your font ${fontDescriptor['font-family']} timed out after ${timeout}ms`);
	    };}

	     static loadFromCSS(resource) 
	    {
	        const newLink = document.createElement('link');

	        newLink.rel = 'stylesheet';
	        newLink.type = 'text/css';
	        newLink.href = resource.url;

	        // append to head
	        document.head.appendChild(newLink);

	        // parse the css
	        const allFonts = parseCss(resource.data);

	        // make the outputs
	        const promiseArr = [];
	        const fontDefinitionArr = [];

	        const testString = _optionalChain([resource, 'access', _ => _.metadata, 'optionalAccess', _2 => _2.font, 'optionalAccess', _3 => _3.testString]);
	        const timeout = _nullishCoalesce(_optionalChain([resource, 'access', _4 => _4.metadata, 'optionalAccess', _5 => _5.font, 'optionalAccess', _6 => _6.timeout]), () => ( resource.timeout));

	        for (const font of allFonts)
	        {
	            if (typeof font.style['font-family'] === 'string')
	            {
	                // add watchface promises
	                promiseArr.push(
	                    WebfontLoaderPlugin.waitFont(font.style, testString, timeout)
	                );

	                // make the loaded font data for later user reference
	                fontDefinitionArr.push({
	                    fontFamily: font.style['font-family'].replace(/['|"]/gi, ''),
	                    fontStyle: font.style['font-style'],
	                    fontWeight: font.style['font-weight'],
	                    // fontStretch: font.style["font-stretch"], //pixi doesn't know this
	                });
	            }
	        }

	        // store the fonts that we loaded
	        resource.styles = fontDefinitionArr;

	        // wait for all fonts to be ready
	        // use finally because loaders in pixi ALWAYS end. Even on catastrophic failures.
	        return Promise.all(promiseArr);
	    }

	     static loadFromBuffer(resource) 
	    {
	        // If you don't specify a family name the resource name is used
	        const fontFamily = _nullishCoalesce(_optionalChain([resource, 'access', _7 => _7.metadata, 'optionalAccess', _8 => _8.font, 'optionalAccess', _9 => _9.family]), () => ( resource.name));

	        // Add it to the document
	        document.fonts.add(new FontFace(fontFamily, resource.data, _optionalChain([resource, 'access', _10 => _10.metadata, 'optionalAccess', _11 => _11.font])));

	        // Add the style descriptor (I don't think nobody ever used this...)
	        resource.styles = [{
	            fontFamily: fontFamily.replace(/['|"]/gi, ''),
	            fontStyle: _optionalChain([resource, 'access', _12 => _12.metadata, 'optionalAccess', _13 => _13.font, 'optionalAccess', _14 => _14.style]),
	            fontWeight: _optionalChain([resource, 'access', _15 => _15.metadata, 'optionalAccess', _16 => _16.font, 'optionalAccess', _17 => _17.weight]),
	            // fontStretch: font.style["font-stretch"], //pixi doesn't know this
	        } ];

	        // Usually this resolves instantly because we had the buffer in resource.data
	        return WebfontLoaderPlugin.waitFont(
	            {
	                'font-family': fontFamily,
	                'font-stretch': _optionalChain([resource, 'access', _18 => _18.metadata, 'optionalAccess', _19 => _19.font, 'optionalAccess', _20 => _20.stretch]),
	                'font-style': _optionalChain([resource, 'access', _21 => _21.metadata, 'optionalAccess', _22 => _22.font, 'optionalAccess', _23 => _23.style]),
	                'font-weight': _optionalChain([resource, 'access', _24 => _24.metadata, 'optionalAccess', _25 => _25.font, 'optionalAccess', _26 => _26.weight])
	            },
	            _optionalChain([resource, 'access', _27 => _27.metadata, 'optionalAccess', _28 => _28.font, 'optionalAccess', _29 => _29.testString]), _nullishCoalesce(_optionalChain([resource, 'access', _30 => _30.metadata, 'optionalAccess', _31 => _31.font, 'optionalAccess', _32 => _32.timeout]), () => ( resource.timeout)));
	    }
	} WebfontLoaderPlugin.__initStatic(); WebfontLoaderPlugin.__initStatic2();

	exports.WebfontLoaderPlugin = WebfontLoaderPlugin;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof pixi_webfont_loader !== 'undefined') { Object.assign(this.PIXI, pixi_webfont_loader); }
