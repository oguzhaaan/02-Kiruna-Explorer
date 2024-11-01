import db from "../db.mjs";

import Document from "../models/Document.mjs";

export default function DocumentDAO() {
    this.getDocumentById = (id) => {
        const query = "SELECT * FROM document WHERE id = ?";

        return new Promise((resolve, reject) => {
            db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                } else {
                    const document = new Document(row.id, row.title, row.stakeholders, row.date, row.type, row.language, row.description, row.areaId);
                    resolve(document);
                }
            });
        });
    }

    this.addDocument = (document) => {
        const query = `
            INSERT INTO document (title, stakeholders, date, type, language, description, areaId)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            db.run(query, [
                document.title,
                document.stakeholders,
                document.date,
                document.type,
                document.language,
                document.description,
                document.areaId
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    

}