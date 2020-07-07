// The basic steps most WebXR applications will go through are:

// Query to see if the desired XR mode is supported.
// If support is available, advertise XR functionality to the user.
// A user-activation event indicates that the user wishes to use XR.
// Request an immersive session from the device
// Use the session to run a render loop that produces graphical frames to be displayed on the XR device.
// Continue producing frames until the user indicates that they wish to exit XR mode.
// End the XR session.
// Debug https://chrome.google.com/webstore/detail/webxr-api-emulator/
// https://developer.mozilla.org/fr/docs/Web/API/WebGL_API/By_example

// const xrCompatible = !!navigator.xr//.isSessionSupported('immersive-vr'); promise
/** WEBXR STUFF */
/** @see https://developer.mozilla.org/en-US/docs/Web/API/XRSession */
let XrSession = null;
/** coordinate system @see https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace */
let XrRefSpace = null;
/** @see https://www.w3.org/TR/webxr/#xrsessionmode-enum */
const XRSessionMode = 'inline'; // "inline" || 'immersive-vr'
/** WebXr API */
const WebXR = navigator.xr;
/** interpupillary distance ranges through
 * 48 - 73mm (adults) and 41 - 55mm (children).
 * For manufacturing stereo microscopes, the range is often taken as 55 - 75mm
 * The average adult inter-ocular distance is about 63mm for women and 65mm for men.
 * 65mm has become the usual separation to aim for in stereoscopic photography. */
let IPD = -65; // ~65mm , some device are mechanic, ajust with keyboard <left|right> keys
/** PIXI STUFF */

let X = 0;
let Y = 0;
const Canvas = document.createElement('canvas');
let GL = Canvas.getContext('webgl2', { xrCompatible: true, stencil: true }); // 'webgl' | 'webgl2'
const Renderer = new PIXI.Renderer({
    context: GL,
    view: Canvas,
    width: 800,
    height: 600,
    backgroundColor: 0x000000,
    clearBeforeRender: false,
    autoDensity: true,
});
GL.clearColor(0.8, 0.8, 0.8, 1.0);
GL.clear(GL.COLOR_BUFFER_BIT);

const Matrix = new PIXI.Matrix(1, 0, 0, 1, IPD, 0);
const Stage = new PIXI.Container();
// eslint-disable-next-line camelcase
const Btn_vr = new PIXI.Text('[StartVR]', { fontSize: 24 });
Stage.addChild(Btn_vr);
document.body.insertBefore(Canvas, document.body.firstChild);

/** Step:1 Check if browser integrate webXR thecnologie via native js API
 * If browser not support webXR natively, we can inject polyfill manualy at
 * @see https://github.com/mozilla/webxr-polyfill
 */
function initXR() {
    // draw a grid for eye
    create_grids();
    // check if WebXr supported
    if (WebXR) {
        // check if the XRSessionMode supported
        WebXR.isSessionSupported(XRSessionMode).then((supported) => {
            // if supported, allow btn, or tell to load polyfill
            if (supported) {
                Btn_vr.text = 'Enter VR';
                Btn_vr.interactive = true;
                Btn_vr.buttonMode = true;
                Btn_vr.on('pointerup', toggleSession);
            } else {
                Btn_vr.text = 'WebXr API not avaible in your browser \n Load polyfill manualy.';
            }
        });
    }
}

// Called when the user clicks the button to enter XR. If we don't have a
// session we'll request one, and if we do have a session we'll end it.
function toggleSession() {
    if (!XrSession) {
        WebXR.requestSession('immersive-vr').then(onSessionStarted);
    } else {
        XrSession.end();
    }
}

// Called when we've successfully acquired a XRSession. In response we
// will set up the necessary session state and kick off the frame loop.
function onSessionStarted(session) {
    XrSession = session;
    Btn_vr.text = 'Exit VR';
    Renderer.render(Stage);
    // Listen for the sessions 'end' event so we can respond if the user
    // or UA ends the session for any reason.
    XrSession.addEventListener('end', onSessionEnded);
    // Use the new WebGL context to create a XRWebGLLayer and set it as the
    // sessions baseLayer. This allows any content rendered to the layer to
    // be displayed on the XRDevice.
    XrSession.updateRenderState({ baseLayer: new XRWebGLLayer(XrSession, GL) });
    // Get a reference space, which is required for querying poses. In this
    // case an 'local' reference space means that all poses will be relative
    // to the location where the XRDevice was first detected.
    XrSession.requestReferenceSpace('local').then((refSpace) => {
        XrRefSpace = refSpace;
        // Inform the session that we're ready to begin drawing.
        XrSession.requestAnimationFrame(onXRFrame);
    });
}

// Called every time the XRSession requests that a new frame be drawn.
function onXRFrame(time, frame) {
    const session = frame.session;
    // Inform the session that we're ready for the next frame.
    session.requestAnimationFrame(onXRFrame);
    // Get the XRDevice pose relative to the reference space we created
    // earlier.
    const pose = frame.getViewerPose(XrRefSpace);

    // Getting the pose may fail if, for example, tracking is lost. So we
    // have to check to make sure that we got a valid pose before attempting
    // to render with it. If not in this case we'll just leave the
    // framebuffer cleared, so tracking loss means the scene will simply
    // disappear.
    if (pose) {
        const glLayer = session.renderState.baseLayer;
        // Update IPD for eyes
        Matrix.tx = IPD;
        // If we do have a valid pose, bind the WebGL layer's framebuffer,
        GL.bindFramebuffer(GL.FRAMEBUFFER, glLayer.framebuffer);
        // Clear the framebuffer
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        // Normally you'd loop through each of the views reported by the frame
        // and draw them into the corresponding viewport here, but we're
        // keeping this sample slim so we're not bothering to draw any geometry.
        for (const view of pose.views) {
            const viewport = glLayer.getViewport(view);
            GL.viewport(
                viewport.x,
                viewport.y,
                viewport.width,
                viewport.height,
            );
            //  Renderer.render(Stage,null,true, Matrix.invert(), false);
            // # render #1
            if (view.eye === 'left') {
                Renderer.render(Stage, null, false, Matrix.invert());
            }
            // # render #2, projections of render1
            if (view.eye === 'right') {
                // Draw a scene using view.projectionMatrix as the projection matrix
                // see view.transform.matrix for device coor ?
                // GL.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                Renderer.render(Stage, null, false, Matrix.invert());
            }
            // game logic update ?
            if (Stage) {
                Btn_vr.text = `IPD:${IPD} x:${~~X},y:${~~Y}`; // view.transform.matrix[1];
                Btn_vr.position.set(0 + X, 0 + Y);
            }
        }
    }
}

// Called either when the user has explicitly ended the session by calling
// session.end() or when the UA has ended the session for any reason.
// At this point the session object is no longer usable and should be
// discarded.
function onSessionEnded(event) {
    XrSession = null;
    Btn_vr.text = 'Enter VR';
    // In this simple case discard the WebGL context too, since we're not
    // rendering anything else to the screen with it.
    GL = null;
    Renderer.render(Stage);
}
// Start the XR application.
try {
    initXR();
    Renderer.render(Stage);
} catch (err) {
    throw console.error(err);
}

// just draw a grid for visual help (center eyes)
function create_grids() {
    const color = [0xffffff, 0x000000, 0xff0000, 0x0000ff, 0xffd800, 0xcb42f4][
        ~~(Math.random() * 6)
    ];
    const [w, h] = [Renderer.width, Renderer.height];
    const grids = new PIXI.Graphics()
        .lineStyle(2, 0xffd800, 1)
        .moveTo(w / 2, 0)
        .lineTo(w / 2, h)
        .moveTo(0, h / 2)
        .lineTo(w, h / 2)
        .endFill();
    Stage.addChild(grids);
}
// allow change PID in VR device
document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft') {
        IPD -= 1;
    }
    if (event.code === 'ArrowRight') {
        IPD += 1;
    }
    Btn_vr.text = Matrix.tx;
});
// track mouse in VR for move text
document.addEventListener('mousemove', (e) => {
    X = e.clientX * 2;
    Y = e.clientY * 2;
});
