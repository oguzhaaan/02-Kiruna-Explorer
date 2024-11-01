import db from "../db.mjs";
import Area from "../models/Area.mjs";

export default function AreaDAO() {
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

    this.getLatestAreaId = () => {
        const query = "SELECT MAX(id) as maxId FROM area";

        return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.maxId || 0); // Return 0 if no areas exist
                }
            });
        });
    };


}