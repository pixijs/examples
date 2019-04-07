var app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb } );
document.body.appendChild(app.view);

// // Load them google fonts before starting...!
window.WebFontConfig = {
    google: {
        families: ['Snippet', 'Arvo:700italic', 'Podkova:700']
    },

    active: function() {
        init();
    }
};

// include the web-font loader script
(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

function init()
{
    // create some white text using the Snippet webfont
    var textSample = new PIXI.Text('Pixi.js text using the\ncustom "Snippet" Webfont', {
        fontFamily: 'Snippet',
        fontSize: 50,
        fill: 'white',
        align: 'left'
    });
    textSample.position.set(50, 200);
    app.stage.addChild(textSample);
}
