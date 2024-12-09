import express from "express";
import multer from "multer"; // Package: multer
import { fileURLToPath } from "url";
import path from "path";
import { promises as fs } from "fs";
import DocumentDAO from "../dao/DocumentDAO.mjs";
import { body, param, validationResult } from "express-validator";
import AreaDAO from "../dao/AreaDAO.mjs";
import Area from "../models/Area.mjs";
import DocumentLinksDAO from "../dao/DocumentLinksDAO.mjs";
import Link from "../models/Link.mjs";
import { isLoggedIn } from "../auth/authMiddleware.mjs";
import { InvalidArea, AreaNotFound } from "../models/Area.mjs";
import { DocumentNotFound } from "../models/Document.mjs";
import { authorizeRoles } from "../auth/authMiddleware.mjs";
import { query } from "express-validator";
import DocumentTypDAOo from "../dao/DocumentTypDAO.mjs";
import StakeholderDAO from "../dao/StakeholderDAO.mjs";
import FileDAO from "../dao/FileDAO.mjs";
import crypto from "node:crypto"

const router = express.Router();
const AreaDao = new AreaDAO();
const DocumentDao = new DocumentDAO(AreaDao);
const DocumentLinksDao = new DocumentLinksDAO();
const FileDao = new FileDAO();
const DocumentTypeDao = new DocumentTypDAOo();
const StakeholderDao = new StakeholderDAO();
//const crypto = require('crypto');


/* GET /api/documents/filter */
/*
some examples of queries:
/api/documents/filter?type=technical&title=Document%201&stakeholders=lkab,municipality&startDate=2023-01-01&endDate=2023-12-31
/api/documents/filter?type=technical&title=Document%201&stakeholders=lkab,municipality
/api/documents/filter?type=technical&title=Document%201
/api/documents/filter?type=technical
/api/documents/filter?title=Document%201
/api/documents/filter?stakeholders=lkab,municipality
/api/documents/filter
*/
router.get(
    "/filter/pagination",
    isLoggedIn,
    [
        query("type").optional().isString().withMessage("Type must be a string"),
        query("title").optional().isString().withMessage("Title must be a string"),
        query("stakeholders")
            .optional()
            .isString()
            .withMessage("Stakeholders must be a comma-separated string"),
        query("startDate")
            .optional()
            .isISO8601()
            .withMessage("Start date must be a valid date"),
        query("endDate")
            .optional()
            .isISO8601()
            .withMessage("End date must be a valid date"),
        query("offset")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Offset must be a non-negative integer"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { type, title, stakeholders, startDate, endDate, offset } =
                req.query;
            const stakeholdersArray = stakeholders ? stakeholders.split(",") : [];

            const documents = await DocumentDao.getDocumentsWithPagination({
                type,
                title,
                stakeholders: stakeholdersArray,
                startDate,
                endDate,
                offset: parseInt(offset, 10) || 0,
            });

            res.status(200).json(documents);
        } catch (err) {
            console.error("Error fetching documents:", err);
            res
                .status(500)
                .json({ error: "Internal server error", details: err.message });
        }
    }
);

router.get(
    "/filter",
    isLoggedIn,
    [
        query("type").optional().isString().withMessage("Type must be a string"),
        query("title").optional().isString().withMessage("title must be a string"),
        query("stakeholders")
            .optional()
            .isString()
            .withMessage("Stakeholders must be a comma-separated string"),
        query("startDate")
            .optional()
            .isISO8601()
            .withMessage("Start date must be a valid date"),
        query("endDate")
            .optional()
            .isISO8601()
            .withMessage("End date must be a valid date"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { type, title, stakeholders, startDate, endDate } = req.query;
            const stakeholdersArray = stakeholders ? stakeholders.split(",") : null;
            const documents = await DocumentDao.getDocumentsByFilter({
                type,
                title,
                stakeholders: stakeholdersArray,
                startDate,
                endDate,
            });

            res.status(200).json(documents);
        } catch (err) {
            console.error("Error fetching documents:", err);
            res
                .status(500)
                .json({ error: "Internal server error", details: err.message });
        }
    }
);

router.get(
    "/search",
    isLoggedIn,
    [
        query("keyword")
            .notEmpty()
            .isString()
            .withMessage("Keyword is required and must be a string"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { keyword } = req.query;

            const documents = await DocumentDao.searchDocumentsByKeyword(keyword);

            res.status(200).json(documents);
        } catch (err) {
            console.error("Error fetching documents:", err);

            if (err.message.includes("No documents found")) {
                return res.status(404).json({ error: err.message });
            }

            res.status(500).json({ error: "Internal server error", details: err.message });
        }
    }
);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname("../");

router.get("/",
    //isLoggedIn, 
    //authorizeRoles('admin', 'urban_planner'),
    async (req, res) => {
        try {
            const documents = await DocumentDao.getAllDocuments();
            res.status(200).json(documents);
        } catch (error) {
            console.error("Error in getAllDocuments function:", error.message);
            res.status(500).json({ error: err.message });
        }
    }
);

/* GET /api/documents/:DocId */
router.get("/:DocId",
    // isLoggedIn,
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

            const document = await DocumentDao.getDocumentById(documentId);
            res.status(200).json(document);
        } catch (err) {
            console.error("Error fetching document:", err);
            res.status(err.status).json({ error: err });
        }
    }
);

/* GET /api/documents/area/:areaId */
router.get("/area/:areaId",
    // isLoggedIn, //tODO probably to be removed
    [
        param("areaId")
            .isInt().withMessage("Area ID must be a valid integer")
    ],
    async (req, res) => {

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
    }
);

// const validStakeholders = ["lkab", "municipality", "regional authority", "architecture firms", "citizens", "others"];

router.post(
    "/",
    isLoggedIn,
    authorizeRoles("admin", "urban_planner"),
    [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Title is required")
            .isString()
            .withMessage("Title must be a string"),

        body("scale")
            .notEmpty()
            .withMessage("Scale is required")
            .isIn(["text", "concept", "plan", "blueprints"])
            .withMessage("Scale must be one of: text, concept, plan, blueprints"),

        body("date").notEmpty().withMessage("Date is required"),

        body("typeId")
            .notEmpty()
            .withMessage("Type id is required")
            .isInt()
            .withMessage("Type id must be a number"),

        body("language")
            .optional({ nullable: true, checkFalsy: true }) // Ignora se è `null` o stringa vuota
            .isString()
            .withMessage("Language must be a string"),

        body("pages")
            .optional({ nullable: true, checkFalsy: true })
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("Description is required"),

        body("links")
            .optional({ nullable: true, checkFalsy: true })
            .isArray({ min: 1 })
            .withMessage("Links must be an array"),

        body("areaId")
            .optional({ nullable: true, checkFalsy: true })
            .isInt()
            .withMessage("Area ID must be a number"),

        // body("stakeholders")
        //     .isArray({ min: 1 }).withMessage("Stakeholders must be a non-empty array")
        //     //array of stakehodlers ids
        //     .custom((stakeholders) => {
        //         for (const stakeholder of stakeholders) {
        //             if (typeof stakeholder !== "number") {
        //                 return false;
        //             }
        //         }
        //         return true;
        //     }),

        body("planNumber")
            .if((_, { req }) => req.body.scale === "plan")
            .notEmpty()
            .withMessage("Plan number is required when scale is 'plan'")
            .isInt({ min: 1 })
            .withMessage("Plan number must be a positive integer"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ message: errors.array().map((e) => e.msg) });
        }

        try {
            const params = req.body;
            let areaId = params.areaId;
            let typeId = params.typeId;

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

            // If typeId is provided, verify if it exists
            console.log(typeId);
            const typeExists = await DocumentTypeDao.getDocumentTypeById(typeId);
            if (!typeExists) {
                return res.status(404).json({ message: "Type not found" });
            }

            // Add the document with the areaId (which could be null)
            const newDocument = {
                ...params,
                areaId: areaId,
            };

            let lastId = await DocumentDao.addDocument(newDocument);
            const links = params.links;
            if (links) {
                await Promise.all(
                    links.map((link) =>
                        DocumentLinksDao.addLinkstoDocumentAtInsertionTime(link, lastId)
                    )
                );
            }

            res
                .status(201)
                .json({ lastId: lastId, message: "Document added successfully" });
        } catch (err) {
            console.error("Error adding document:", err);
            res.status(err.status).json({ message: err.message });
        }
    }
);

/* GET /api/documents/:DocId/links */

router.get(
    "/:DocId/links",
    //isLoggedIn,
    [
        param("DocId")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const params = req.params;
            const documentId = params.DocId;

            // Get all the links for the given document
            const documentLinks = await DocumentLinksDao.getLinksByDocumentId(
                documentId
            );

            const linkedDocuemnts = [];

            for (const link of documentLinks) {
                try {
                    // given  document id could be either stored in doc1Id column or doc2Id column
                    const linkedDocumentId =
                        link.doc1Id == documentId ? link.doc2Id : link.doc1Id;

                    const doc = await DocumentDao.getDocumentById(linkedDocumentId);

                    const linkedDocument = {
                        id: doc.id,
                        title: doc.title,
                        type: doc.type,
                        connection: link.connection,
                    };
                    linkedDocuemnts.push(linkedDocument);
                } catch (error) {
                    console.error("Error in getDocumentById function:", error.message);
                    throw new Error(
                        "Unable to get the document. Please check your connection and try again."
                    );
                }
            }

            res.json(linkedDocuemnts);
        } catch (error) {
            console.error("Error in getDocumentById function:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
);

router.delete(
    "/:DocId/links",
    isLoggedIn,
    authorizeRoles("admin", "urban_planner"),
    [
        param("DocId")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
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
                return res
                    .status(200)
                    .json({ message: "No links found for this document ID" });
            }
            res.status(200).json({ message: "All links deleted successfully" });
        } catch (error) {
            console.error("Error in deleteAll function:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
);

/* POST /api/documents/link */

router.post(
    "/link",
    authorizeRoles("admin", "urban_planner"),
    isLoggedIn,
    [
        body("doc1Id")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
        body("doc2Id")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
        body("connection").isString().withMessage("Type must be a string"),
        body("date").isString().withMessage("Date must be a string"),
    ],

    async (req, res) => {
        //console.log(req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //console.log(errors.array().map((e) => e.msg));
            return res.status(400).json({ errors: errors.array() });
        }
        //check if connection type is valid
        const connections = [
            "direct_consequence",
            "collateral_consequence",
            "prevision",
            "update",
        ];

        if (!connections.includes(req.body.connection)) {
            return res.status(402).json({ error: "Invalid connection type" });
        }
        const newLink = new Link(
            null,
            req.body.doc1Id,
            req.body.doc2Id,
            req.body.date,
            req.body.connection
        );
        //check if link already exists
        try {
            const linkExists = await DocumentLinksDao.isLink(newLink);
            if (linkExists) {
                return res.status(403).json({ error: "Link already exists" });
            }
        } catch (error) {
            console.error("Error in linkExists function:", error.message);
            throw new Error(
                "Unable to check if link already exists. Please check your connection and try again."
            );
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

router.post(
    "/links",
    isLoggedIn,
    authorizeRoles("admin", "urban_planner"),
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
        const validConnections = [
            "direct_consequence",
            "collateral_consequence",
            "prevision",
            "update",
        ];

        const invalidLinks = req.body.links.filter(
            (link) => !validConnections.includes(link.connectionType)
        );

        if (invalidLinks.length > 0) {
            return res.status(402).json({
                error: "Invalid connection type for the following links",
                invalidLinks,
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
                const doc1Exists = await DocumentDao.getDocumentById(
                    link.originalDocId
                );
                if (!doc1Exists) {
                    return res.status(404).json({
                        error: `Document with ID ${link.originalDocId} not found`,
                    });
                }

                const doc2Exists = await DocumentDao.getDocumentById(
                    link.selectedDocId
                );
                if (!doc2Exists) {
                    return res.status(404).json({
                        error: `Document with ID ${link.selectedDocId} not found`,
                    });
                }
            }
        } catch (error) {
            console.error("Error in isLink function:", error.message);
            return res.status(404).json({
                error: "Unable to check if documents exist. Please try again later.",
            });
        }

        // Aggiungi i nuovi link, ma solo se non esistono
        try {
            for (const link of links) {
                // Controlla se la connessione esiste già

                const existingLink = await DocumentLinksDao.checkLinkExists(
                    link.originalDocId,
                    link.selectedDocId,
                    link.connectionType
                );

                if (existingLink) {
                    //console.log(`Connection already exists for ${link.originalDocId} and ${link.selectedDocId}`);
                } else {
                    const newLink = {
                        doc1Id: link.originalDocId,
                        doc2Id: link.selectedDocId,
                        date: link.date,
                        connection: link.connectionType,
                    };
                    ////console.log(link);
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

router.put(
    "/:DocId/area",
    isLoggedIn,
    authorizeRoles("admin", "urban_planner"),
    (req, res) => {
        const { DocId } = req.params;
        const { newAreaId } = req.body;

        DocumentDao.updateDocumentAreaId(Number(DocId), Number(newAreaId))
            .then(() => {
                res
                    .status(200)
                    .json({ message: "Document areaId updated successfully" });
            })
            .catch((error) => {
                if (error instanceof InvalidArea) {
                    res.status(400).json({ error: "Invalid area ID" });
                } else if (error instanceof AreaNotFound) {
                    res.status(404).json({ error: "Area not found" });
                } else if (error instanceof DocumentNotFound) {
                    res.status(404).json({ error: "Document not found" });
                } else {
                    res.status(500).json({ error: "Internal server error" });
                }
            });
    }
);

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(__dirname, "uploads");
        try {
            await fs.mkdir(uploadPath, { recursive: true });
        } catch (error) {
            return cb(error);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(8).toString('hex'); // Generates a random 16-character hex string
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
    limits: {
        fileSize: 7000000 // Sensitive: 10MB is more than the recommended limit of 8MB
    }
});

const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Errori specifici di Multer (es: dimensione file)
        return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err.code === "INVALID_FILE_TYPE") {
        // Errore personalizzato per tipo di file non valido
        return res.status(400).json({ error: err.message });
    }
    // Errori generici
    next(err);
};

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "image/jpg",
            "image/svg+xml",
            "text/plain",
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error(
                "Invalid file type. Only JPEG, PNG, PDF, JPG, SVG, and TXT are allowed."
            );
            error.code = "INVALID_FILE_TYPE"; // Custom error code
            return cb(error);
        }
        cb(null, true);
    },
});

const MAX_SIZE = 20 * 1024 * 1024;

// API route to handle file upload
router.post(
    "/:DocId/files",
    isLoggedIn,
    authorizeRoles("admin", "urban_planner"),
    upload.single("file"), // Use multer middleware
    [
        param("DocId")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
    ],
    async (req, res) => {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //check if file was uploaded
        if (!req.file) {
            return res
                .status(400)
                .json({ error: "File upload failed. No file provided." });
        }
        // Check file size
        if (req.file.size > MAX_SIZE) {
            return res
                .status(400)
                .json({ error: "File size exceeds the maximum limit of 20MB." });
        }
        //check if file type is allowed
        const allowedTypes = ["attachment", "original"];
        if (!allowedTypes.includes(req.body.fileType)) {
            return res.status(400).json({
                error: "Invalid file type. Allowed types: attachment, original",
            });
        }
        // //console.log(req.file);

        const docId = req.params.DocId;
        const file = {
            name: req.file.originalname,
            type: req.body.fileType,
            path: `/uploads/${req.file.filename}`,
        };
        try {
            const [attachmentID, fileId] = await FileDao.storeFile(docId, file);
            // File successfully uploaded
            if (!attachmentID) {
                return res
                    .status(500)
                    .json({ error: "Unable to store file. Please try again later." });
            }
            res.status(200).json({
                message: "File uploaded successfully",
                fileId: fileId,
                fileName: req.file.filename,
                filePath: `/uploads/${req.file.filename}`,
            });
        } catch (error) {
            console.error("Error in storeFile function:", error.message);
            return res
                .status(500)
                .json({ error: "Unable to store file. Please try again later." });
        }
    },
    multerErrorHandler
);

router.get(
    "/:DocId/files/download/:FileId",
    //isLoggedIn,
    [
        param("DocId")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
        param("FileId").isNumeric().withMessage("File ID must be a valid number"),
    ],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { DocId, FileId } = req.params;

            //add function to get file path from id
            const FilePath = await FileDao.getFilePathById(FileId);

            if (!FilePath) {
                return res.status(404).json({ error: "File not found" });
            }
            //console.log(FilePath);

            // Costruisci il percorso assoluto del file
            const filePathToDownload = "." + FilePath;

            try {
                await fs.access(filePathToDownload); // Verifica se il file esiste
                res.download(filePathToDownload, (err) => {
                    if (err) {
                        res.status(500).json({ error: "Failed to download the file" });
                    }
                });
            } catch (error) {
                // Se il file non esiste, invia un errore senza far crashare l'app
                res.status(404).json({ error: "File not found" });
            }
        } catch (error) {
            console.error("Error in file download:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
);

router.delete(
    "/:DocId/files/:FileId",
    isLoggedIn,
    authorizeRoles("admin", "urban_planner"),
    [
        param("DocId")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
        param("FileId").isNumeric().withMessage("File ID must be a valid number"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { DocId, FileId } = req.params;

            //add function to get file path from id
            const FilePath = await FileDao.getFilePathById(FileId);

            if (!FilePath) {
                return res.status(404).json({ error: "File not found" });
            }
            //console.log(FilePath);

            await fs.unlink("." + FilePath, async (err) => {
                if (err) {
                    //console.log('Error deleting file:', err);
                    return res
                        .status(500)
                        .json({ error: "Failed to delete the physical file" });
                }
            });
            //console.log("File deleted successfully");
            //console.log("Deleting file with ID:", FileId);
            // Ora rimuovi la riga nel database
            const deleteResult = await FileDao.deleteFile(FileId);

            if (deleteResult.deletedCount === 0) {
                return res.status(405).json({ error: "File not found in database" });
            }

            res.status(200).json({ message: "File deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: "Error in the delete function" });
        }
    }
);

router.get(
    "/:DocId/files",
    //isLoggedIn,
    [
        param("DocId")
            .isNumeric()
            .withMessage("Document ID must be a valid number"),
    ],
    async (req, res) => {
        const docId = req.params.DocId;
        //console.log(docId);

        try {
            // Use the DAO function to get files
            const files = await FileDao.getFilesByDocumentId(docId);

            // Return the files as a JSON response
            res.status(200).json(files);
        } catch (error) {
            // Handle errors and return a response
            console.error("Error fetching files:", error);
            res
                .status(500)
                .json({ error: "An error occurred while fetching files." });
        }
    }
);

export default router;
