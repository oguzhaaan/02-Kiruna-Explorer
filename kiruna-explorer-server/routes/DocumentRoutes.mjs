import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";
import { body, param, validationResult } from "express-validator";
import AreaDAO from "../dao/AreaDAO.mjs";
import Area from "../models/Area.mjs";
import DocumentLinksDAO from "../dao/DocumentLinksDAO.mjs";
import Link from "../models/Link.mjs";
import { isLoggedIn } from "../auth/authMiddleware.mjs";
import { InvalidArea, AreaNotFound } from "../models/Area.mjs";
import { DocumentNotFound } from "../models/Document.mjs";
const router = express.Router();
const DocumentDao = new DocumentDAO();
const AreaDao = new AreaDAO();
const DocumentLinksDao = new DocumentLinksDAO();


router.get("/",
    async (req, res) => {
        try {
            const documents = await DocumentDao.getAllDocuments();

            res.status(200).json(documents);
        }
        catch (error) {
            console.error("Error in getAllDocuments function:", error.message);
            res.status(500).json({ error: err.message });
        }
    }
);

/* GET /api/documents/:DocId */
router.get("/:DocId", isLoggedIn,
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
            res.status(200).json(document);
        } catch (err) {
            console.error("Error fetching document:", err);
            res.status(err.status).json({ error: err });
        }
    })

/* GET /api/documents/area/:areaId */
router.get("/area/:areaId", isLoggedIn,
    [
        param("areaId")
            .isInt().withMessage("Area ID must be a valid integer")
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const areaId = parseInt(req.params.areaId, 10);
            const documents = await DocumentDao.getDocumentsByAreaId(areaId);
            res.status(200).json(documents);
        } catch (err) {
            console.error("Error fetching documents by area:", err);

            if (err instanceof InvalidArea) {
                res.status(400).json({ error: "Invalid area ID" });
            } else if (err instanceof DocumentNotFound) {
                res.status(404).json({ error: "No documents found for this area" });
            } else if (err instanceof AreaNotFound) {
                res.status(404).json({ error: "Area not found" });
            } else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });


const validStakeholders = ["lkab", "municipality", "regional authority", "architecture firms", "citizens", "others" ];

router.post("/",
    isLoggedIn,
    [
        body("title")
            .trim()
            .notEmpty().withMessage("Title is required")
            .isString().withMessage("Title must be a string"),

        body("scale")
            .notEmpty().withMessage("Scale is required")
            .isIn(["text", "concept", "plan", "blueprints"]).withMessage("Scale must be one of: text, concept, plan, blueprints"),

        body("date")
            .notEmpty().withMessage("Date is required"),

        body("type")
            .notEmpty().withMessage("Type is required")
            .isIn(["design", "informative", "prescriptive", "technical", "agreement", "conflict", "consultation", "material effects"]).withMessage("Invalid document type"),

        body("language")
            .optional({ nullable: true, checkFalsy: true }) // Ignora se è `null` o stringa vuota
            .isString().withMessage("Language must be a string"),

        body("pages")
            .optional({ nullable: true, checkFalsy: true })
            .isInt({ min: 1 }).withMessage("Page number must be a positive integer"),

        body("description")
            .trim()
            .notEmpty().withMessage("Description is required"),

        body("links")
            .optional({ nullable: true, checkFalsy: true })
            .isArray({ min: 1 }).withMessage("Links must be an array"),

        body("areaId")
            .optional({ nullable: true, checkFalsy: true })
            .isInt().withMessage("Area ID must be a number"),

        body("stakeholders")
            .isArray({ min: 1 }).withMessage("Stakeholders must be a non-empty array")
            .custom((stakeholders) => {
                stakeholders.forEach((stakeholder) => {
                    if (!validStakeholders.includes(stakeholder)) {
                        throw new Error(`Each stakeholder must be one of the following: ${validStakeholders.join(", ")}`);
                    }
                });
                return true;
            }),

        body("planNumber")
            .if((_, { req }) => req.body.scale === "plan")
            .notEmpty().withMessage("Plan number is required when scale is 'plan'")
            .isInt({ min: 1 }).withMessage("Plan number must be a positive integer"),
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array().map((e) => e.msg) });
        }

        try {
            const params = req.body;
            let areaId = params.areaId;

            // If areaId is provided, verify if it exists
            if (areaId) {
                const areaExists = await AreaDao.getAreaById(areaId);
                if (!areaExists) {
                    return res.status(404).json({ message: "Area not found" });
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

            let lastId = await DocumentDao.addDocument(newDocument);
            const links = params.links;
            if (links) {
                await Promise.all(links.map(link => DocumentLinksDao.addLinkstoDocumentAtInsertionTime(link, lastId)));
            }

            res.status(201).json({ lastId: lastId, message: "Document added successfully" });
        } catch (err) {
            console.error("Error adding document:", err);
            res.status(err.status).json({ message: err.message });
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
                        type: doc.type,
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
            res.status(500).json({ error: error.message });
        }
    }
);

router.delete("/:DocId/links",
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
            const documentId = params.DocId;
            const deleteResult = await DocumentLinksDao.deleteAll(documentId);

            if (deleteResult.deletedCount === 0) {
                return res.status(200).json({ message: "No links found for this document ID" });
            }
            res.status(200).json({ message: "All links deleted successfully" });
        }
        catch (error) {
            console.error("Error in deleteAll function:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
);


/* POST /api/documents/link */

router.post("/link",
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
        console.log(req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array().map((e) => e.msg));
            return res.status(400).json({ errors: errors.array() });
        }
        //check if connection type is valid
        const connections = ["direct_consequence", "collateral_consequence", "prevision", "update"];

        if (!connections.includes(req.body.connection)) {
            return res.status(402).json({ error: "Invalid connection type" });
        }
        const newLink = new Link(null, req.body.doc1Id, req.body.doc2Id, req.body.date, req.body.connection);
        //check if link already exists
        try {
            const linkExists = await DocumentLinksDao.isLink(newLink);
            if (linkExists) {
                return res.status(403).json({ error: "Link already exists" });
            }
        } catch (error) {
            console.error("Error in linkExists function:", error.message);
            throw new Error("Unable to check if link already exists. Please check your connection and try again.");
        }

        //check if documents exist
        try {
            const doc1Exists = await DocumentDao.getDocumentById(req.body.doc1Id);
            
            const doc2Exists = await DocumentDao.getDocumentById(req.body.doc2Id);
            
        } catch (error) {
            console.error("Error in isLink function:", error.message);
            return res.status(404).json({ error: "Document 1 or 2 not found" });
          //  throw new Error("Unable to check if documents exist. Please check your connection and try again.");
        }

        try {

            const result = await DocumentLinksDao.addLinktoDocument(newLink);
            res.status(200).json({ message: "Link added successfully" });

        } catch (error) {
            console.error("Error in addLinktoDocument function:", error.message);
            res.status(500).json({ error: err.message });
        }
    }
);

router.post("/links",
    [
        body("links")
            .isArray({ min: 0 })
            .withMessage("Links must be a not empty array"),
    ],

    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //check if connection type is valid
        const validConnections = ["direct_consequence", "collateral_consequence", "prevision", "update"];

        const invalidLinks = req.body.links.filter(link => !validConnections.includes(link.connectionType));

        if (invalidLinks.length > 0) {
            return res.status(402).json({
                error: "Invalid connection type for the following links",
                invalidLinks
            });
        }
        const links = req.body.links;
        //delete the links not present in the array the client gave us
        try {
            await DocumentLinksDao.deleteLinks(links);
        } catch (error) {
            throw new Error("Unable to delete the links: " + error);
        }

        // Controlla se i documenti esistono
        try {
            // Controlliamo che ogni documento esista
            for (const link of links) {
                
                const doc1Exists = await DocumentDao.getDocumentById(link.originalDocId);
                if (!doc1Exists) {
                    return res.status(404).json({ error: `Document with ID ${link.originalDocId} not found` });
                }

                const doc2Exists = await DocumentDao.getDocumentById(link.selectedDocId);
                if (!doc2Exists) {
                    return res.status(404).json({ error: `Document with ID ${link.selectedDocId} not found` });
                }
            }
        } catch (error) {
            console.error("Error in isLink function:", error.message);
            return res.status(404).json({ error: "Unable to check if documents exist. Please try again later." });
        }

        // Aggiungi i nuovi link, ma solo se non esistono 
        try {
            for (const link of links) {
                // Controlla se la connessione esiste già

                const existingLink = await DocumentLinksDao.checkLinkExists(link.originalDocId, link.selectedDocId, link.connectionType);

                if (existingLink) {
                    console.log(`Connection already exists for ${link.originalDocId} and ${link.selectedDocId}`);
                }
                else {
                    const newLink = {
                        doc1Id: link.originalDocId,
                        doc2Id: link.selectedDocId,
                        date: link.date,
                        connection: link.connectionType
                    };
                    //console.log(link);
                    await DocumentLinksDao.addLinktoDocument(newLink); // Aggiungi ogni link al database
                }
            }

            res.json({ message: "Links added successfully" });
        } catch (error) {
            console.error("Error in addLinktoDocument function:", error.message);
            return res.status(500).json({ error: error.message });
        }
    }
);




export default router;