import express from 'express';
import { body, param, validationResult } from "express-validator";
import { isLoggedIn } from "../auth/authMiddleware.mjs";
const router = express.Router();
import { InvalidDocumentType, DocumentTypeNameAlreadyExists } from "../models/DocumentType.mjs";
import { authorizeRoles } from "../auth/authMiddleware.mjs";
import DocumentTypeDAO from "../dao/DocumentTypDAO.mjs";

const DocumentTypeDao = new DocumentTypeDAO();

router.get("/",
    async (req, res) => {
        try {
            const types = await DocumentTypeDao.getAllDocumentTypes();
            res.status(200).json(types);
        } catch (err) {
            console.error("Error fetching types:", err);
            res.status(500).json({ error: "Internal server error", details: err.message });
        }
    }
)
router.post("/", isLoggedIn, authorizeRoles('admin', 'urban_planner'), [
    body("name")
        .trim()
        .notEmpty().withMessage("Type name is required")
        .isString().withMessage("Type name must be a string")
        .custom(value => {
            if (!isNaN(value)) {
                throw new InvalidDocumentType();
            }
            return true;
        })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body;
        const nameLowerCase = name.toLowerCase();

        // Recupera tutti i tipi di documenti esistenti dal database
        const types = await DocumentTypeDao.getAllDocumentTypes();
        const existingTypes = types.reduce((acc, type) => {
            acc[type.name.toLowerCase()] = type.id; 
            return acc;
        }, {});

        let typeId;
        if (existingTypes[nameLowerCase]) {
            // Se il tipo esiste già, restituisci il suo ID
            typeId = existingTypes[nameLowerCase];
        } else {
            // Se il tipo non esiste, crealo e ottieni il suo ID
            typeId = await DocumentTypeDao.addDocumentType(name);
        }

        res.status(201).json({ typeId: typeId, message: "Document type processed successfully" });
    } catch (err) {
        console.error("Error adding document type:", err);
        if (err instanceof DocumentTypeNameAlreadyExists) {
            return res.status(409).json({ error: "Type name already exists" });
        }
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});



export default router;