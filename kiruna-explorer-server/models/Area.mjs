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