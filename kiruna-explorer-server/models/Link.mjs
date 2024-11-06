/**
 * This class represents a link between two documents.
 * 
 * @constructor
 * @param {number} id - The ID of the link.
 * @param {number} documentId - The ID of the document that is linked.
 * @param {number} linkedDocumentId - The ID of the document that is being linked.
 * @param {Date} date - The date when the link was created.
 * @param {string} connection - The type of connection between the two documents.
 */

export default class Link{
    constructor(id, doc1Id, doc2Id, date, connection) {
        this.id = id;
        this.doc1Id = doc1Id;
        this.doc2Id = doc2Id;
        this.date = date;
        this.connection = connection;
    }
}