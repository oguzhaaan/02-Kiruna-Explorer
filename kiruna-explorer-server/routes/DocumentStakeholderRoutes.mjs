import express from 'express';
import { body, param, validationResult } from "express-validator";
import { isLoggedIn } from "../auth/authMiddleware.mjs";
const router = express.Router();
import { authorizeRoles } from "../auth/authMiddleware.mjs";
import StakeholderDAO from "../dao/StakeholderDAO.mjs";

const StakeholderDao = new StakeholderDAO();

router.post("/",
    isLoggedIn,
    authorizeRoles('admin', 'urban_planner'),
    [
        body("stakeholders")
            .isArray({ min: 1 })
            .withMessage("Stakeholder must be a not empty array")
    ],
    async (req, res) => {
        console.log(req.body.stakeholders);
        const errors = validationResult(req);
        console.log(errors);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const array = req.body.stakeholders;

            const stakeholders = await StakeholderDao.getStakeholders();
            const existingNames = stakeholders.map(stakeholder => stakeholder.name.toLowerCase()); // Crea un array con i nomi degli stakeholder esistenti in minuscolo

            let id = [];
            const promises = array.map(async (name) => {

                name = name.toLowerCase();
    
                // Verifica se lo stakeholder esiste già
                for (const stakeholder of existingNames) {
                    console.log(stakeholder);
                    if (stakeholder === name) {
                        return res.status(403).json({ error: "Stakeholder already exists" });
                    }
                }
    
                // Format the name to have first letters uppercase
                const formattedName = name.replace(/\b\w/g, match => match.toUpperCase());
    
                // Aggiungi il nuovo stakeholder
                let lastId = await StakeholderDao.addStakeholder(formattedName);
                id.push(lastId);
            });

            await Promise.all(promises);

            
            res.status(201).json({ ids: id });
        } catch (err) {
            console.error("Error adding stakeholder:", err);
            res.status(500).json({ error: "Internal server error", details: err.message });
        }
    }
);

router.get("/",
    isLoggedIn,
    authorizeRoles('admin', 'urban_planner'),
    async (req, res) => {
        try {
            const stakeholders = await StakeholderDao.getStakeholders();
            res.status(200).json(stakeholders);
        } catch (err) {
            console.error("Error fetching stakeholders:", err);
            res.status(500).json({ error: "Internal server error", details: err.message });
        }
    }
)

router.post("/:docId",
    isLoggedIn,
    authorizeRoles('admin', 'urban_planner'),
    [
        body("stakeholders")
            .isArray({ min: 1 })
            .withMessage("Stakeholders must be an array"),
        param("docId")
            .isNumeric()
            .withMessage("Document ID must be a valid number")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const docId = req.params.docId;
            const stakeholderIds = req.body.stakeholders;

            // Add all stakeholders to the document by using the ids
            for (const stakeholderId of stakeholderIds) {
                const stakeholder = await StakeholderDao.getStakeHolderById(stakeholderId);
                if (!stakeholder) {
                    return res.status(400).json({ error: "Stakeholder not found" });
                }
                await StakeholderDao.addDocumentStakeholder(stakeholderId, docId);
            }

            res.status(201).json({ message: "Stakeholders matched to document successfully" });
        } catch (err) {
            console.error("Error adding stakeholders to document:", err);
            res.status(500).json({ error: "Internal server error", details: err.message });
        }
    }
)

export default router;
