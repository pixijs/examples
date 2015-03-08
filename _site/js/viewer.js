$(function () {
    $.getJSON('https://api.github.com/repos/GoodBoyDigital/pixi.js/releases')
        .done(function (data) {
            data = data.filter(function (release) {
                return release.tag_name.indexOf('v3') === 0;
            });

            // TODO: use `data` to populate version picker
        });
});
