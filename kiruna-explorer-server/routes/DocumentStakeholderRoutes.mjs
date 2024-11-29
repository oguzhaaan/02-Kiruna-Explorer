import express from 'express';
import { body,param, validationResult } from "express-validator";
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
            
            //put first letter to uppercase
            // const firstLetter = name.charAt(0).toUpperCase();
            // const restOfName = name.slice(1);
            // const formattedName = firstLetter + restOfName;

            // // insert new stakeholder: mUnicipality
            // // db : Municipality
            // //check if stakeholder already exists
            // const stakeholderExists = await StakeholderDao.getStakeholderByName(formattedName);

            // Check if stakeholder already exists
            const stakeholders = await StakeholderDao.getStakeholders();

            for (const stakeholder of stakeholders) {
                if (stakeholder.name === name) {
                    return res.status(403).json({ error: "Stakeholder already exists" });
                }
            }
            // Convert name to lowercase
            name = name.toLowerCase();

            // Convert first letters to uppercase
            const formattedName =  name.replace(/\b\w/g, match => match.toUpperCase());
            
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

router.post("/",
    isLoggedIn,
    authorizeRoles('admin', 'urban_planner'),
    [
        body("docId")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
        body("stakeholderId")
            .isNumeric()
            .withMessage("Stakeholder ID must be a valid number")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const docId = req.body.docId;
            const stakeholderId = req.body.stakeholderId;
            await StakeholderDao.addDocumentStakeholder(docId, stakeholderId);
            res.status(201).json({ message: "Stakeholder matched to document successfully" });
        } catch (err) {
            console.error("Error adding stakeholder to document:", err);
            res.status(500).json({ error: "Internal server error", details: err.message });
        }
    }
)

export default router;
