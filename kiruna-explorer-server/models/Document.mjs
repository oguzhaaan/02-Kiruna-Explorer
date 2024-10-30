/**
 * class representing a Document viewable on the kiruna explorer map
 * 
 * @param {number} id 
 * @param {string} title
 * @param {string} stakeholders
 * @param {string} date
 * @param {string} type
 * @param {string} language
 * @param {string} description
 * @param {number} areaid
 */

export default class Document {
    constructor(id, title,stakeholders, date, type, language, description, areaid) {
        this.id = id;
        this.title = title;
        this.stakeholders = stakeholders;
        this.date = date;
        this.type = type;
        this.language = language;
        this.description = description;
        this.areaid = areaid;
        
    }

}