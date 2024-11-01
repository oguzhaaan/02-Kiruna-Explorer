import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";


const router = express.Router();
const DocumentDao = new DocumentDAO();

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

export default router;