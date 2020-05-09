
/**
 * Class that manages mouse motion for camera orbit rotations.
 */
export class OrbitControls {

    /**
     * Initializes the event handlers.
     * 
     * @param {Camera} cam the camera 
     * @param {HTMLElement} canv the canavas element 
     */
    constructor( cam, canv ) {
        this.camera = cam;
        this.canvas = canv;
        this.updateEvent = new Event('repaint');
        this.STATE = { NONE: 0, ROTATING: 1 };
        this.state = this.STATE.NONE;
        this.mouseStart = [0,0];

        this.handlers = {
            mousedown: (e) => this.onMouseDown(e),
            mousewheel: (e) => this.onMouseWheel(e),
            mouseup: (e) => this.onMouseUp(e),
            mousemove: (e) => this.onMouseMove(e)
        };

        this.canvas.addEventListener("mousedown", this.handlers.mousedown, false);
        this.canvas.addEventListener('wheel', this.handlers.mousewheel, false );
    }

    /**
     * Sends a repaint event to the canvas.
     */
    update() {
        this.canvas.dispatchEvent(this.updateEvent);
    }

    /**
     * Mouse down event
     * @param {MouseEvent} evt 
     */
    onMouseDown(evt) {
        const mouseX = evt.offsetX;
        const mouseY = evt.offsetY;
        this.mouseStart[0] = mouseX; this.mouseStart[1] = mouseY;
        this.state = this.STATE.ROTATING;
        
        document.addEventListener( 'mousemove', this.handlers.mousemove, false );
		document.addEventListener( 'mouseup', this.handlers.mouseup, false );
    }

    /**
     * Mouse wheel event handler.
     * @param {MouseEvent} evt 
     */
    onMouseWheel(evt) {
        evt.preventDefault();
        this.camera.dolly((0.1) * evt.deltaY);
        this.update();
    }

    /**
     * Mouse motion event handler.
     * @param {MouseEvent} evt 
     */
    onMouseMove(evt) {
        evt.preventDefault();
        if( this.state === this.STATE.ROTATING ) {
            const mouseX = evt.offsetX;
            const mouseY = evt.offsetY;
    
            this.camera.orbit( 
                (-0.01) * (mouseX - this.mouseStart[0]), 
                (-0.01) * (mouseY - this.mouseStart[1]));
    
            this.mouseStart[0] = mouseX;
            this.mouseStart[1] = mouseY;
            this.update();
        }
    }

    /**
     * Mouse up event handler.
     * @param {MouseEvent} evt 
     */
    onMouseUp(evt) {
        this.state = this.STATE.NONE;
        document.removeEventListener('mousemove', this.handlers.mousemove);
        document.removeEventListener('mouseup', this.handlers.mouseup);
    }
}