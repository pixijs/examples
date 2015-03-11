$(document).ready(function () {
    $.getJSON('_site/manifest.json')
        .done(function (data) {
            var examples = document.getElementById('examples');
            var sections = Object.keys(data);

            sections.splice(sections.indexOf('basics'), 1);
            sections.sort();
            sections.unshift('basics');

            for (var i = 0; i < sections.length; ++i) {
                var sect = document.createElement('li');

                sect.textContent = sections[i];

                var ul = document.createElement('ul');
                var files = data[sections[i]];

                for (var j = 0; j < files.length; ++j) {
                    var exLi = document.createElement('li'),
                        exa = document.createElement('a');

                    exa.textContent = files[j].title;
                    exa.href = 'view.html?s=' + encodeURIComponent(sections[i]) +
                                '&f=' + files[j].entry +
                                '&title=' + files[j].title;

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
});
