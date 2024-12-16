import db from "../db.mjs";

/**
 * Deletes all data from the database.
 * This function must be called before any integration test, to ensure a clean database state for each test run.
 */

export function cleanup() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Delete all data from the database.
            db.run("DELETE FROM attachment")
            db.run("DELETE FROM document_link")
            db.run("DELETE FROM document_stakeholder")
            db.run("DELETE FROM document_position")
            db.run("DELETE FROM document")
            db.run("DELETE FROM stakeholder")
            db.run("DELETE FROM document_type")
            db.run("DELETE FROM area")
            db.run("DELETE FROM file")
            
            // db.run("DELETE FROM users") 
            // users should stay so that we don't have to create them each time since there is no registration api

            // Make use of an empty sqlite call to invoke the callback
            // after all the other calls have completed
            db.run("", () => {
                if (resolve)
                    resolve()
                
            })
        })
    })
}