import db from "../db.mjs";

export default function FileDAO() {

    this.storeFile = (docId, file) => {
        return new Promise((resolve, reject) => {

            const query = `
                INSERT INTO file (name, type, path)
                VALUES (?, ?,?)`;
            db.run(query, [file.name, file.type, file.path], function (err) {
                if (err) {
                    reject(err);
                } else {
                    const fileId = this.lastID;
                    const query2 = `INSERT INTO attachment (docId, fileId) VALUES (?, ?)`;
                    db.run(query2, [docId, fileId], function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve([this.lastID,fileId]);
                        }
                    });
                }
            });
        });
    }

    this.getFilesByDocumentId = (docId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT *
                FROM file
                INNER JOIN attachment ON file.id = attachment.fileId
                WHERE attachment.docId = ?`;
            
            db.all(query, [docId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };


    this.deleteFile = (FileId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM file WHERE id = ?`;
            db.run(query, [FileId], function (err) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(this.changes);
                    resolve(this.changes);
                }
            });
        });
    }

    this.getFilePathById = (id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM file WHERE id = ?";
            db.get(query, [id], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(undefined)
                console.log(row);
                return resolve(row.path);
                
            });
        });
    }
}