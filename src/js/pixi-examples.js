/* Brett Meyer - Broken Pony Club */

const bpc = {};

function getParameterByName(name) {
    const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getMajorPixiVersion(pixiVersionString) {
    let majorVersion = 5;

    if (pixiVersionString.substr(0, 1) === 'v') {
        majorVersion = parseInt(pixiVersionString.substr(1, 1), 10);
    }

    return majorVersion;
}

jQuery(document).ready(($) => {
    window.onpopstate = function onpopstate(event) {
        bpc.pixiVersionString = getParameterByName('v') || 'dev';
        bpc.generateIFrameContent();

        $('.select-group .select li.selected').removeClass('selected');
        const $selected = $(`.select-group .select li[data-val="${bpc.pixiVersionString}"]`);
        $selected.addClass('selected');
        $('.select-group .select .current').text($selected.text());

        $('.main-content').animate({ scrollTop: 0 }, 200);
    };

    bpc.allowedVersions = [5];
    bpc.pixiVersionString = getParameterByName('v') || 'dev';
    bpc.majorPixiVersion = getMajorPixiVersion(bpc.pixiVersionString);

    bpc.exampleUrl = '';
    bpc.exampleFilename = '';
    bpc.exampleTitle = '';
    bpc.exampleSourceCode = '';
    bpc.exampleRequiredPlugins = [];
    bpc.exampleValidVersions = [];

    bpc.editorOptions = {
        mode: 'javascript',
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        viewportMargin: Infinity,
        lineWrapping: true,
    };

    bpc.clickType = 'click';
    bpc.animTime = 0.15;

    bpc.liteMode = false;
    bpc.packagesManifest = {};

    bpc.resize = function resize() { };

    // async script loading
    bpc.scriptsToLoad = ['https://cdnjs.cloudflare.com/ajax/libs/gsap/2.0.2/TweenMax.min.js'];
    bpc.scriptsLoaded = 0;

    bpc.loadScriptsAsync = function loadScriptsAsync() {
        for (let i = 0; i < bpc.scriptsToLoad.length; i++) {
            $.ajax({
                url: bpc.scriptsToLoad[i],
                dataType: 'script',
                cache: true,
                async: true,
                success: bpc.fileLoaded,
            });
        }

        if (bpc.scriptsToLoad.length === 0) {
            bpc.loadComplete();
        }
    };

    bpc.fileLoaded = function fileLoaded() {
        bpc.scriptsLoaded++;
        if (bpc.scriptsLoaded === bpc.scriptsToLoad.length) {
            bpc.loadComplete();
        }
    };

    bpc.loadComplete = function loadComplete() {
        $.getJSON('examples/manifest.json', (data) => {
            const sections = Object.keys(data);
            for (let i = 0; i < sections.length; i++) {
                let html = `<span class="section" data-section="${sections[i]}">${sections[i]}</span><ul data-section="${sections[i]}">`;
                const items = data[sections[i]];

                for (let j = 0; j < items.length; j++) {
                    const plugins = typeof items[j].plugins !== 'undefined' ? items[j].plugins.join(',') : '';
                    const validVersions = typeof items[j].validVersions !== 'undefined' ? items[j].validVersions.join(',') : '';
                    html += `<li data-src="${items[j].entry}" data-plugins="${plugins}" data-validVersions="${validVersions}">${items[j].title}</li>`;
                }
                html += '</ul>';

                $('.main-menu').append(html);
            }

            bpc.initNav();
        });

        $.getJSON('https://api.github.com/repos/pixijs/pixi.js/git/refs/tags', (dataTag) => {
            // Filters the tags to only include versions we care about.
            // Only use the last 5 tags per major version
            const maxTagsPerVersion = 5;
            let taggedVersions = [];
            bpc.allowedVersions.forEach((version) => {
                let filtered = dataTag.filter((tag) => tag.ref.indexOf(`refs/tags/v${version}`) === 0);
                if (filtered.length > maxTagsPerVersion) {
                    filtered = filtered.slice(-maxTagsPerVersion);
                }
                taggedVersions = taggedVersions.concat(filtered);
            });

            taggedVersions = taggedVersions.map((tag) => tag.ref.replace('refs/tags/', ''));

            for (let i = 0; i < taggedVersions.length; i++) {
                $('.select-group .select ul').append(`<li data-val="${taggedVersions[i]}">${taggedVersions[i]}</li>`);
            }

            $.getJSON('https://api.github.com/repos/pixijs/pixi.js/git/refs/heads', (dataHead) => {
                // For NEXT version development
                dataHead = dataHead.filter((tag) => tag.ref.indexOf('refs/heads/next') === 0).map((tag) => tag.ref.replace('refs/heads/', ''));

                for (let i = 0; i < dataHead.length; i++) {
                    $('.select-group .select ul').append(`<li data-val="${dataHead[i]}">${dataHead[i]}</li>`);
                }

                const $selected = $(`.select-group .select li[data-val="${bpc.pixiVersionString}"]`);
                $selected.addClass('selected');
                $('.select-group .select .current').text($selected.text());
            });
        });
    };

    bpc.initNav = function initNav() {
        if (typeof URLSearchParams !== 'undefined') {
            const params = new URLSearchParams(window.location.search);

            if (params.get('lite') === 'true') {
                $('#example-title').addClass('hidden');
                $('.main-header').addClass('hidden');
                $('.main-nav').addClass('hidden');
                $('.main-content').addClass('main-content-lite');
                $('#content-controls').addClass('hidden');

                /* eslint-disable prefer-template */
                $('.main-content').append(
                    // Icon from wikipedia!
                    // https://en.wikipedia.org/w/skins/Vector/resources/skins.vector.styles/images/external-link-ltr-icon.svg
                    `<a class="to-editor" rel="noopener noreferrer" target="_blank" href="${window.location.href.replace('lite=true', '')}">`
                        + '<img src="examples/assets/external-link-ltr-icon.svg"></img>'
                    + '</a>',
                );
                /* eslint-enable prefer-template */

                bpc.liteMode = true;
            }
        }

        $('.main-menu .section').on(bpc.clickType, function onClick() {
            $(this).next('ul').slideToggle(250);
            $(this).toggleClass('open');
        });

        $('.main-menu li').on(bpc.clickType, function onClick() {
            if (!$(this).hasClass('selected')) {
                $('.main-menu li.selected').removeClass('selected');
                $(this).addClass('selected');
                // load data
                bpc.closeMobileNav();

                const page = `/${$(this).parent().attr('data-section')}/${$(this).attr('data-src')}`;
                bpc.exampleTitle = $(this).text();

                window.location.hash = page;
                document.title = `${bpc.exampleTitle} - PixiJS Examples`;

                // Track page change in analytics
                ga('set', { page, title: bpc.exampleTitle });
                ga('send', 'pageview');

                bpc.exampleUrl = `examples/js/${$(this).parent().attr('data-section')}/${$(this).attr('data-src')}`;
                bpc.exampleFilename = $(this).attr('data-src');

                const plugins = $(this).attr('data-plugins');
                bpc.exampleRequiredPlugins = plugins === '' ? [] : plugins.split(',');

                const validVersions = $(this).attr('data-validVersions');
                bpc.exampleValidVersions = validVersions === '' ? [5] : validVersions.split(',').map((v) => parseInt(v, 10));

                $.ajax({
                    url: `examples/js/${$(this).parent().attr('data-section')}/${$(this).attr('data-src')}`,
                    dataType: 'text',
                    success(data) {
                        bpc.exampleSourceCode = data;

                        bpc.loadPackages();
                    },
                });
            }
        });

        bpc.loadPackages = function loadPackages() {
            $.getJSON('examples/packages.json', (data) => {
                bpc.packagesManifest = data;
                if (!bpc.liteMode) bpc.generateIFrameContent();
            });
        };

        bpc.generateIFrameContent = function generateIFrameContent() {
            const newPackagesManifest = bpc.packagesManifest;

            removeAllIFrames();

            $('#example').html('<iframe id="preview" src="blank.html"></iframe>');

            $('.CodeMirror').remove();
            $('.main-content #code').html(bpc.exampleSourceCode);

            // Generate HTML and insert into iFrame
            let pixiUrl = '';

            if (bpc.pixiVersionString === 'local') {
                pixiUrl = 'dist/pixi.js';
            } else { // other versions come from S3
                pixiUrl = `https://d157l7jdn8e5sf.cloudfront.net/${bpc.pixiVersionString}/pixi-legacy.js`;
            }

            let html = '<!DOCTYPE html><html><head><style>';
            html += 'body,html{margin:0px;height:100%;overflow:hidden;}canvas{width:100%;height:100%;}';
            html += '</style></head><body>';
            html += '<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>';
            html += `<script src="${pixiUrl}"></script>`;

            const exampleRequiredPluginsHTML = [];

            for (let i = 0; i < bpc.exampleRequiredPlugins.length; i++) {
                const pkgName = bpc.exampleRequiredPlugins[i];
                const pkg = newPackagesManifest[pkgName];

                // TODO: Add options to select version of extra packages
                if (pkg) {
                    const src = `${pkg.vendor || `https://cdn.jsdelivr.net/npm/${pkgName}@${pkg.version || 'latest'}/`}${pkg.script}`;

                    // New packages manifest pulls from JSDelivr
                    html += `<script src="${src}"></script>`;
                    exampleRequiredPluginsHTML.push(`<a href="${src}">${pkgName}</a>`);
                } else {
                    // Old plugins stored in this repo
                    html += `<script src="pixi-plugins/${bpc.exampleRequiredPlugins[i]}.js"></script>`;
                    exampleRequiredPluginsHTML.push(pkgName);
                }
            }

            bpc.editor = CodeMirror.fromTextArea(document.getElementById('code'), bpc.editorOptions);

            if (bpc.exampleRequiredPlugins.length) {
                $('#code-header').html(`Example Code (plugins used: ${exampleRequiredPluginsHTML.join(', ')})`);
            } else {
                $('#code-header').text('Example Code');
            }

            if (!bpc.exampleValidVersions.length || bpc.exampleValidVersions.indexOf(bpc.majorPixiVersion) > -1) {
                $('#example-title').html(bpc.exampleTitle);
                html += `<script>window.onload = function(){${bpc.exampleSourceCode}}</script></body></html>`;

                $('.example-frame').show();
            } else {
                $('#example-title').html(
                    `${bpc.exampleTitle
                    }<br><br><br><br><br><br><br>`
                    + 'The selected version of PixiJS does not work with this example.'
                    + '<br><br>'
                    + `Selected version: v${bpc.majorPixiVersion
                    }<br><br>`
                    + `Required version: v${bpc.exampleValidVersions.toString()
                    }<br><br><br><br><br>`,
                );

                $('.example-frame').hide();
            }

            const iframe = document.getElementById('preview');
            const frameDoc = iframe.contentDocument || iframe.contentWindow.document;

            frameDoc.open();
            frameDoc.write(html);
            frameDoc.close();
        };

        bpc.openMobileNav = function openMobileNav() {
            TweenMax.to('#line1', bpc.animTime, { y: 0, ease: Linear.easeNone });
            TweenMax.to('#line2', 0, { alpha: 0, ease: Linear.easeNone, delay: bpc.animTime });
            TweenMax.to('#line3', bpc.animTime, { y: 0, ease: Linear.easeNone });

            TweenMax.to('#line1', bpc.animTime, { rotation: 45, ease: Quart.easeOut, delay: bpc.animTime });
            TweenMax.to('#line3', bpc.animTime, { rotation: -45, ease: Quart.easeOut, delay: bpc.animTime });

            $('.main-nav').addClass('mobile-open');
        };

        bpc.closeMobileNav = function closeMobileNav() {
            TweenMax.to('#line1', bpc.animTime, { rotation: 0, ease: Linear.easeNone, delay: 0 });
            TweenMax.to('#line3', bpc.animTime, { rotation: 0, ease: Linear.easeNone, delay: 0 });

            TweenMax.to('#line2', 0, { alpha: 1, ease: Quart.easeOut, delay: bpc.animTime });
            TweenMax.to('#line1', bpc.animTime, { y: -8, ease: Quart.easeOut, delay: bpc.animTime });
            TweenMax.to('#line3', bpc.animTime, { y: 8, ease: Quart.easeOut, delay: bpc.animTime });

            $('.main-nav').removeClass('mobile-open');
        };

        bpc.updateMenu = function updateMenu() {
            $('.main-nav .main-menu ul li').each(function updateEachMenuItem() {
                const validVersions = $(this).attr('data-validVersions');
                const exampleValidVersions = validVersions === '' ? [5] : validVersions.split(',').map((v) => parseInt(v, 10));
                if (exampleValidVersions.indexOf(bpc.majorPixiVersion) === -1) {
                    $(this).addClass('invalid');
                } else {
                    $(this).removeClass('invalid');
                }
            });
        };

        bpc.updateMenu();

        $('.main-header .hamburger').on(bpc.clickType, (e) => {
            e.preventDefault();
            if ($('.main-nav').hasClass('mobile-open')) {
                bpc.closeMobileNav();
            } else {
                bpc.openMobileNav();
            }
            return false;
        });

        // Deep link
        if (window.location.hash !== '') {
            const hash = window.location.hash.replace('#/', '');
            const arr = hash.split('/');
            if (arr.length > 1) {
                // Deprecated categories, mesh -> mesh-and-shaders
                if (arr[0] === 'mesh') {
                    // TODO: push it in history
                    arr[0] = 'mesh-and-shaders';
                }

                if ($(`.main-menu .section[data-section="${arr[0]}"]`).length > 0) {
                    $(`.main-menu .section[data-section="${arr[0]}"]`).trigger(bpc.clickType);
                    if ($(`.main-menu .section[data-section="${arr[0]}"]`).next().find(`li[data-src="${arr[1]}"]`).length > 0) {
                        $(`.main-menu .section[data-section="${arr[0]}"]`).next().find(`li[data-src="${arr[1]}"]`).trigger(bpc.clickType);
                    }
                }
            }
        } else {
            $('.main-menu .section').eq(0).trigger(bpc.clickType);
            $('.main-menu li').eq(0).trigger(bpc.clickType);
        }

        // Version control
        $('.select-group').on(bpc.clickType, function onClick() {
            if ($(this).find('.select').hasClass('open')) {
                $(this).find('.select').removeClass('open');
                $(this).find('ul').slideUp(150);
            } else {
                $(this).find('.select').addClass('open');
                $(this).find('ul').slideDown(150);
            }
        });

        $('.select-group .select').on(bpc.clickType, 'li', function onClick() {
            if (!$(this).hasClass('selected')) {
                $('.select-group .select li.selected').removeClass('selected');
                $(this).addClass('selected');
                $('.select-group .select .current').text($(this).text());

                bpc.pixiVersionString = $(this).attr('data-val');
                bpc.majorPixiVersion = getMajorPixiVersion(bpc.pixiVersionString);
                window.history.pushState(bpc.pixiVersionString, null, `?v=${bpc.pixiVersionString}${window.location.hash}`);

                bpc.updateMenu();

                bpc.generateIFrameContent();
                $('.main-content').animate({ scrollTop: 0 }, 200);
            }
        });

        // Download
        $('.footer .download').on(bpc.clickType, () => {
            bpc.SaveToDisk(bpc.exampleUrl, bpc.exampleFilename);
        });

        // Refresh Button
        $('.reload').on(bpc.clickType, () => {
            if (bpc.editor) bpc.exampleSourceCode = bpc.editor.getValue();
            bpc.generateIFrameContent();
        });
    };

    bpc.SaveToDisk = function SaveToDisk(fileURL, fileName) {
        if (!window.ActiveXObject) { // for non-IE
            const save = document.createElement('a');
            save.href = fileURL;
            save.target = '_blank';
            save.download = fileName || 'unknown';

            const evt = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: false,
            });
            save.dispatchEvent(evt);

            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        } else if (!!window.ActiveXObject && document.execCommand) { // for IE < 11
            const newWindow = window.open(fileURL, '_blank');
            newWindow.document.close();
            newWindow.document.execCommand('SaveAs', true, fileName || fileURL);
            newWindow.close();
        }
    };

    bpc.init = function init() {
        $(window).resize(bpc.resize);

        bpc.loadScriptsAsync();
    };

    bpc.init();
});

function removeAllIFrames() {
    // Remove all iFrames and content
    const iframes = document.querySelectorAll('iframe, .frame-placeholder');
    for (let i = 0; i < iframes.length; i++) {
        iframes[i].parentNode.removeChild(iframes[i]);
    }
}
