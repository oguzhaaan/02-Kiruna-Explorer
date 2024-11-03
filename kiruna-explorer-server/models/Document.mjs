/**
 * class representing a Document viewable on the kiruna explorer map
 * 
 * @param {number} id 
 * @param {string} title
 * @param {array} stakeholders
 * @param {string} date
 * @param {string} type
 * @param {string} language
 * @param {string} description
 * @param {number} areaId
 * @param {number} pages
 * @param {number} planNumber
 * @param {scale} scale
 */

export default class Document {
    constructor(id, title, stakeholders, date, type, language, description, areaId, scale, pages, planNumber) {
        this.id = id;
        this.title = title;
        this.stakeholders = stakeholders;
        this.date = date;
        this.type = type;
        this.language = language;
        this.description = description;
        this.areaId = areaId;
        this.scale = scale;
        this.pages = pages;
        this.planNumber = planNumber;

    }

}