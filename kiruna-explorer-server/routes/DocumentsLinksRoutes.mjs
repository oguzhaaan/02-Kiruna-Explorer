import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";
import DocumentLinksDAO from "../dao/DocumentLinksDAO.mjs";
import { body, param, validationResult } from "express-validator";

const router = express.Router();
const DocumentDao = new DocumentDAO();
const DocumentLinksDao = new DocumentLinksDAO();

/* GET /api/documents/:DocId/links */
router.get("/:DocId/links",
    [
        param("DocId")
            .isNumeric()
            .withMessage("Document ID must be a valid number")
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const params = req.params;
            const documentId = params.DocId

            const documentLinks = await DocumentLinksDao.getLinksByDocumentId(documentId);
            const linkedDocuemnts = [];

            for (const link of documentLinks) {
                const doc = await DocumentDao.getDocumentById(link.linkedDocumentId);
                const linkedDocument = {
                    id: doc.id,
                    title: doc.title,
                    connection: link.connection
                };
                linkedDocuemnts.push(linkedDocument);
            }

            res.json(linkedDocuemnts);
        }
        catch (error) {
            console.error("Error in getDocumentById function:", error.message);
            throw new Error("Unable to get the document. Please check your connection and try again.");
        }
    }
);