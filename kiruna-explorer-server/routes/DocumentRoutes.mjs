import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";
import { body, param, validationResult } from "express-validator";
import AreaDAO from "../dao/AreaDAO.mjs";
import Area from "../models/Area.mjs";
import DocumentLinksDAO from "../dao/DocumentLinksDAO.mjs";
import Link from "../models/Link.mjs";

const router = express.Router();
const DocumentDao = new DocumentDAO();
const AreaDao = new AreaDAO();
const DocumentLinksDao = new DocumentLinksDAO();


/* GET /api/documents/:DocId */
router.get("/:DocId",
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

            const document = await DocumentDao.getDocumentById(documentId);
            res.json(document);
        } catch (err) {
            console.error("Error fetching document:", err);
            res.status(500).json({ error: err });
        }
    });

/* POST /api/documents */
router.post("/",
    [
        body("title").notEmpty().withMessage("Title is required"),
        body("scale").notEmpty().withMessage("Scale is required"),
        body("date").notEmpty().withMessage("Date is required"),
        body("type").notEmpty().withMessage("Type is required"),
        body("language").optional(),
        body("number").optional().isNumeric().withMessage("Page number must be a number"),
        body("description").notEmpty().withMessage("Description is required"),
        body("areaId").optional().isNumeric().withMessage("Area ID must be a number"),
        body("stakeholder")
            .isArray().withMessage("Stakeholder must be an array") 
            .notEmpty().withMessage("Stakeholder is required")
            .custom((value) => {
                value.forEach((element) => {
                    if (typeof element !== 'string') {
                        throw new Error('Each stakeholder must be a string');
                    }
                });
                return true; 
            }),
        body("planNumber")
            .if((value, { req }) => req.body.scale === "plan")
            .notEmpty().withMessage("Plan number is required when scale is 'plan'")
            .isNumeric().withMessage("Plan number must be a number"),
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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

            //TODO add id to return response
            await DocumentDao.addDocument(newDocument);
            res.json({ message: "Document added successfully" });
        } catch (err) {
            console.error("Error adding document:", err);
            res.status(500).json({ error: err.message });
        }
    });


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
            console.log(documentId)
            
            // Get all the links for the given document
            const documentLinks = await DocumentLinksDao.getLinksByDocumentId(documentId);
            
            const linkedDocuemnts = [];
       
            for (const link of documentLinks) {
                try {
                    // given  document id could be either stored in doc1Id column or doc2Id column
                    const linkedDocumentId = link.doc1Id == documentId ? link.doc2Id : link.doc1Id
                   
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


/* POST /api/documents/links */

router.post("/links",
    [
        body("doc1Id")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
        body("doc2Id")
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
        console.log("here")
        const newLink = new Link(null, req.body.doc1Id, req.body.doc2Id, req.body.date, req.body.connection);
        //check if link already exists
        try {
            const linkExists = await DocumentLinksDao.isLink(newLink);
            if (linkExists) {
                return res.status(400).json({ error: "Link already exists" });
            }
        } catch (error) {
            console.error("Error in linkExists function:", error.message);
            throw new Error("Unable to check if link already exists. Please check your connection and try again.");
        }

        //check if documents exist
        try {
            const doc1Exists = await DocumentDao.getDocumentById(req.body.doc1Id);
            if (!doc1Exists) {
                return res.status(404).json({ error: "Document 1 not found" });
            }
            const doc2Exists = await DocumentDao.getDocumentById(req.body.doc2Id);
            if (!doc2Exists) {
                return res.status(404).json({ error: "Document 2 not found" });
            }
        } catch (error) {
            console.error("Error in isLink function:", error.message);
            throw new Error("Unable to check if documents exist. Please check your connection and try again.");
        }

        try {
        
            const result = await DocumentLinksDao.addLinktoDocument(newLink);
            res.json({ message: "Link added successfully" });
        
        }   catch (error) {
            console.error("Error in addLinktoDocument function:", error.message);
            throw new Error("Unable to add the link. Please check your connection and try again.");
        }
    }
); 

/* router.post("/links",
   [
       body().notEmpty().withMessage("There should be at least one connection"),
   ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } 
       // console.log(req.body[0])
        //check if connection type is valid
        for (let i = 0; i < req.body.length; i++) {
            const link = req.body[i];
        
            const connections = ["direct_consequence", "collateral_consequence", "prevision", "update"];
    
            if (!connections.includes(link.connection)) {
                console.log(link.connection)
                return res.status(400).json({ error: "Invalid connection type" });
            }
            
            //check if link already exists
            try {
                const linkExists = await DocumentLinksDao.isLink(link);
                if (linkExists) {
                    return res.status(400).json({ error: "Link already exists" });
                }
            } catch (error) {
                console.error("Error in linkExists function:", error.message);
                throw new Error("Unable to check if link already exists. Please check your connection and try again.");
            }
            
            //check if documents exist
            try {
                const doc1Exists = await DocumentDao.getDocumentById(link.docId1);
                if (!doc1Exists) {
                    return res.status(404).json({ error: "Document 1 not found" });
                }
                const doc2Exists = await DocumentDao.getDocumentById(link.docId2);
                if (!doc2Exists) {
                    return res.status(404).json({ error: "Document 2 not found" });
                }
            } catch (error) {
                console.error("Error in isLink function:", error.message);
                throw new Error("Unable to check if documents exist. Please check your connection and try again.");
            }
            
            
            try {
                
                const newLink = new Link(null, link.docId1, link.docId2, link.date, link.connection);
                const result = await DocumentLinksDao.addLinktoDocument(newLink);
                res.json({ message: "Links added successfully" });
                
            }   catch (error) {
                console.error("Error in addLinktoDocument function:", error.message);
                throw new Error("Unable to add the link. Please check your connection and try again.");
            }
        }
    }
); 
 */


export default router;