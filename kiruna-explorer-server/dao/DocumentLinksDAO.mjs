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

    this.addLinktoDocument = (link) => {
        const query = "INSERT INTO document_link (doc1Id, doc2Id, date, connection) VALUES (?, ?, ?, ?)";
        return new Promise((resolve, reject) => {
            db.run(query, [link.doc1Id, link.doc2Id, link.date, link.connection], function(err) {
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
            db.run(query, [id, link.selectedDocId, link.date, link.connectionType], function(err) {
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
            db.all(query, [link.doc1Id, link.doc2Id,link.doc2Id, link.doc1Id, link.connection], (err, rows) => {
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