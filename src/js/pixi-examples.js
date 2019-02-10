/* Brett Meyer - Broken Pony Club */

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getMajorPixiVersion(pixiVersionString) {
    var majorVersion = 5;

    if (pixiVersionString.substr(0, 1) === 'v') {
        majorVersion = parseInt(pixiVersionString.substr(1, 1), 10);
    } else {
        if (pixiVersionString === 'release') {
            majorVersion = 4;
        }
    }

    return majorVersion
}

jQuery(document).ready(function($) {
    window.onpopstate = function(event) {
        bpc.pixiVersionString = getParameterByName('v') || 'release';
        bpc.generateIFrameContent();

        $('.select-group .select li.selected').removeClass('selected');
        var $selected = $('.select-group .select li[data-val="' + bpc.pixiVersionString + '"]');
        $selected.addClass('selected');
        $('.select-group .select .current').text($selected.text());

        $('.main-content').animate({ scrollTop: 0 }, 200);
    };

    var bpc = bpc || {};

    bpc.pixiVersionString = getParameterByName('v') || 'release';
    bpc.majorPixiVersion = getMajorPixiVersion(bpc.pixiVersionString);

    bpc.exampleUrl = '';
    bpc.exampleFilename = '';
    bpc.exampleSourceCode = '';
    bpc.exampleRequiredPlugins = [];
    bpc.exampleInvalidVersions = [];

    bpc.editorOptions = {
        mode: 'javascript',
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        viewportMargin: Infinity,
        lineWrapping: true
    };

    bpc.clickType = Modernizr.touchevents ? 'tap' : 'click';
    bpc.animTime = 0.15;

    bpc.resize = function() {};

    // async script loading
    bpc.scriptsToLoad = ['https://cdnjs.cloudflare.com/ajax/libs/gsap/2.0.2/TweenMax.min.js'];
    bpc.scriptsLoaded = 0;

    if (bpc.clickType === 'tap') {
        bpc.scriptsToLoad.push('vendor/jquery.mobile.custom.min.js');
    }

    bpc.loadScriptsAsync = function() {
        for (var i = 0; i < bpc.scriptsToLoad.length; i++) {
            $.ajax({
                url: bpc.scriptsToLoad[i],
                dataType: 'script',
                cache: true,
                async: true,
                success: bpc.fileLoaded
            });
        }

        if (bpc.scriptsToLoad.length === 0) {
            bpc.loadComplete();
        }
    };

    bpc.fileLoaded = function() {
        bpc.scriptsLoaded++;
        if (bpc.scriptsLoaded === bpc.scriptsToLoad.length) {
            bpc.loadComplete();
        }
    };

    bpc.loadComplete = function() {
        $.getJSON('examples/manifest.json', function(data) {
            var sections = Object.keys(data);
            for (var i = 0; i < sections.length; i++) {
                var html = '<span class="section" data-section="' + sections[i] + '">' + sections[i] + '</span><ul data-section="' + sections[i] + '">',
                    items = data[sections[i]];

                for (var j = 0; j < items.length; j++) {
                    var plugins = typeof items[j].plugins !== 'undefined' ? items[j].plugins.join(',') : '';
                    var invalidVersions = typeof items[j].invalidVersions !== 'undefined' ? items[j].invalidVersions.join(',') : '';
                    html += '<li data-src="' + items[j].entry + '" data-plugins="' + plugins  + '" data-invalidVersions="' + invalidVersions + '">' + items[j].title + '</li>';
                }
                html += '</ul>';

                $('.main-menu').append(html);
            }

            bpc.initNav();
        });

        $.getJSON('https://api.github.com/repos/pixijs/pixi.js/git/refs/tags', function(data) {
            // filters the tags to only include v3 and above
            data = data.filter(function(tag) {
                return tag.ref.indexOf('refs/tags/v3.0.11') === 0 ||
                    tag.ref.indexOf('refs/tags/v4') === 0;
            }).map(function(tag) {
                return tag.ref.replace('refs/tags/', '');
            });

            for (var i = 0; i < data.length; i++) {
                $('.select-group .select ul').append('<li data-val="' + data[i] + '">' + data[i] + '</li>');
            }

            $.getJSON('https://api.github.com/repos/pixijs/pixi.js/git/refs/heads', function(data) {
                // For pixi-v5 NEXT development
                var data = data.filter(function(tag) {
                    return tag.ref.indexOf('refs/heads/next') == 0;
                }).map(function(tag) {
                    return tag.ref.replace('refs/heads/', '');
                });

                for (var i = 0; i < data.length; i++) {
                    $('.select-group .select ul').append('<li data-val="' + data[i] + '">' + data[i] + '</li>');
                }

                var $selected = $('.select-group .select li[data-val="' + bpc.pixiVersionString + '"]');
                $selected.addClass('selected');
                $('.select-group .select .current').text($selected.text())
            });

        });
    };

    bpc.initNav = function() {
        $('.main-menu .section').on(bpc.clickType, function() {
            $(this).next('ul').slideToggle(250);
            $(this).toggleClass('open');
        });

        $('.main-menu li').on(bpc.clickType, function() {
            if (!$(this).hasClass('selected')) {
                $('.main-menu li.selected').removeClass('selected');
                $(this).addClass('selected');
                // load data
                bpc.closeMobileNav();
                $('.main-content h1').text($(this).text());
                var page = '/' + $(this).parent().attr('data-section') + '/' + $(this).attr('data-src');
                var title = $(this).text();

                window.location.hash = page;
                document.title = title + ' - PixiJS Examples';

                // Track page change in analytics
                ga('set', { page: page, title: title });
                ga('send', 'pageview');

                bpc.exampleUrl = 'examples/js/' + $(this).parent().attr('data-section') + '/' + $(this).attr('data-src');
                bpc.exampleFilename = $(this).attr('data-src');

                var plugins = $(this).attr('data-plugins');
                bpc.exampleRequiredPlugins = plugins === '' ? [] : plugins.split(',');

                var invalidVersions = $(this).attr('data-invalidVersions');
                bpc.exampleInvalidVersions = invalidVersions === '' ? [] : invalidVersions.split(',').map(function(v) {return parseInt(v, 10)});

                $.ajax({
                    url: 'examples/js/' + $(this).parent().attr('data-section') + '/' + $(this).attr('data-src'),
                    dataType: "text",
                    success: function(data) {
                        bpc.exampleSourceCode = data;

                        bpc.generateIFrameContent();
                    }
                });
            }
        });

        bpc.generateIFrameContent = function() {
            // Remove all iFrames and content
            var iframes = document.querySelectorAll('iframe');
            for (var i = 0; i < iframes.length; i++) {
                iframes[i].parentNode.removeChild(iframes[i]);
            }
            $('#example').html('<iframe id="preview" src="blank.html"></iframe>');

            // Generate HTML and insert into iFrame
            var exampleJS = bpc.exampleSourceCode;
            var pixiUrl = '';

            if (bpc.pixiVersionString === 'local') {
                pixiUrl = "dist/pixi.js"
            } else if (bpc.majorPixiVersion === 3) { // pull v3 from github cdn
                pixiUrl = 'https://cdn.rawgit.com/GoodBoyDigital/pixi.js/' + bpc.pixiVersionString + '/bin/pixi.js';
            } else { // other versions come from S3
                pixiUrl = 'https://d157l7jdn8e5sf.cloudfront.net/' + bpc.pixiVersionString + '/pixi.js';
            }

            var html = '<!DOCTYPE html><html><head><style>body,html{margin:0px;height:100%;overflow:hidden;}canvas{width:100%;height:100%;}</style></head><body>';
            html += '<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>';
            html += '<script src="' + pixiUrl + '"></script>';

            if (bpc.majorPixiVersion < 5) {
                html += '<script src="pixi-plugins/pixi-legacy.js"></script>';
            }

            for (i = 0; i < bpc.exampleRequiredPlugins.length; i++) {
                html += '<script src="pixi-plugins/' + bpc.exampleRequiredPlugins[i] + '.js"></script>';
            }

            if (bpc.exampleInvalidVersions.indexOf(bpc.majorPixiVersion) === -1) {
                html += '<script>window.onload = function(){' + exampleJS + '}</script></body></html>';
            }

            $('.CodeMirror').remove();
            $('.main-content #code').html(bpc.exampleSourceCode);

            if (bpc.exampleInvalidVersions.indexOf(bpc.majorPixiVersion) === -1) {
                bpc.editor = CodeMirror.fromTextArea(document.getElementById('code'), bpc.editorOptions);

                if (bpc.exampleRequiredPlugins.length) {
                    $('#code-header').text("Example Code (plugins used: " + bpc.exampleRequiredPlugins.toString() + ")");
                } else {
                    $('#code-header').text("Example Code");
                }

                $('.example-frame').show();
            } else {
                $('#code-header').text("Example does not work on this version of PixiJS");
                $('.example-frame').hide();
            }

            var iframe = document.getElementById('preview');
            var frameDoc = iframe.contentDocument || iframe.contentWindow.document;

            frameDoc.open();
            frameDoc.write(html);
            frameDoc.close();
        };

        bpc.openMobileNav = function() {
            TweenMax.to('#line1', bpc.animTime, { y: 0, ease: Linear.easeNone });
            TweenMax.to('#line2', 0, { alpha: 0, ease: Linear.easeNone, delay: bpc.animTime });
            TweenMax.to('#line3', bpc.animTime, { y: 0, ease: Linear.easeNone });

            TweenMax.to('#line1', bpc.animTime, { rotation: 45, ease: Quart.easeOut, delay: bpc.animTime });
            TweenMax.to('#line3', bpc.animTime, { rotation: -45, ease: Quart.easeOut, delay: bpc.animTime });

            $('.main-nav').addClass('mobile-open');
        };

        bpc.closeMobileNav = function() {
            TweenMax.to('#line1', bpc.animTime, { rotation: 0, ease: Linear.easeNone, delay: 0 });
            TweenMax.to('#line3', bpc.animTime, { rotation: 0, ease: Linear.easeNone, delay: 0 });

            TweenMax.to('#line2', 0, { alpha: 1, ease: Quart.easeOut, delay: bpc.animTime });
            TweenMax.to('#line1', bpc.animTime, { y: -8, ease: Quart.easeOut, delay: bpc.animTime });
            TweenMax.to('#line3', bpc.animTime, { y: 8, ease: Quart.easeOut, delay: bpc.animTime });

            $('.main-nav').removeClass('mobile-open');
        };

        $('.main-header .hamburger').on(bpc.clickType, function(e) {
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
            var hash = window.location.hash.replace('#/', '');
            var arr = hash.split('/');
            if (arr.length > 1) {
                if ($('.main-menu .section[data-section="' + arr[0] + '"]').length > 0) {
                    $('.main-menu .section[data-section="' + arr[0] + '"]').trigger(bpc.clickType);
                    if ($('.main-menu .section[data-section="' + arr[0] + '"]').next().find('li[data-src="' + arr[1] + '"]').length > 0) {
                        $('.main-menu .section[data-section="' + arr[0] + '"]').next().find('li[data-src="' + arr[1] + '"]').trigger(bpc.clickType);
                    }
                }
            }
        } else {
            $('.main-menu .section').eq(0).trigger(bpc.clickType);
            $('.main-menu li').eq(0).trigger(bpc.clickType);
        }

        // Version control
        $('.select-group').on(bpc.clickType, function() {
            if ($(this).find('.select').hasClass('open')) {
                $(this).find('.select').removeClass('open');
                $(this).find('ul').slideUp(150);
            } else {
                $(this).find('.select').addClass('open');
                $(this).find('ul').slideDown(150);
            }
        });

        $('.select-group .select').on(bpc.clickType, 'li', function() {
            if (!$(this).hasClass('selected')) {
                $('.select-group .select li.selected').removeClass('selected');
                $(this).addClass('selected');
                $('.select-group .select .current').text($(this).text());

                bpc.pixiVersionString = $(this).attr('data-val');
                bpc.majorPixiVersion = getMajorPixiVersion(bpc.pixiVersionString);
                window.history.pushState(bpc.pixiVersionString, null, '?v=' + bpc.pixiVersionString + location.hash);

                bpc.generateIFrameContent();
                $('.main-content').animate({ scrollTop: 0 }, 200);
            }
        });

        // Download
        $('.footer .download').on(bpc.clickType, function() {
            bpc.SaveToDisk(bpc.exampleUrl, bpc.exampleFilename);
        });

        // Refresh Button
        $('.reload').on(bpc.clickType, function() {
            bpc.exampleSourceCode = bpc.editor.getValue();
            bpc.generateIFrameContent();
        });
    };

    bpc.SaveToDisk = function(fileURL, fileName) {
        // for non-IE
        if (!window.ActiveXObject) {
            var save = document.createElement('a');
            save.href = fileURL;
            save.target = '_blank';
            save.download = fileName || 'unknown';

            var evt = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': false
            });
            save.dispatchEvent(evt);

            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        }

        // for IE < 11
        else if (!!window.ActiveXObject && document.execCommand) {
            var _window = window.open(fileURL, '_blank');
            _window.document.close();
            _window.document.execCommand('SaveAs', true, fileName || fileURL);
            _window.close();
        }
    };

    bpc.init = function() {
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) bpc.clickType = 'click';
        $(window).resize(bpc.resize);

        bpc.loadScriptsAsync();
    };

    bpc.init();
});
