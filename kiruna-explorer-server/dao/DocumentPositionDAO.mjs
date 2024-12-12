import DocumentPosition from "../models/DocumentPosition.mjs";
import db from "../db.mjs";

export default function DocumentPositionDAO() {

    this.getDocumentPosition = async (docId) => {
        const query = `SELECT * FROM document_position WHERE docId = ?`;
        return new Promise((resolve, reject) => {
            db.all(query, [docId], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                const documentPositions = rows.map(row => new DocumentPosition(row.id, row.docId, row.x, row.y));
                resolve(documentPositions);
            });
        });
    }
}