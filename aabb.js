/**
 * An axis-aligned bounding box
 */
export class Aabb {

    /**
     * Constructs a (invalid) bounding box.
     */
    constructor() {
        this.min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
        this.max = [-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE];
    }

    /**
     * Adds a point to this bounding box.  The bounding box will expand (if necessary)
     * to contain the point.
     * 
     * @param {Number} x the x-coordinate of the point to add
     * @param {Number} y the y-coordinate of the point to add
     * @param {Number} z the z-coordinate of the point to add
     */
    add( x, y, z ) {
        this.min[0] = Math.min( x, this.min[0] );
        this.min[1] = Math.min( y, this.min[1] );
        this.min[2] = Math.min( z, this.min[2] );

        this.max[0] = Math.max( x, this.max[0] );
        this.max[1] = Math.max( y, this.max[1] );
        this.max[2] = Math.max( z, this.max[2] );
    }
}
