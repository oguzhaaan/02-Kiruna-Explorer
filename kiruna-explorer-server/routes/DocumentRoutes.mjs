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

        // Check if areaId is provided, if not create a new area
        if (!areaId) {
            const latestAreaId = await AreaDao.getLatestAreaId();
            const newAreaId = latestAreaId + 1;
            const newArea = new Area(newAreaId, '{"type": "Feature", "geometry": {"type": "Point", "coordinates": [0.0, 0.0]}, "properties": {}}');
            areaId = await AreaDao.addArea(newArea);
        }

        // Add the document with the areaId
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