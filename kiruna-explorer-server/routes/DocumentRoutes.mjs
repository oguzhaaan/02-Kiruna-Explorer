import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";
import AreaDAO from "../dao/AreaDAO.mjs";
import Area from "../models/Area.mjs";
const router = express.Router();
const DocumentDao = new DocumentDAO();
const AreaDao = new AreaDAO();

/* GET /api/documents/:DocId */
router.get("/:DocId", async (req, res) => {
    
    try {
        const params = req.params;
        const documentId = params.DocId

        const document = await DocumentDao.getDocumentById(documentId);
        res.json(document);
    } catch (err) {
        console.error("Error fetching document:", err);
        res.status(500).json({ error: err });
    }
})

/* POST /api/documents */
router.post("/", async (req, res) => {
    try {
        const params = req.body;
        let areaId = params.areaId;

        // If areaId is provided, verify if it exists
        if (areaId) {
            const areaExists = await AreaDao.getAreaById(areaId);
            if (!areaExists) {
                return res.status(404).json({ error: "Area not found" });
            }
        } else {
            // If areaId is not provided, set it to null
            areaId = null;
        }

        // Add the document with the areaId (which could be null)
        const newDocument = {
            ...params,
            areaId: areaId
        };

        await DocumentDao.addDocument(newDocument);
        res.json({ message: "Document added successfully" });
    } catch (err) {
        console.error("Error adding document:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;