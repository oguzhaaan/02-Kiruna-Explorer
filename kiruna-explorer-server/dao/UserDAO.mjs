import crypto from 'node:crypto'
import db from "../db.mjs";
import {User} from "../models/User.mjs";

export default function UserDAO() {
  this.getUser = (username, password) => {
    return new Promise((resolve, reject) => {
      const query = `
          SELECT *
          FROM users
          WHERE username = ?`;
      db.get(query, [username], (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          resolve(false);
        } else {
          const user = new User(row.id, row.role, row.username);
          //console.log(user);

          crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) {
            if (err) reject(err);
            if (
              !crypto.timingSafeEqual(
                Buffer.from(row.password, "hex"),
                hashedPassword
              )
            )
              resolve(false);
            else resolve(user);
          });
        }
      });
    });
  };
}
