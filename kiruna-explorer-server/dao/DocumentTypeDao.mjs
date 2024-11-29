import db from "../db.mjs";
import DocumentType from "../models/DocumentType.mjs";
import { InvalidDocumentType, DocumentTypeNotFound, DocumentTypeNameAlreadyExists } from "../models/DocumentType.mjs";

export default function DocumentTypeDAO() {

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

