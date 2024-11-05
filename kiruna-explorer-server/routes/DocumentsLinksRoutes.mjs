import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";
import DocumentLinksDAO from "../dao/DocumentLinksDAO.mjs";
import { body, param, validationResult } from "express-validator";

const router = express.Router();
const DocumentDao = new DocumentDAO();
const DocumentLinksDao = new DocumentLinksDAO();

router.get("/DocId/links",
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
            
            // Get all the links for the given document
            const documentLinks = await DocumentLinksDao.getLinksByDocumentId(documentId);
            
            const linkedDocuemnts = [];
       
            for (const link of documentLinks) {
                try {
                    // given  document id could be either stored in doc1Id column or doc2Id column
                    const linkedDocumentId = link.doc1Id == documentId ? link.doc2Id : link.doc1Id
                   
                    //find all info of the linked document
                    const doc = await DocumentDao.getDocumentById(linkedDocumentId);
                  
                    const linkedDocument = {
                        id: doc.id,
                        title: doc.title,
                        connection: link.connection
                    };
                    linkedDocuemnts.push(linkedDocument);
                }
                catch (error) {
                    console.error("Error in getDocumentById function:", error.message);
                    throw new Error("Unable to get the document. Please check your connection and try again.");
                }
            }

            res.json(linkedDocuemnts);
        }
        catch (error) {
            console.error("Error in getDocumentById function:", error.message);
            throw new Error("Unable to get the linked documents. Please check your connection and try again.");
        }
    }
);

/* POST /api/documents/:DocId/links */
router.post("/:DocId/links",
    [
        body("DocId1")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
        body("DocId2")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
        body("connection")
            .isString()
            .withMessage("Type must be a string"),
        body("date")
            .isString()
            .withMessage("Date must be a string"),
    ],

    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //check if connection type is valid
        const connections = ["direct_consequence", "collateral_consequence", "prevision", "update"];

        if (!connections.includes(req.body.connection)) {
            return res.status(400).json({ error: "Invalid connection type" });
        }

        try {
            const result = await DocumentLinksDao.addLinktoDocument(req.body);
            res.json({ message: "Link added successfully" });
        } catch (error) {
            console.error("Error in addLinktoDocument function:", error.message);
            throw new Error("Unable to add the link. Please check your connection and try again.");
        }
    }
)

export default router