import express from 'express';
import { body, param, validationResult } from "express-validator";
import { isLoggedIn } from "../auth/authMiddleware.mjs";
const router = express.Router();
import { authorizeRoles } from "../auth/authMiddleware.mjs";
import StakeholderDAO from "../dao/StakeholderDAO.mjs";

const StakeholderDao = new StakeholderDAO();

router.post("/new-stakeholder",
    isLoggedIn,
    authorizeRoles('admin', 'urban_planner'),
    [
        body("name")
            .trim()
            .notEmpty().withMessage("Stakeholder name is required")
            .isString().withMessage("Stakeholder name must be a string")

    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let name = req.body.name;

            // Check if stakeholder already exists
            const stakeholders = await StakeholderDao.getStakeholders();

            // Convert name to lowercase
            name = name.toLowerCase();

            // Check if stakeholder already exists
            for (const stakeholder of stakeholders) {
                if (stakeholder.name.toLowerCase() === name) {
                    return res.status(403).json({ error: "Stakeholder already exists" });
                }
            }

            // Convert first letters to uppercase
            const formattedName = name.replace(/\b\w/g, match => match.toUpperCase());

            await StakeholderDao.addStakeholder(formattedName);
            res.status(201).json({ message: "Stakeholder added successfully" });
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
            .isArray()
            .notEmpty()
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
