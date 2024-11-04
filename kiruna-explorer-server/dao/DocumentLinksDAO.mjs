import db from "../db.mjs";

import Link from "../models/Link.mjs";

export default function DocumentLinksDAO() {

    this.addLink = (link) => {
    // TODO
    }

    this.getLinksByDocumentId = (id) => {
        const query = "SELECT * FROM document_link WHERE doc1Id = ? or doc2Id = ?";
        return new Promise((resolve, reject) => {
            db.all(query, [id, id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const links = rows.map(row => new Link(row.id, row.doc1Id, row.doc2Id, row.date, row.connection));
                    resolve(links);
                }
            });
        });

    
    }
}