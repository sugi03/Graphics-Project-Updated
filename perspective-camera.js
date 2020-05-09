
import * as mat4 from './gl-matrix/mat4.js';

import {Camera} from './camera.js';

/**
 * Extends a Camera to include a perspective projection matrix.
 */
export class PerspectiveCamera extends Camera {

    /**
     * A constructor function for a Camera object.  Sets a default
     * camera frustum, position and orientation.
     * 
     * @param {Number} aspect camera's (viewport's) aspect ratio
     */
    constructor(aspect) {
        super();

        this.aspect = aspect;

        // Parameters for the perspective frustum
        this.setFrustum( 45.0 * Math.PI / 180.0, this.aspect, 1.0, 200.0);
    }

    /**
     * Sets the dimensions of the camera's perspective frustum.
     * 
     * @param {Number} fov field of view angle 
     * @param {Number} aspect aspect ratio 
     * @param {Number} near near plane distance 
     * @param {Number} far far plane distance 
     */
    setFrustum(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    setNear(n) {
        this.setFrustum(this.fov, this.aspect, n, this.far);
    }

    setFar(f) {
        this.setFrustum(this.fov, this.aspect, this.near, f);
    }

    setFov(f) {
        this.setFrustum(f, this.aspect, this.near, this.far);
    }

    setAspect( newAspect ) {
        this.setFrustum(this.fov, newAspect, this.near, this.far);
    }

    /**
     * Computes and returns the projection matrix based on this camera.
     * @param {mat4} m projection matrix is stored here
     */
    projectionMatrix(m) {
        mat4.perspective(m, this.fov, this.aspect, this.near, this.far);
    }
}