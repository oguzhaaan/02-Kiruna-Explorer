import db from "../db.mjs";

import Link from "../models/Link.mjs";

export default function DocumentLinksDAO() {

    this.checkLinkExists = (originalDocId, selectedDocId, connectionType) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id FROM document_link 
                WHERE (doc1Id = ? AND doc2Id = ? AND connection = ?)
                OR (doc1Id = ? AND doc2Id = ? AND connection = ?);
            `;

            db.get(query, [originalDocId, selectedDocId, connectionType, selectedDocId, originalDocId, connectionType], (err, row) => {
                if (err) {
                    console.error("Error checking if link exists:", err);
                    return reject(err);
                }
                resolve(row); // Se row è presente, significa che la connessione esiste
            });
        });
    };

    this.deleteAll = (documentId) => {
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM document_link 
                WHERE doc1Id = ? OR doc2Id = ?;
            `;

            db.run(query, [documentId, documentId], function (err) {
                if (err) {
                    console.error("Error deleting links:", err);
                    return reject(err);
                }
                resolve({ deletedCount: this.changes }); // Restituisce il numero di righe cancellate
            });
        });
    };

    this.deleteLinks = async (links) => {
        if (links.length === 0) return;
    
        const originalDocId = links[0].originalDocId;
    
        // Creiamo l'elenco dei link da mantenere
        const linksToKeep = links.map(link => ({
            doc1Id: link.originalDocId,
            doc2Id: link.selectedDocId,
            connection: link.connectionType
        }));
    
        return new Promise((resolve, reject) => {
            // Trova i link attualmente presenti nel database associati al documento originale
            const querySelect = `
                SELECT id, doc1Id, doc2Id, connection 
                FROM document_link
                WHERE doc1Id = ? OR doc2Id = ?;
            `;
    
            db.all(querySelect, [originalDocId, originalDocId], (err, rows) => {
                if (err) {
                    console.error("Errore durante il recupero dei link:", err);
                    return reject(new Error("Unable to retrieve links for deletion."));
                }
    
                // Filtra i link da eliminare: quelli associati al documento che non sono più nei linksToKeep
                const idsToDelete = rows
                    .filter(row => !linksToKeep.some(link =>
                        (link.doc1Id === row.doc1Id && link.doc2Id === row.doc2Id && link.connection === row.connection) ||
                        (link.doc1Id === row.doc2Id && link.doc2Id === row.doc1Id && link.connection === row.connection)
                    ))
                    .map(row => row.id);
    
                if (idsToDelete.length === 0) {
                    // Non ci sono link da eliminare
                    return resolve();
                }
    
                // Query per eliminare i link
                const queryDelete = `
                    DELETE FROM document_link
                    WHERE id IN (${idsToDelete.join(", ")});
                `;
    
                db.run(queryDelete, function (err) {
                    if (err) {
                        console.error("Errore durante l'eliminazione dei link:", err);
                        return reject(new Error("Unable to delete the links."));
                    }
    
                    resolve();
                });
            });
        });
    };


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

    this.addLinktoDocument = (link) => {
        const query = "INSERT INTO document_link (doc1Id, doc2Id, date, connection) VALUES (?, ?, ?, ?)";
        return new Promise((resolve, reject) => {
            db.run(query, [link.doc1Id, link.doc2Id, link.date, link.connection], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    this.addLinkstoDocumentAtInsertionTime = (link, id) => {
        const query = "INSERT INTO document_link (doc1Id, doc2Id, date, connection) VALUES (?, ?, ?, ?)";
        return new Promise((resolve, reject) => {
            db.run(query, [id, link.selectedDocId, link.date, link.connectionType], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }


    this.isLink = (link) => {
        const query = "SELECT * FROM document_link WHERE ((doc1Id = ? AND doc2Id = ?) OR (doc1Id = ? AND doc2Id = ?)) AND connection = ?";
        return new Promise((resolve, reject) => {
            db.all(query, [link.doc1Id, link.doc2Id, link.doc2Id, link.doc1Id, link.connection], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.length > 0);
                }
            });
        });
    }
    this.getPossibleLinks = (id) => {
        const query = "SEELCT * FROM document WHERE id != ?";
        return new Promise((resolve, reject) => {
            db.all(query, [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}