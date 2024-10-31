import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";

const router = express.Router();

/* GET /api/documents/:DocId */
router.get("/:DocId", async (req, res) => {
    const documentId = req.params.DocId;
    try {
        const document = await DocumentDAO.getDocumentById(req.params.documentId);
        res.json(document);
    } catch (err) {
        res.status(500).json({ error: err });
    }
})