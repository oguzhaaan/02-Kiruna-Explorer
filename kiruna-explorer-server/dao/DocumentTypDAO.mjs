import db from "../db.mjs";
import DocumentType from "../models/DocumentType.mjs";
import { InvalidDocumentType, DocumentTypeNotFound, DocumentTypeNameAlreadyExists } from "../models/DocumentType.mjs";

export default function DocumentTypDAO() {

    this.getAllDocumentTypes = async () => {
        const query = `SELECT * FROM document_type`;
        return new Promise((resolve, reject) => {
            db.all(query, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                const documentTypes = rows.map(row => new DocumentType(row.id, row.name));
                resolve(documentTypes);
            });
        });
    };

    this.getDocumentTypeByName = async (name) => {
        const query = `SELECT * FROM document_type WHERE name = ?`;
        return new Promise((resolve, reject) => {
            db.get(query, [name], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    };

    this.getDocumentTypeById = async (id) => {
        const query = `SELECT * FROM document_type WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.get(query, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    };

    this.addDocumentType = async (typeName) => {
        if (!typeName || typeof typeName !== 'string') {
            throw new InvalidDocumentType();
        }

        //check if the type name already exists
        const existingType = await this.getDocumentTypeByName(typeName);
        if (existingType) {
            throw new DocumentTypeNameAlreadyExists();
        }

        const insertQuery = `
            INSERT INTO document_type (name)
            VALUES (?)
        `;

        return new Promise((resolve, reject) => {
            db.run(insertQuery, [typeName], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            });
        });
    };
}

