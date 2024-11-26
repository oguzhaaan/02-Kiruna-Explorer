/**
 * class representing a document type
 * 
 * @param {number} id
 * @param {string} name
 */

export default class DocumentType {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export class InvalidDocumentType extends Error {

    constructor() {
        super()
        this.customMessage = "Invalid Document Type"
        this.status = 400
    }
}

export class DocumentTypeNotFound extends Error {

    constructor() {
        super()
        this.customMessage = "Document Type not found"
        this.status = 404
    }
}

export class DocumentTypeNameAlreadyExists extends Error {

    constructor() {
        super()
        this.customMessage = "Document Type name already exists"
        this.status = 409
    }
}
