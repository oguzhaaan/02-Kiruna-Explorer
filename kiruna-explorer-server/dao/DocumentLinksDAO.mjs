import db from "../db.mjs";

import Document from "../models/Document.mjs";

export default function DocumentLinksDAO() {

    this.addLink = (link) => {
    // TODO
    }

    this.getLinksByDocumentId = (id) => {
        query = "SELECT * FROM document_links WHERE doc1 = ?"
    
    }
}