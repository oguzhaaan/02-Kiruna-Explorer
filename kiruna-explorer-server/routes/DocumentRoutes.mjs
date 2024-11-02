import express from "express";
import DocumentDAO from "../dao/DocumentDAO.mjs";
import { body, param, validationResult } from "express-validator";
import AreaDAO from "../dao/AreaDAO.mjs";
import Area from "../models/Area.mjs";

const router = express.Router();
const DocumentDao = new DocumentDAO();
const AreaDao = new AreaDAO();

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
    })

/* POST /api/documents */
router.post("/",
    [
        body("title").notEmpty().withMessage("Title is required"),
        body("stakeholder").notEmpty().withMessage("Stakeholder is required"),
        body("scale").notEmpty().withMessage("Scale is required"),
        body("date").notEmpty().withMessage("Date is required"),
        body("type").notEmpty().withMessage("Type is required"),
        body("language").optional(),
        body("number").optional().isNumeric().withMessage("Page number must be a number"),
        body("description").notEmpty().withMessage("Description is required"),
        body("areaId").optional().isNumeric().withMessage("Area ID must be a number"),

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

            await DocumentDao.addDocument(newDocument);
            res.json({ message: "Document added successfully" });
        } catch (err) {
            console.error("Error adding document:", err);
            res.status(500).json({ error: err.message });
        }
    });

export default router;