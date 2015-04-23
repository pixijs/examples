$(document).ready(function () {
    var baseUrl = location.href.split('?')[0],
        params,
        select = document.getElementById('version'),
        themeSelect = document.getElementById('theme'),
        editor;

    params = App.getUrlParams();

    document.title = 'pixi.js - ' + params.title;


    App.loadGithubTags('version',onTagsLoaded);

    var nav = document.getElementById('navList');
    App.loadManifest(nav);

    if (params.v) {
        console.log('loading external pixi ...')
        var url = 'https://cdn.rawgit.com/GoodBoyDigital/pixi.js/' + params.v + '/bin/pixi.js';
        App.loadPixi(url,onPixiLoaded);
    }
    else{
        console.log('Loading local pixi');
        App.loadPixi('_site/js/pixi.js',onPixiLoaded);
    }

    function onTagsLoaded (select)
    {
        console.log('tags loaded')
        //  if a specific version was required
        if (params.v) {
            for (var i = 0; i < select.options.length; ++i) {
                if (select.options[i].dataset.version === params.v) {
                    select.selectedIndex = i;
                    break;
                }
            }
        } else {
            select.selectedIndex = 1;
        }

        select.addEventListener('change', function () {
            var params = App.getUrlParams();

            params.v = select.options[select.selectedIndex].dataset.version;

            console.log('hi');
            window.location.href = baseUrl + '?' + $.param(params);
        });
    }

    function onPixiLoaded()
    {
        console.log('pixi loaded');
        loadExample('examples/' + params.s + '/' + params.f);
    }

    function loadExample(url)
    {
        // load the example code and executes it
        //App.loadScript(url, 'example-script');

        // load the example code
        $.ajax({ url: url, dataType: 'text' })
            .done(function (data)
            {
                exampleCodeLoaded(url, data);
            });
    }

    function exampleCodeLoaded (url, code)
    {
        var textarea = document.getElementById('sourcecode');

        var title = document.querySelector('h1');

        title.innerHTML = params.title;

        textarea.innerHTML = code;
        var container = document.getElementById('example');

        editor = new Editor(container,textarea);

        //load plugin list from parameters
        var pluginList = [];
        if (params.plugins) {
            pluginList = params.plugins.split(",");
        }
        editor.init(url, pluginList);

        themeSelect.addEventListener('change',changeTheme,false);

        function changeTheme()
        {
            var theme = themeSelect.options[themeSelect.selectedIndex].innerHTML;
            editor.setOption('theme', theme);
        }
    }

    var hamb = document.getElementById('hamburger');

    hamb.addEventListener('mousedown',toggleNav,false);

    hamb.addEventListener('touchstart',toggleNav,false);

    var refreshBtn = document.getElementById('refresh');

    var canReload = true;

    var downloadBtn = document.getElementById('download');

    download.addEventListener('click',downloadFile,false);

    function downloadFile (e) {

        e.preventDefault();

        var blob = new Blob([editor.getContent()], {type: "text/javascript;charset=utf-8"});

        var fileName = params.f || 'example.js';

        saveAs(blob, fileName);

        return false;
    }

    function reloadCode (e) {

        if(canReload)
        {
            editor.updatePreview();
        }
    }

    refresh.addEventListener('click',reloadCode);

    var nav = document.querySelector('nav');

    var bol = true;

    function toggleNav () {

        bol = !bol;

        if(bol)
        {
            nav.className = 'show';
        }
        else{
            nav.className = 'hidden';
        }

    }


});
