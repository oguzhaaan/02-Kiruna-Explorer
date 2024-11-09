/**
 * class representing an area viewable on the kiruna explorer map
 * 
 * @param {number} id
 * @param {string} geoJson
 */

export default class Area {
    constructor(id, geoJson) {
        this.id = id;
        this.geoJson = geoJson;
    }
}

/**
 * Represents an error that occurs when an area is invalid.
 */
export class InvalidArea extends Error {

    constructor() {
        super()
        this.customMessage = "Invalid Area"
        this.status = 400
    }

}
export class AreaNotFound extends Error {

    constructor() {
        super()
        this.customMessage = "Area not found"
        this.status = 404
    }

}
