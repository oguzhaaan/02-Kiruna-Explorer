import db from "../db.mjs";

import Document from "../models/Document.mjs";

export default function DocumentDAO() {
    this.getDocumentById = (id) => {
        query = "SELECT * FROM documents WHERE id = ?";

        return new Promise((resolve, reject) => {
            db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                } else {
                    const document = new Document(row.id, row.title, row.stakeholders, row.date, row.type, row.language, row.description, row.areaid);
                    resolve(document);
                }
            });
        });
    }

}