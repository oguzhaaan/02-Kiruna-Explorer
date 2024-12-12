/**
 * class representing a document position
 * 
 * @param {number} id
 * @param {number} docId
 * @param {number} x
 * @param {number} y
 */

export default class DocumentPosition {
    constructor(id, documentId, x, y) {
        this.id = id;
        this.documentId = documentId;
        this.x = x;
        this.y = y;
    }
}

export class InvalidDocumentPosition extends Error {

    constructor() {
        super()
        this.customMessage = "Invalid Document Position"
        this.status = 400
    }
}

export class DocumentPositionNotFound extends Error {

    constructor() {
        super()
        this.customMessage = "Document Position not found"
        this.status = 404
    }
}
