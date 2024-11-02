import db from "../db.mjs";
import Area from "../models/Area.mjs";

export default function AreaDAO() {
/*
    this.addArea = (area) => {
        const query = `
            INSERT INTO area (geoJson)
            VALUES (?)
        `;

        return new Promise((resolve, reject) => {
            db.run(query, [area.geoJson], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }
*/
    this.getAreaById = (id) => {
        const query = "SELECT * FROM area WHERE id = ?";

        return new Promise((resolve, reject) => {
            db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        const area = new Area(row.id, row.geoJson);
                        resolve(area);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    };
}