/**
 * Manages the event listeners for keyboard, mouse and DOM events.
 */
export class Controls {

    /**
     * Constructs a Controls object and adds the appropriate event 
     * listeners to DOM elements.
     * 
     * @param {DOMElement} canvas the canvas element 
     * @param {Scene} scene the Scene object 
     */
    constructor(canvas, scene) {
        this.canvas = canvas;
        this.scene = scene;
        this.mousePrevious = null;
        this.downKeys = new Set();

        // Keyboard listeners
        document.addEventListener("keydown", (e) => {
            this.downKeys.add(e.code);

            // Prevent the space key from scrolling
            if( e.code === "Space" ) e.preventDefault();
        });
        document.addEventListener("keyup", (e) => {
            this.downKeys.delete(e.code);
            if( e.code === "Space" ) e.preventDefault();
        });

        // Mouse listeners
        const mouseMoveFn = (e) => this.mouseMoveEvent(e);
        canvas.addEventListener('mousedown', (e) => {
            this.canvas.addEventListener('mousemove', mouseMoveFn );
        });
        canvas.addEventListener('mouseup', (e) => {
            this.canvas.removeEventListener('mousemove', mouseMoveFn);
            this.mousePrevious = null;
        });
        // Mouse wheel listener
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.scene.mouseWheel(e.deltaY);
        });
        
        // Controls
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', (e) => this.scene.resetCamera() );

        document.getElementById('perspective-rb').addEventListener('change', (e) => this.perspOrthoChange(e) );

        document.getElementById('mouse-mode-rb').addEventListener('change', (e) => this.modeChange(e));
        document.getElementById('fly-mode-rb').addEventListener('change', (e) => this.modeChange(e));
    }

    /**
     * Returns true if the key is currently down, false otherwise.
     * 
     * @param {string} key the key code (e.g. "KeyA", "KeyB", etc.) see:
     *   https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code 
     *   for details on the key codes.
     */
    keyDown( key ) {
        return this.downKeys.has(key);
    }

    /**
     * Called when a mousemove event is received.
     * 
     * @param {MouseEvent} e the MouseEvent object 
     */
    mouseMoveEvent(e) {
        const x = e.offsetX, y = e.offsetY;
        if( this.mousePrevious === null ) {
            this.mousePrevious = [x, y];
        }
        const deltaX = x - this.mousePrevious[0];
        const deltaY = y - this.mousePrevious[1];

        if( e.buttons === 1 ) {
            if( e.shiftKey ) {
                this.scene.shiftLeftDrag(deltaX, deltaY);
            } else {
                this.scene.leftDrag(deltaX, deltaY);
            }
        }

        this.mousePrevious[0] = x;
        this.mousePrevious[1] = y;
    }

    /**
     * Called when the perspective/orthographic radio button is changed.
     * 
     * @param {Event} e 
     */
    perspOrthoChange(e) {
        if( e.target.value === "perspective" ) {
            this.scene.setViewVolume("perspective");
        } else {
            this.scene.setViewVolume("orthographic");
        }
    }

    /**
     * Called when the fly/mouse mode radio button is changed.
     * 
     * @param {Event} e 
     */
    modeChange(e) {
        if( e.target.value === "mouse") {
            this.scene.setMode("mouse");
        } else {
            this.scene.setMode("fly");
        }
    }
}