import db from "../db.mjs";
import Document from "../models/Document.mjs";
import { DocumentNotFound } from "../models/Document.mjs";

export default function DocumentDAO() {
    this.getDocumentById = (id) => {
        const query = "SELECT * FROM document WHERE id = ?";

        return new Promise((resolve, reject) => {
            db.get(query, [id], (err, row) => {
                if (err) {
                    return reject(err);
                } else if (row === undefined) {
                    return reject(new DocumentNotFound());
                } else {
                    // Converti la riga del database in un oggetto Document
                    console.log(row);
                    const document = this.convertDBRowToDocument(row);
                    console.log(document);
                    resolve(document);
                }
            });
        });
    };

    this.addDocument = (documentData) => {
        // Converti il documento per l'inserimento nel database
        const dbDocument = this.convertDocumentForDB(documentData);
        console.log(dbDocument);

        // Query per inserire il documento
        const insertDocumentQuery = `
            INSERT INTO document (title, date, type, language, description, scale, areaId, pages, planNumber, lkab, municipality, regional_authority, architecture_firms, citizens, others)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        return new Promise((resolve, reject) => {
            db.run(insertDocumentQuery, [
                dbDocument.title,
                dbDocument.date,
                dbDocument.type,
                dbDocument.language,
                dbDocument.description,
                dbDocument.scale,
                dbDocument.areaId,
                dbDocument.pages,
                dbDocument.planNumber,
                dbDocument.lkab,
                dbDocument.municipality,
                dbDocument.regional_authority,
                dbDocument.architecture_firms,
                dbDocument.citizens,
                dbDocument.others
            ], function (err) {
                if (err) {
                    console.log(err)
                    return reject(err); // Rifiuta la promessa in caso di errore
                }
                resolve(this.lastID); // Risolvi la promessa con l'ID del documento inserito
            });
        });
    };

    this.convertDocumentForDB = (documentData) => {
        return {
            title: documentData.title,
            date: documentData.date,
            type: documentData.type,
            language: documentData.language,
            description: documentData.description,
            scale: documentData.scale,
            areaId: documentData.areaId ? documentData.areaId:null,
            pages: documentData.pages,
            planNumber: documentData.planNumber,
            lkab: documentData.stakeholders.includes("lkab"),
            municipality: documentData.stakeholders.includes("municipality"),
            regional_authority: documentData.stakeholders.includes("regional authority"),
            architecture_firms: documentData.stakeholders.includes("architecture firms"),
            citizens: documentData.stakeholders.includes("citizens"),
            others: documentData.stakeholders.includes("others"),
        };
    };

    this.convertDBRowToDocument = (row) => {
        const stakeholders = [];
        if (row.lkab) stakeholders.push("lkab");
        if (row.municipality) stakeholders.push("municipality");
        if (row.regional_authority) stakeholders.push("regional authority");
        if (row.architecture_firms) stakeholders.push("architecture firms");
        if (row.citizens) stakeholders.push("citizens");
        if (row.others) stakeholders.push("others");

        return new Document(
            row.id,
            row.title,
            stakeholders, // Array di stakeholder
            row.date,
            row.type,
            row.language,
            row.description,
            row.areaId,
            row.scale, // Aggiunto pages
            row.pages,
            row.planNumber
        );
    };
}