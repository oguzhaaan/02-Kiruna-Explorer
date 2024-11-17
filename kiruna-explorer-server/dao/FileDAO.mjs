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
                            resolve(this.lastID);
                        }
                    });
                }
            });
        });
    }
}