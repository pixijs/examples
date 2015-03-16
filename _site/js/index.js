$(document).ready(function () {

    // generates the links from the json manifest

    var ul = document.getElementById('exampleList')
    App.loadManifest(ul);
});
