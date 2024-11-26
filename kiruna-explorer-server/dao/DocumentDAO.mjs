import db from "../db.mjs";
import Document from "../models/Document.mjs";
import { DocumentNotFound } from "../models/Document.mjs";
import { AreaNotFound } from "../models/Area.mjs";
import { InvalidArea } from "../models/Area.mjs";

export default function DocumentDAO(areaDAO) {

    // Simplified function to fetch documents and their stakeholders
    this.getAllDocuments = ({ type, title, stakeholders, startDate, endDate } = {}) => {
        // Build the base query with WHERE 1=1
        let query = `
            SELECT 
                document.id, 
                document.title, 
                document.date, 
                document.language, 
                document.description, 
                document.scale, 
                document.areaId, 
                document.pages, 
                document.planNumber,
                document_type.name AS type_name
            FROM document
            LEFT JOIN document_type ON document.typeId = document_type.id
            WHERE 1=1
        `;
        const params = [];

        // Apply filters if provided

        // Filter by document type
        if (type) {
            query += " AND document_type.name = ?";
            params.push(type);
        }

        // Filter by document title
        if (title) {
            query += " AND document.title LIKE ?";
            params.push(`%${title}%`);
        }

        // Filter by stakeholders if provided
        if (stakeholders && stakeholders.length > 0) {
            query += " AND document.id IN (SELECT DISTINCT documentId FROM document_stakeholder WHERE stakeholderId IN (" + stakeholders.map(() => "?").join(", ") + "))";
            params.push(...stakeholders);
        }

        // Filter by start date if provided
        if (startDate) {
            query += " AND document.date >= ?";
            params.push(startDate);
        }

        // Filter by end date if provided
        if (endDate) {
            query += " AND document.date <= ?";
            params.push(endDate);
        }

        // Execute the query to fetch documents
        return new Promise((resolve, reject) => {
            db.all(query, params, async (err, rows) => {
                if (err) {
                    return reject(err);
                } else {
                    // Fetch stakeholders and convert the DB rows to Document objects
                    try {
                        const documentsPromises = rows.map(async (row) => {
                            // Fetch stakeholders for the current document
                            const stakeholdersForDocument = await this.getStakeholdersForDocument(row.id);
                            
                            // Convert DB row to Document with stakeholders
                            const document = this.convertDBRowToDocument(row, stakeholdersForDocument);
                            document.type = row.type_name;  // Add document type

                            return document;
                        });

                        // Wait for all documents with stakeholders to be resolved
                        const documents = await Promise.all(documentsPromises);
                        resolve(documents);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    };

    // Fetch stakeholders for a given document (kept as a separate function)
    this.getStakeholdersForDocument = (documentId) => {
        const stakeholdersQuery = `
            SELECT stakeholder.id, stakeholder.name
            FROM stakeholder
            JOIN document_stakeholder ON stakeholder.id = document_stakeholder.stakeholderId
            WHERE document_stakeholder.documentId = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.all(stakeholdersQuery, [documentId], (err, stakeholdersRows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(stakeholdersRows);
                }
            });
        });
    };

    // Simplified function to fetch a document by ID
    this.getDocumentById = (id) => {
        const query = "SELECT * FROM document LEFT JOIN document_type ON document.typeId = document_type.id WHERE document.id = ?";
        
        return new Promise((resolve, reject) => {
            db.get(query, [id], async (err, row) => {
                if (err) {
                    return reject(err);
                } else if (!row) {
                    return reject(new DocumentNotFound());
                } else {
                    // Fetch stakeholders for the current document
                    const stakeholders = await this.getStakeholdersForDocument(row.id);
                    
                    // Convert DB row to Document with the fetched stakeholders
                    const document = this.convertDBRowToDocument(row, stakeholders);
                    document.type = row.type_name;  // Add document type

                    resolve(document);
                }
            });
        });
    };

    // Refactored function to filter documents by criteria
    this.getDocumentsByFilter = ({ type, title, stakeholders, startDate, endDate }) => {
        return this.getAllDocuments({ type, title, stakeholders, startDate, endDate });
    };



    this.getDocumentsByAreaId = (areaId) => {
        const query = "SELECT * FROM document WHERE areaId = ?";
        return new Promise((resolve, reject) => {
            db.all(query, [areaId], (err, rows) => {
                if (err) {
                    return reject(err);
                } else if (!Number.isInteger(areaId)) {
                    return reject(new InvalidArea());
                }
                else if (rows.length === 0) {
                    if (areaId == 1) return resolve([])
                    return reject(new DocumentNotFound());
                } else if (areaId === null && !areaDAO.getAllAreas().includes(areaId)) {
                    return reject(new AreaNotFound());

                }
                else {
                    resolve(rows.map(row => this.convertDBRowToDocument(row)));
                }
            });
        });
    }

    this.updateDocumentAreaId = async (documentId, newAreaId) => {
        try {
            // Validate the newAreaId
            if (!Number.isInteger(newAreaId) || newAreaId <= 0) {
                throw new InvalidArea();
            }

            // Fetch required data
            const [document, allDocuments, allAreas] = await Promise.all([
                this.getDocumentById(documentId),
                this.getAllDocuments(),
                areaDAO.getAllAreas(),
            ]);

            // Validate the current document and areas
            const oldAreaId = document.areaId;
            const areaIdsInDoc = allDocuments.map(doc => doc.areaId);
            const allAreaIds = allAreas.map(area => area.id);

            if (!areaIdsInDoc.includes(oldAreaId) || !allAreaIds.includes(newAreaId)) {
                throw new AreaNotFound();
            }

            if (oldAreaId == newAreaId) return true;

            // Update the document's areaId to newAreaId
            await new Promise((resolve, reject) => {
                const updateQuery = "UPDATE document SET areaId = ? WHERE id = ?";
                db.run(updateQuery, [newAreaId, documentId], function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });

            // Re-fetch documents to check if oldAreaId is still in use
            const updatedDocuments = await this.getAllDocuments();
            const updatedAreaIdsInDoc = updatedDocuments.map(doc => doc.areaId);

            // If oldAreaId is no longer in use, delete it
            if (!updatedAreaIdsInDoc.includes(oldAreaId) && oldAreaId!=1) {
                await areaDAO.deleteAreaById(oldAreaId);
            }

            return true; // Successfully updated and cleaned up old area if necessary
        } catch (error) {
            // Handle errors appropriately
            throw error;
        }
    };

    this.addDocument = (documentData) => {
        // Converti il documento per l'inserimento nel database
        const dbDocument = this.convertDocumentForDB(documentData);

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
            areaId: documentData.areaId ? documentData.areaId : null,
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

    this.convertDBRowToDocument = (row, stakeholders) => {
        // Create a new Document instance with the fetched stakeholders
        return new Document(
            row.id,
            row.title,
            stakeholders, // Array of stakeholders passed from the `getStakeholdersForDocument` function
            row.date,
            row.type,
            row.language,
            row.description,
            row.areaId,
            row.scale,
            row.pages,
            row.planNumber
        );
    };
    
}