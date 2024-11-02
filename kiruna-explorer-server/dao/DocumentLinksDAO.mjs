import db from "../db.mjs";

import Link from "../models/Link.mjs";

export default function DocumentLinksDAO() {

    this.addLink = (link) => {
    // TODO
    }

    this.getLinksByDocumentId = (id) => {
        query = "SELECT * FROM document_links WHERE doc1 = ?";
        return new Promise((resolve, reject) => {
            db.all(query, [id, id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const links = rows.map(row => new Link(row.id, row.doc1, row.doc2, row.date, row.connection));
                    resolve(links);
                }
            });
        });

    
    }
}