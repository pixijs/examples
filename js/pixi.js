/* Brett Meyer - Broken Pony Club */

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

jQuery(document).ready(function($) {
    window.onpopstate = function (event) {
        bpc.version = event.state || 'release';
        bpc.generateIFrameContent();

        $('.select-group .select li.selected').removeClass('selected');
        var $selected = $('.select-group .select li[data-val="' + bpc.version + '"]');
        $selected.addClass('selected');
        $('.select-group .select .current').text($selected.text());

        $('.main-content').animate({ scrollTop: 0 }, 300);
    };

    var bpc = bpc || {};
    bpc.aniIn = 0.2;
    bpc.aniOut = 0.3;
    bpc.currentSource = '';
    bpc.currentFilename = '';
    bpc.version = getParameterByName('v') || 'release';
    bpc.plugins = '';

    bpc.clickType = Modernizr.touchevents ? 'tap' : 'click';

    bpc.resize = function() {
    };

    // async script loading
    bpc.scriptsToLoad = ['https://cdnjs.cloudflare.com/ajax/libs/gsap/latest/TweenMax.min.js'];
    bpc.scriptsLoaded = 0;

    if (bpc.clickType === 'tap') {
        bpc.scriptsToLoad.push('js/jquery.mobile.custom.min.js');
    }

    bpc.loadScriptsAsync = function() {
        for (var i=0; i<bpc.scriptsToLoad.length; i++) {
            $.ajax({
                url: bpc.scriptsToLoad[i],
                dataType: 'script',
                cache: true,
                async: true,
                success: bpc.fileLoaded
            });
        }
        if (bpc.scriptsToLoad.length === 0) bpc.loadComplete();
    };

    bpc.fileLoaded = function() {
        bpc.scriptsLoaded++;
        if (bpc.scriptsLoaded === bpc.scriptsToLoad.length)
            bpc.loadComplete();
    };

    bpc.loadComplete = function() {
        $.getJSON('manifest.json', function(data) {
            var sections = Object.keys(data);
            for (var i=0; i<sections.length; i++) {
                var html = '<span class="section" data-section="'+sections[i]+'">'+sections[i]+'</span><ul data-section="'+sections[i]+'">',
                items = data[sections[i]];

                for (var j=0; j<items.length; j++) {
                    var plugins = typeof items[j].plugins !== 'undefined' ? items[j].plugins.join(',') : '';
                    html += '<li data-src="'+items[j].entry+'" data-plugins="'+plugins+'">'+items[j].title+'</li>';
                }
                html += '</ul>';

                $('.main-menu').append(html);
            }

            bpc.initNav();
        });

            $.getJSON('https://api.github.com/repos/pixijs/pixi.js/git/refs/tags', function (data) {
            // filters the tags to only include v3 and above
            data = data.filter(function (tag) {
                return tag.ref.indexOf('refs/tags/v3.0.11') === 0 ||
                tag.ref.indexOf('refs/tags/v4') === 0;
            }).map(function (tag) {
                return tag.ref.replace('refs/tags/', '');
            });

            for (var i = 0; i < data.length; i++) {
                $('.select-group .select ul').append('<li data-val="'+data[i]+'">'+data[i]+'</li>');
            }

            var $selected = $('.select-group .select li[data-val="' + bpc.version + '"]');
            $selected.addClass('selected');
            $('.select-group .select .current').text($selected.text());
        });
    };

    bpc.openMobileNav = function() {
        TweenMax.to('#line1', 0.2, {y: 0, ease: Linear.easeNone});
        TweenMax.to('#line2', 0, {alpha: 0, ease: Linear.easeNone, delay: 0.2});
        TweenMax.to('#line3', 0.2, {y: 0, ease: Linear.easeNone});

        TweenMax.to('#line1', 0.2, {rotation: 45, ease: Quart.easeOut, delay: 0.2});
        TweenMax.to('#line3', 0.2, {rotation: -45, ease: Quart.easeOut, delay: 0.2});

        $('.main-nav').addClass('mobile-open');
    };

    bpc.closeMobileNav = function() {
        TweenMax.to('#line1', 0.2, {rotation: 0, ease: Linear.easeNone, delay: 0});
        TweenMax.to('#line3', 0.2, {rotation: 0, ease: Linear.easeNone, delay: 0});

        TweenMax.to('#line2', 0, {alpha: 1, ease: Quart.easeOut, delay: 0.2});
        TweenMax.to('#line1', 0.2, {y: -8, ease: Quart.easeOut, delay: 0.2});
        TweenMax.to('#line3', 0.2, {y: 8, ease: Quart.easeOut, delay: 0.2});

        $('.main-nav').removeClass('mobile-open');
    };

    /*bpc.drawLines = function(elem) {
        var divHeight = parseInt(elem.height());
        var lineHeight = parseInt(elem.css('line-height'));
        var lines = divHeight / lineHeight;
        $('.main-content .code-editor .line-numbers').html('');
        for (var i = 1; i <= lines; i++) {
            $('.main-content .code-editor .line-numbers').append(i+'<br/>');
        }
    };*/

    bpc.initNav = function() {
        //var Prism = require('prismjs');
        $('.main-menu .section').on(bpc.clickType, function() {
            $(this).next('ul').slideToggle(350);
            $(this).toggleClass('open');
        });
        $('.main-menu li').on(bpc.clickType, function() {
            if (!$(this).hasClass('selected')) {
                $('.main-menu li.selected').removeClass('selected');
                $(this).addClass('selected');
                // load data
                bpc.closeMobileNav();
                $('.main-content h1').text($(this).text());
                var page = '/'+$(this).parent().attr('data-section')+'/'+$(this).attr('data-src');
                var title = $(this).text();

                window.location.hash = page;
                document.title = title + ' - PixiJS Examples';

                // Track page change in analytics
                ga('set', { page: page, title: title });
                ga('send', 'pageview');

                bpc.currentSource = 'required/examples/'+$(this).parent().attr('data-section')+'/'+$(this).attr('data-src');
                bpc.currentFilename = $(this).attr('data-src');
                bpc.plugins = $(this).attr('data-plugins');

                $.ajax({
                    url : 'required/examples/'+$(this).parent().attr('data-section')+'/'+$(this).attr('data-src'),
                    dataType: "text",
                    success : function(data) {
                        bpc.jsSource = data;
                        //var html = Prism.highlight(data, Prism.languages.javascript);
                        var html = data;
                        $('.CodeMirror').remove();
                        $('.main-content #code').html(html);

                        var editorOptions = {
                            mode: 'javascript',
                            lineNumbers: true,
                            styleActiveLine: true,
                            matchBrackets: true,
                            viewportMargin: Infinity,
                            lineWrapping: true
                        };

                        bpc.editor = CodeMirror.fromTextArea(document.getElementById('code'), editorOptions);

                        //bpc.drawLines($('.main-content .code-editor #code'));

                        bpc.generateIFrameContent();
                    }
                });

                //$('#preview').attr('src', 'iframe.html?src='+bpc.currentSource+'&v='+bpc.version+'&plugins='+bpc.plugins);
            }
        });
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
                if ($('.main-menu .section[data-section="'+arr[0]+'"]').length > 0) {
                    $('.main-menu .section[data-section="'+arr[0]+'"]').trigger(bpc.clickType);
                    if ($('.main-menu .section[data-section="'+arr[0]+'"]').next().find('li[data-src="'+arr[1]+'"]').length > 0) {
                        $('.main-menu .section[data-section="'+arr[0]+'"]').next().find('li[data-src="'+arr[1]+'"]').trigger(bpc.clickType);
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
                $(this).find('ul').slideUp(250);
            } else {
                $(this).find('.select').addClass('open');
                $(this).find('ul').slideDown(250);
            }
        });
        /*$('.select-group .current').on(bpc.clickType, function() {
            if ($(this).parent().hasClass('open')) {
                $(this).parent().removeClass('open');
                $(this).parent().find('ul').slideUp(250);
            } else {
                $(this).parent().addClass('open');
                $(this).parent().find('ul').slideDown(250);
            }
        });*/
        $('.select-group .select').on(bpc.clickType, 'li', function() {
            if (!$(this).hasClass('selected')) {
                $('.select-group .select li.selected').removeClass('selected');
                $(this).addClass('selected');
                $('.select-group .select .current').text($(this).text());

                bpc.version = $(this).attr('data-val');
                window.history.pushState(bpc.version, null, '?v=' + bpc.version + location.hash);

                //$('#preview').attr('src', 'iframe.html?src='+bpc.currentSource+'&v='+bpc.version+'&plugins='+bpc.plugins);
                bpc.generateIFrameContent();
                $('.main-content').animate({scrollTop: 0}, 300);
            }
        });

        // Download
        $('.footer .download').on(bpc.clickType, function() {
            bpc.SaveToDisk(bpc.currentSource, bpc.currentFilename);
        });

        // Refresh Button
        $('.reload').on(bpc.clickType, function() {
            bpc.jsSource = bpc.editor.getValue();
            bpc.generateIFrameContent();
        });
    };

    bpc.generateIFrameContent = function() {
        // Remove all iFrames and content
        var iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        $('#example').html('<iframe id="preview" src="blank.html"></iframe>');
        // Generate HTML and insert into iFrame
        var js = bpc.jsSource;
        var pixiUrl = '';

		var isLocal = bpc.version.substr(0, 5) === 'local';
        // pull v3 from github cdn
		if (isLocal) {
			pixiUrl = "dist/pixi.js"
		} else
        if (bpc.version.substr(0, 2) === 'v3') {
            pixiUrl = 'https://cdn.rawgit.com/GoodBoyDigital/pixi.js/' + bpc.version + '/bin/pixi.js';
        }
        // other versions come from S3
        else {
            pixiUrl = 'https://d157l7jdn8e5sf.cloudfront.net/' + bpc.version + '/pixi.js';
        }

        var html = '<!DOCTYPE html><html><head><style>body,html{margin:0px;height:100%;overflow:hidden;}canvas{width:100%;height:100%;}</style></head><body>';
        html += '<script src="https://code.jquery.com/jquery-1.12.0.min.js"></script>';
        html += '<script src="' + pixiUrl + '"></script>';

        var plugins = bpc.plugins === '' ? [] : bpc.plugins.split(',');

		if (!isLocal) {
			if (bpc.version !== "release" && bpc.version !== "dev") {
                html += '<script src="required/plugins/pixi-legacy.js"></script>';
			}
			for (i=0; i < plugins.length; i++) {
                html += '<script src="required/plugins/'+plugins[i]+'.js"></script>';
            }
		} else {
			for (i=0; i < plugins.length; i++) {
				html += '<script src="dist/plugins/'+plugins[i]+'.js"></script>';
			}
		}



        html += '<script>window.onload = function(){'+js+'}</script></body></html>';

        var iframe = document.getElementById('preview');
        var frameDoc = iframe.contentDocument ||  iframe.contentWindow.document;

        frameDoc.open();
        frameDoc.write(html);
        frameDoc.close();
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
        else if (!! window.ActiveXObject && document.execCommand)     {
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
