function Editor (domElement,textarea) {

	/*  this is the delay before refreshing the iframe
	 * after the user presses a key
	 */
	this.delay = 1500;
    this.timeout;

    this.domElement = domElement || document.createElement('div');
    this.textarea = textarea || document.createElement('textarea');
    this.iframe;
    this.autoUpdate = false;

    this.request = new XMLHttpRequest();
    this.editor;
    this.plugins;

    return this;
}

Editor.prototype.constructor = Editor;

Editor.prototype = {

	init : function (jsFile, plugins) {

        this.plugins = plugins;

	    this.iframe = document.getElementById('preview');

	    // hook the loaded funtion to the onload event
	    this.request.onload = this.loaded.bind(this);

        // console.log(jsFile);
	    this.request.open('get',jsFile,true);

	    this.request.send();
	},

	iframeResize : function () {

        var frameDoc = this.iframe.contentDocument ||  this.iframe.contentWindow.document;

        var canvas = frameDoc.querySelector('canvas');

        // for slow connections
        if(canvas)
        {
            var ratio = canvas.width/canvas.height;

            ratio = window.innerWidth/(canvas.width) < window.innerHeight/(canvas.height) ? window.innerWidth/(canvas.width) : window.innerHeight/(canvas.height);

            var w2 = Math.min(canvas.width * ratio, window.innerWidth);
            var h2 = Math.min(canvas.height * ratio, window.innerHeight);

            w2 = Math.min(800,w2);
            h2 = Math.min(600,h2);

            canvas.style.width = w2 + "px";
            canvas.style.height = h2 + "px";

            this.iframe.style.width = w2 + 20 + "px";
        }
	},

	loaded : function () {

		this.textarea.innerHTML = this.request.responseText;

		var editorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            viewportMargin: Infinity
        };

        this.editor = CodeMirror.fromTextArea(this.textarea,editorOptions);

        window.addEventListener('resize',this.iframeResize.bind(this),false);

        this.updatePreview();

        setTimeout(this.iframeResize.bind(this),600);
	},

	handleTimeOuts : function () {

		clearTimeout(this.timeout);

		if(this.autoUpdate)
		{
			this.timeout = setTimeout(this.updatePreview.bind(this), this.delay);
		}


	},

	getContent : function () {
		return this.editor.getValue();
	},

	toggleAutoUpdate : function () {

		this.autoUpdate = !this.autoUpdate;
		this.handleTimeOuts();
	},

    insertBetween : function (js) {
        var begin = '<html><head><title>pixi.js example 1</title><style>body,html {margin: 0;padding: 0;border: 0;font-size: 100%;font: inherit;vertical-align: baseline;line-height: 1;}</style><script src="' + '_site/js/pixi.js'+ '"></script></head><body>";';
        if (this.plugins) {
            this.plugins.forEach(function(pluginName) {
                begin+='<script src="_site/js/plugins/'+pluginName+'.js"></script>';
            });
        }
        begin += '<script>/* the window.onload is ABSOLUTELY essential, otherwise opening and closing Iframes does not work;*/ window.onload = function(){';

        var end = "}</script></body></html>";

        var html = begin + js + end;

        return html;
    },

    flattenString : function (string) {
        var noSpace = string.trim();

        var noLine = noSpace.replace(/(\r\n|\n|\r)/gm,"");

        return noSpace;
    },

	/*
	 * open a stream and replace the current content of the iframe
	 * with the new content from codemirror (editor.getValue())
	 *
	 */
	updatePreview : function (callback) {

        // these give us access to the document and the window element of the frame
        var frameDoc = this.iframe.contentDocument ||  this.iframe.contentWindow.document;

        var frameWin = this.iframe.contentWindow || this.iframe;

        var js = this.getContent();

        var html = this.insertBetween(js);

        /*
         * The js codes adds the pixi canvas to the iframe's DOM
         * therefore the html of the iframe is different from the original html
         */
       /*
        * I know there is some unused code here but it might be useful in the future if we get time to expand the editor
        */
        // var pixiCanvas = frameDoc.querySelector('canvas');

        // var currentHtml = frameDoc.documentElement.outerHTML;

        // var html = this.flattenString(html);

        // var currentHtml = this.flattenString(currentHtml);

        frameDoc.open();
        frameDoc.write(html);
        frameDoc.close();

        if(callback)
        {
            callback();
        }


	}
}
