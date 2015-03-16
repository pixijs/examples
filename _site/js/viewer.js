$(document).ready(function () {
    var baseUrl = location.href.split('?')[0],
        params = location.search.substr(1).split('&'),
        select = document.getElementById('version'),
        themeSelect = document.getElementById('theme'),
        editor;

    // convert params to object
    params = params.reduce(function (obj, val) {
        val = val.split('=');

        obj[val[0]] = decodeURIComponent(val[1]);

        return obj;
    }, {});

    document.title = 'pixi.js - ' + params.title;


    App.loadGithubTags('version',onTagsLoaded);

    if (params.v) {
        var url = 'https://cdn.rawgit.com/GoodBoyDigital/pixi.js/' + params.v + '/bin/pixi.js';
        App.loadPixi(url);
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
    }

    function onPixiLoaded()
    {
        loadExample('examples/' + params.s + '/' + params.f);
    }

    function loadExample(url)
    {
        // load the example code and executes it
        App.loadScript(url, 'example-script');

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

        var editorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true
        };

        editor = CodeMirror.fromTextArea(textarea,editorOptions);

        themeSelect.addEventListener('change',changeTheme,false);

        function changeTheme()
        {
            var theme = themeSelect.options[themeSelect.selectedIndex].innerHTML;
            editor.setOption('theme', theme);
        }
    }


});
