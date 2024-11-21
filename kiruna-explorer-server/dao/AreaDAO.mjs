import db from "../db.mjs";
import Area from "../models/Area.mjs";
import { AreaNotFound } from "../models/Area.mjs";

export default function AreaDAO() {

    this.addArea = (geoJson) => {
        const query = `
            INSERT INTO area (geoJson)
            VALUES (?)
        `;
        return new Promise( async (resolve, reject) => {

            const equalid = await this.compareAreas(geoJson)
            if(equalid) {
                return resolve(equalid) 
            }
            else {
                db.run(query, [geoJson], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
            }
            
        });
    }

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

    this.getAllAreas = () => {
        const query = "SELECT * FROM area";
        return new Promise((resolve, reject) => {
            db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const allAreas = rows.map((a)=>new Area(a.id,a.geoJson))
                    resolve(allAreas);
                }
            });
        });
    }

    this.deleteAreaById = (id) => {
        const query = "DELETE FROM area WHERE id = ?";
    
        return new Promise((resolve, reject) => {
            db.run(query, [id], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve("Area deleted successfully.");
            });
        });
    };

    this.compareAreas = (geoJson) => {
        const query = "SELECT * FROM area";
        
        return new Promise((resolve, reject) => {
            db.all(query,[], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                const equal = rows.filter((e)=>e.geoJson == geoJson)
                if (equal.length > 0) {resolve(equal[0].id)}
                else {resolve(undefined)}
            });
        });
    }
    
}