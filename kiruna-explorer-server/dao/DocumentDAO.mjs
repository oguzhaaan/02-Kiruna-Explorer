import db from "../db.mjs";
import Document from "../models/Document.mjs";
import DocumentPositionDAO from "./DocumentPositionDAO.mjs";
import { DocumentNotFound } from "../models/Document.mjs";
import { AreaNotFound } from "../models/Area.mjs";
import { InvalidArea } from "../models/Area.mjs";
import { InvalidDocumentPosition } from "../models/DocumentPosition.mjs";
import { YScalePosition, getXDatePosition, getYPlanScale } from "../Utilities/DiagramReferencePositions.js";

export default function DocumentDAO(areaDAO) {
    const documentPositionDAO = new DocumentPositionDAO();

    const executeQuery = (query, params) => {
        return new Promise((resolve, reject) => {
            db.run(query, params, function (err) {
                if (err) return reject(err);
                resolve(this);
            });
        });
    };

    this.upsertDocumentPosition = async ({ docId, x, y }) => {
        try {
            const allDocs = await this.getAllDocuments();

            const years = allDocs.map(doc => parseInt(doc.date.split("-")[0], 10));
            console.log(years);

            const minYear = Math.min(...years);

            const document = await this.getDocumentById(docId);
            if (!document) {
                throw new DocumentNotFound("Document not found");
            }

            const { date, scale, planNumber } = document;

            const year = parseInt(date.split('-')[0], 10); // extract year from the date (assumes format "YYYY-MM-DD")
            if (!year || year < 0) {
                throw new InvalidDocumentPosition("Invalid year or date for position boundaries");
            }
            // boundary calculations for X
            const yearStartX = getXDatePosition(minYear-1, year, 1); // start of the year (month=1)
            const yearEndX = getXDatePosition(minYear-1, year, 12) + 5; // end of the year (month=12)
            const limitedX = Math.max(yearStartX, Math.min(x, yearEndX));

            // boundary calculations for Y
            let minY, maxY;
            if (scale.startsWith("plan")) {
                const planY = getYPlanScale(planNumber);
                minY = planY - 30;
                maxY = planY + 30;
            } else {
                minY = YScalePosition[scale] - 100;
                maxY = YScalePosition[scale] + 100;
            }
         
            
            const limitedY = Math.max(minY, Math.min(y, maxY));
            if (x !== limitedX || y !== limitedY) {
                throw new InvalidDocumentPosition("Position exceeds boundaries");
            }
            
            const existingPositions = await documentPositionDAO.getDocumentPosition(docId);
            if (existingPositions.length > 0) {
                const existingPosition = existingPositions[0];

                if (existingPosition.x === limitedX && existingPosition.y === limitedY) {
                    return {
                        lastId: docId,
                        message: "Position is already up-to-date",
                    };
                }

                const updateQuery =
                    "UPDATE document_position SET x = ?, y = ? WHERE docId = ?";
                await executeQuery(updateQuery, [limitedX, limitedY, docId]);
            } else {
                const insertQuery =
                    "INSERT INTO document_position (docId, x, y) VALUES (?, ?, ?)";
                await executeQuery(insertQuery, [docId, limitedX, limitedY]);
            }

            return {
                lastId: docId,
                message: "Document moved successfully in the diagram",
            };
        } catch (error) {
            if (error instanceof DocumentNotFound) {
                throw new Error("400 Not Found");
            } else if (error instanceof InvalidDocumentPosition) {
                throw new Error("400 Bad Request");
            } else {
                console.error("Unexpected error:", error);
                throw new Error("500 Internal Server Error");
            }
        }
    };



    this.getDocumentsWithPagination = ({ type, title, stakeholders, startDate, endDate, offset = 0 } = {}) => {
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
            // Normalizzare accapi nel database durante la query
            query += `
                AND (
                    document.title LIKE ? 
                    OR REPLACE(REPLACE(document.description, CHAR(13), ' '), CHAR(10), ' ') LIKE ?
                )
            `;
            params.push(`%${title}%`, `%${title}%`);
        }

        // Filter by stakeholders if provided
        if (stakeholders && stakeholders.length > 0) {
            query += `
                AND document.id IN (
                    SELECT documentId 
                    FROM document_stakeholder 
                    JOIN stakeholder ON stakeholder.id = document_stakeholder.stakeholderId
                    WHERE stakeholder.name IN (${stakeholders.map(() => "?").join(", ")})
                )
            `;
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

        // Add pagination
        const limit = 5; // Fixed limit
        query += " LIMIT ? OFFSET ?";
        params.push(limit, offset);


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

        if (title) {
    query += ` AND document.title = ?`;
    params.push(title);
}


        // Filter by stakeholders if provided
        if (stakeholders && stakeholders.length > 0) {
            query += `
                AND document.id IN (
                    SELECT documentId 
                    FROM document_stakeholder 
                    JOIN stakeholder ON stakeholder.id = document_stakeholder.stakeholderId
                    WHERE stakeholder.name IN (${stakeholders.map(() => "?").join(", ")})
                )
            `;
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
        const query = `
            SELECT document.*, document_type.name AS type_name 
            FROM document 
            LEFT JOIN document_type ON document.typeId = document_type.id 
            WHERE document.id = ?
        `;

        return new Promise((resolve, reject) => {
            db.get(query, [id], async (err, row) => {
                if (err) return reject(err);
                if (!row) return reject(new DocumentNotFound());

                try {
                    const stakeholders = await this.getStakeholdersForDocument(row.id);
                    const document = this.convertDBRowToDocument(row, stakeholders);
                    document.type = row.type_name || "Unknown"; // Handle missing type gracefully
                    resolve(document);
                } catch (error) {
                    reject(error);
                }
            });
        });
    };


    // Refactored function to filter documents by criteria
    this.getDocumentsByFilter = ({ type, title, stakeholders, startDate, endDate }) => {
        return this.getAllDocuments({ type, title, stakeholders, startDate, endDate });
    };




    this.getDocumentsByAreaId = (areaId) => {
        const query = "SELECT d.id, d.title, d.date, dt.name as type, d.language, d.description, d.scale, d.areaId, d.pages, d.planNumber FROM document AS d, document_type AS dt WHERE areaId = ? AND d.typeId = dt.id";
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
            if (!updatedAreaIdsInDoc.includes(oldAreaId) && oldAreaId != 1) {
                await areaDAO.deleteAreaById(oldAreaId);
            }

            return true; // Successfully updated and cleaned up old area if necessary
        } catch (error) {
            // Handle errors appropriately
            throw error;
        }
    };

    this.addDocument = async (documentData) => {
        try {
            console.log("Received document data:", documentData);

            // Convert input data into a format suitable for the database
            const dbDocument = this.convertDocumentForDB(documentData);

            // SQL query to insert a new document
            const insertDocumentQuery = `
                INSERT INTO document (title, date, typeId, language, description, scale, areaId, pages, planNumber)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Insert the document and retrieve the new document ID
            const documentId = await new Promise((resolve, reject) => {
                db.run(insertDocumentQuery, [
                    dbDocument.title,
                    dbDocument.date,
                    dbDocument.typeId,
                    dbDocument.language,
                    dbDocument.description,
                    dbDocument.scale,
                    dbDocument.areaId,
                    dbDocument.pages,
                    dbDocument.planNumber
                ], function (err) {
                    if (err) {
                        console.error("Error inserting document:", err.message);
                        return reject(err);
                    }
                    resolve(this.lastID); // Fetch document ID using proper context
                });
            });

            // Check if documentId is valid
            if (!documentId) {
                throw new Error("Failed to retrieve the documentId after insertion");
            }

            // Add stakeholders to the document
            await this.addStakeholders(documentId, dbDocument.stakeholders);

            console.log(`Document with ID ${documentId} added successfully`);
            return documentId; // Return the newly created document ID
        } catch (error) {
            console.error("Error adding document:", error.message);
            throw error; // Re-throw the error to the caller
        }
    };






    this.convertDocumentForDB = (documentData) => {
        // Map stakeholders to their IDs. Handle both array of IDs and array of objects with 'value'
        const stakeholders = documentData.stakeholders?.map(stakeholder =>
            typeof stakeholder === "object" ? stakeholder.value : stakeholder
        ) || [];

        return {
            title: documentData.title,
            date: documentData.date,
            typeId: documentData.typeId, // Assuming this is provided in the documentData
            language: documentData.language,
            description: documentData.description,
            scale: documentData.scale,
            areaId: documentData.areaId || null, // Default to null if areaId is not provided
            pages: documentData.pages,
            planNumber: documentData.planNumber,
            stakeholders: stakeholders  // Array of stakeholder IDs
        };
    };


    // Method to associate the document with stakeholders
    this.addStakeholders = (documentId, stakeholderIds) => {
        // Return immediately if there are no stakeholders
        if (!stakeholderIds || stakeholderIds.length === 0) {
            return Promise.resolve();
        }

        const values = stakeholderIds.map(stakeholderId => [documentId, stakeholderId]);
        const placeholders = values.map(() => "(?, ?)").join(", ");
        const query = `
            INSERT INTO document_stakeholder (documentId, stakeholderId)
            VALUES ${placeholders}
        `;
        const flattenedValues = values.flat();

        return new Promise((resolve, reject) => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject(err); // Handle transaction start error

                db.run(query, flattenedValues, (err) => {
                    if (err) {
                        return db.run("ROLLBACK", (rollbackErr) => {
                            if (rollbackErr) {
                                console.error("Rollback failed:", rollbackErr.message);
                            }
                            reject(err); // Reject with the original error
                        });
                    }

                    db.run("COMMIT", (commitErr) => {
                        if (commitErr) {
                            console.error("Commit failed:", commitErr.message);
                            return reject(commitErr);
                        }
                        resolve();
                    });
                });
            });
        });
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