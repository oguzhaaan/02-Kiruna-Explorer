import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";
import { body, param, validationResult } from "express-validator";
import AreaDAO from "../dao/AreaDAO.mjs";
import Area from "../models/Area.mjs";
import DocumentLinksDAO from "../dao/DocumentLinksDAO.mjs";
import Link from "../models/Link.mjs";
import { isLoggedIn } from "../auth/authMiddleware.mjs";

const router = express.Router();
const DocumentDao = new DocumentDAO();
const AreaDao = new AreaDAO();
const DocumentLinksDao = new DocumentLinksDAO();


router.get("/",
    async (req, res) => {
        console.log("hello")
        try {
            const documents = await DocumentDao.getAllDocuments();

            res.json(documents);
        }
        catch (error) {
            console.error("Error in getDocumentById function:", error.message);
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
const validStakeholders = ["lkab", "municipality", "regional authority", "architecture firms", "citizens", "others"];

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
            res.status(500).json({ error: err.message });
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

        } catch (error) {
            console.error("Error in addLinktoDocument function:", error.message);
            res.status(500).json({ error: err.message });
        }
    }
);



export default router;