var App = {
    loadManifest : function(rootUl) {

        rootUl = rootUl || document.body.appendChild(document.createElement('ul'));

        $.getJSON('_site/manifest.json')
        .done(function (data) {
            var examples = rootUl;
            var sections = Object.keys(data);

            sections.splice(sections.indexOf('basics'), 1);
            sections.sort();
            sections.unshift('basics');

            for (var i = 0; i < sections.length; ++i) {
                var sect = document.createElement('li');

                var sectionTitle = document.createElement('span');

                sectionTitle.innerHTML = sections[i];

                sect.appendChild(sectionTitle);

                var ul = document.createElement('ul');
                var files = data[sections[i]];

                for (var j = 0; j < files.length; ++j) {
                    var exLi = document.createElement('li'),
                        exa = document.createElement('a');

                    exa.textContent = files[j].title;
                    exa.href = 'index.html?s=' + encodeURIComponent(sections[i]) +
                                '&f=' + files[j].entry +
                                '&title=' + files[j].title;
                    if (files[j].plugins) {
                        exa.href += '&plugins='+ files[j].plugins.join(",");
                    }

                    // add version flag if there is a param for version on this page
                    location.search.substr(1).split('&').forEach(function (param) {
                        if (param.indexOf('v=') === 0) {
                            exa.href = exa.href + '&' + param;
                        }
                    });

                    exLi.appendChild(exa);
                    ul.appendChild(exLi);
                }

                sect.appendChild(ul);
                examples.appendChild(sect);
            }
        })
        .fail(function () {
            var examples = document.getElementById('examples');

            examples.innerHTML = '<li>Error loading examples manifest!</li>';
        });

    },

    loadGithubTags : function(selectId,callback)
    {

        var select = document.getElementById(selectId);
        console.log('Loading tags from github ...');

        $.getJSON('https://api.github.com/repos/GoodBoyDigital/pixi.js/git/refs/tags')
        .done(function (data)
        {
            // filters the tags to only include v3 and above
            data = data
                .filter(function (tag) {
                    return tag.ref.indexOf('refs/tags/v3') === 0;
                })
                .map(function (tag) {
                    return tag.ref.replace('refs/tags/', '');
                });


            // populates the dropdrown section with the pixi tags
            for (var i = 0; i < data.length; i++) {
                var option = document.createElement('option');

                option.value = 'https://cdn.rawgit.com/GoodBoyDigital/pixi.js/' + data[i] + '/bin/pixi.js';
                option.textContent = data[i];
                option.dataset.version = data[i];
                select.appendChild(option);
            }

            callback(select);


        });

    },

    loadPixi : function(url,callback)
    {
        // get the pixi lib
        this.loadScript(url, 'lib-script',callback);

    },

    loadPlugin : function(name,url,callback)
    {
        // get the pixi lib
        this.loadScript(url, 'lib-script-'+name,callback);

    },

    loadScript : function(url, id, cb)
    {
        var script = document.getElementById(id) || document.createElement('script');

        if (script.parent) {
            script.remove();
        }

        script.setAttribute('src', url);

        if (cb)
        {
            function loadHandler()
            {
                script.removeEventListener('load', loadHandler);

                cb();
            }

            script.addEventListener('load',loadHandler);

        }

        document.body.appendChild(script);
    },

    getUrlParams : function () {
        var params = window.location.search.substr(1).split('&');

        if(params.length > 1)
        {
            // convert params to object
            params = params.reduce(function (obj, val) {
                val = val.split('=');

                obj[val[0]] = decodeURIComponent(val[1]);

                return obj;
            }, {});

        }
        else{
            // defaults to the basic example, there might be better way to do this
            // but this will do for now
            params = {s: "basics", f: "basic.js", title: "Basic"};
        }

        return params;
    }


}
