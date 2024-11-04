import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";
import { body, param, validationResult } from "express-validator";
import AreaDAO from "../dao/AreaDAO.mjs";
import Area from "../models/Area.mjs";
import { isLoggedIn } from "../auth/authMiddleware.mjs";

const router = express.Router();
const DocumentDao = new DocumentDAO();
const AreaDao = new AreaDAO();

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
            res.status(500).json({ error: err });
        }
    })
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
            .optional()
            .isString().withMessage("Language must be a string"),

        body("pages")
            .optional()
            .isInt({ min: 1 }).withMessage("Page number must be a positive integer"),

        body("description")
            .trim()
            .notEmpty().withMessage("Description is required"),
            
        body("areaId")
            .optional()
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

            let lastId = await DocumentDao.addDocument(newDocument);
            res.status(201).json({ lastId: lastId, message: "Document added successfully" });
        } catch (err) {
            console.error("Error adding document:", err);
            res.status(500).json({ error: err.message });
        }
    });

export default router;