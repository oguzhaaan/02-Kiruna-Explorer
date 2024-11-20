// 02-Kiruna-Explorer/kiruna-explorer-server/test/document.test.js
import { describe, beforeEach, afterEach, test, expect, vitest } from 'vitest';
import db from '../../db.mjs';
import DocumentDAO from '../../dao/DocumentDAO.mjs';
import Document from '../../models/Document.mjs';
import { DocumentNotFound } from '../../models/Document.mjs';
import AreaDAO from '../../dao/AreaDAO.mjs';
import { InvalidArea } from '../../models/Area.mjs';
import { AreaNotFound } from '../../models/Area.mjs';
import Area from '../../models/Area.mjs';

const areaDAO = new AreaDAO();

const mockRowDB = {
    id: 1,
    title: 'Test Document',
    lkab: true, // Mocking boolean fields
    municipality: false,
    regional_authority: true,
    architecture_firms: false,
    citizens: false,
    others: false,
    date: '2023-01-01',
    type: 'design',
    language: 'English',
    description: 'A test document',
    areaId: 1,
    scale: '1:100',
    pages: 10,
    planNumber: 123
};

const mockRowDocument = {
    id: 1,
    title: 'Test Document',
    stakeholders: ["lkab", "regional_authority"],
    date: '2023-01-01',
    type: 'design',
    language: 'English',
    description: 'A test document',
    areaId: 1,
    scale: '1:100',
    pages: 10,
    planNumber: 123
};

const mockinvalidRowDB = {
    // Example of invalid data: missing required fields or invalid types
    title: 'a', // Assuming title is required and cannot be empty
    date: 'invalid-date', // Invalid date format
    type: 'design',
    language: 'English',
    description: 'A test document',
    scale: '1:100',
    areaId: null,
    pages: 10,
    planNumber: 123,
    lkab: true,
    municipality: false,
    regional_authority: true,
    architecture_firms: false,
    citizens: false,
    others: false
};

const mockinvalidRowDocument = {
    // Example of invalid data: missing required fields or invalid types
    title: 'a', // Assuming title is required and cannot be empty
    date: 'invalid-date', // Invalid date format
    type: 'design',
    language: 'English',
    description: 'A test document',
    scale: '1:100',
    areaId: null,
    pages: 10,
    planNumber: 123,
    stakeholders: ["lkab", "regional_authority"],
};

describe("Unit Test getDocumentById", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new DocumentDAO(areaDAO);
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vitest.clearAllMocks();
    });

    test("should return a Document object when a valid ID is provided", async () => {

        vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(null, mockRowDB);
        });

        vitest.spyOn(documentDAO, "convertDBRowToDocument").mockResolvedValueOnce(mockRowDocument)

        const document = await documentDAO.getDocumentById(1);

        expect(document).toEqual(new Document(
            mockRowDocument.id,
            mockRowDocument.title,
            mockRowDocument.stakeholders, // Expected stakeholders array
            mockRowDocument.date,
            mockRowDocument.type,
            mockRowDocument.language,
            mockRowDocument.description,
            mockRowDocument.areaId,
            mockRowDocument.scale,
            mockRowDocument.pages,
            mockRowDocument.planNumber
        ));
        expect(db.get).toBeCalledTimes(1);

    });

    test("should return error 404 documentnotfound when no document is found", async () => {
        vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(null, undefined);
        });

        const result = await documentDAO.getDocumentById(999).catch(err => err);

        expect(result).toBeInstanceOf(DocumentNotFound)
        expect(db.get).toBeCalledTimes(1);
    });

    test("should reject with an error when a database error occurs", async () => {
        const error = new Error('Database error');
        vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(error, null);
        });

        const res = await documentDAO.getDocumentById(1).catch(err => err)

        expect(res).toBeInstanceOf(Error)
        expect(db.get).toBeCalledTimes(1);
    });
});

describe("Unit Test addDocument", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new DocumentDAO(areaDAO);
    });

    afterEach(() => {
        vitest.clearAllMocks();
    });

    test("should insert a document and return its ID", async () => {

        // Mock the convertDocumentForDB method
        vitest.spyOn(documentDAO, 'convertDocumentForDB').mockReturnValue(mockRowDB);

        // Mock the db.run method
        const lastID = 42; // Example ID for the inserted document
        vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback.call({lastID}, null); // Simulate successful insertion with lastID
        });

        const result = await documentDAO.addDocument(mockRowDocument);

        expect(result).toBe(lastID);
        expect(db.run).toBeCalledWith(
            expect.stringContaining("INSERT INTO document"),
            [
                mockRowDB.title,
                mockRowDB.date,
                mockRowDB.type,
                mockRowDB.language,
                mockRowDB.description,
                mockRowDB.scale,
                mockRowDB.areaId,
                mockRowDB.pages,
                mockRowDB.planNumber,
                mockRowDB.lkab,
                mockRowDB.municipality,
                mockRowDB.regional_authority,
                mockRowDB.architecture_firms,
                mockRowDB.citizens,
                mockRowDB.others
            ],
            expect.any(Function)
        );
    });

    test("should insert a document and return its ID if areaID is not provided", async () => {

        // Mock the convertDocumentForDB method
        vitest.spyOn(documentDAO, 'convertDocumentForDB').mockReturnValue(mockRowDB);

        // Mock the db.run method
        const lastID = 42; // Example ID for the inserted document
        vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback.call({lastID}, null); // Simulate successful insertion with lastID
        });

        const result = await documentDAO.addDocument(mockRowDocument);

        expect(result).toBe(lastID);
        expect(db.run).toBeCalledWith(
            expect.stringContaining("INSERT INTO document"),
            [
                mockRowDB.title,
                mockRowDB.date,
                mockRowDB.type,
                mockRowDB.language,
                mockRowDB.description,
                mockRowDB.scale,
                mockRowDB.areaId, //should be null
                mockRowDB.pages,
                mockRowDB.planNumber,
                mockRowDB.lkab,
                mockRowDB.municipality,
                mockRowDB.regional_authority,
                mockRowDB.architecture_firms,
                mockRowDB.citizens,
                mockRowDB.others
            ],
            expect.any(Function)
        );
    });

    test("should reject with an error if input is invalid", async () => {

        // Mock the convertDocumentForDB method to return the invalid data
        vitest.spyOn(documentDAO, 'convertDocumentForDB').mockReturnValue(mockinvalidRowDB);

        // Mock the db.run method to simulate an error due to invalid input
        const error = new Error('Invalid input data');
        vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback(error, null); // Simulate an error during insertion
        });

        const res = await documentDAO.addDocument(mockinvalidRowDocument).catch(err => err);
        expect(res).toBeInstanceOf(Error)
    });
});

describe("Unit Test updateDocumentAreaId", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new DocumentDAO(areaDAO);
    });

    afterEach(() => {
        vitest.clearAllMocks();
    });

    test("should update the document's areaId and delete old area if unused", async () => {
        const oldAreaId = 2;
        const newAreaId = 5;
        const documentId = 1;

        vitest.spyOn(documentDAO, "getDocumentById").mockResolvedValueOnce({areaId: oldAreaId});

        vitest.spyOn(documentDAO, "getAllDocuments").mockResolvedValueOnce([
            { id: 1, areaId: oldAreaId },
            { id: 2, areaId: newAreaId }
        ]);
    
        // Simula `getAllAreas` per restituire una lista di aree
        vitest.spyOn(areaDAO, "getAllAreas").mockResolvedValueOnce([
            { id: oldAreaId },
            { id: newAreaId }
        ]);

        vitest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            console.log("db.run called with query:", query);
            console.log("db.run called with params:", params);
            callback(null);
        });
    
        // Esegui la funzione da testare
        const result = await documentDAO.updateDocumentAreaId(documentId, newAreaId);
    
        // Controlla che il risultato sia `true`
        expect(result).toBe(true);
    
        // Verifica che `db.run` sia stato chiamato con i parametri corretti
        expect(db.run).toBeCalledWith(
            expect.stringContaining("UPDATE document SET areaId"),
            [newAreaId, documentId],
            expect.any(Function)
        );
        expect(db.run).toBeCalledWith(
            expect.stringContaining("DELETE FROM area WHERE id"),
            [oldAreaId],
            expect.any(Function)
        );
    });

    test("should reject with AreaNotFound if newAreaId is not exists in area table", async () => {
        const documentId = 1;
        const newAreaId = 999; // Assume this ID does not exist

        vitest.spyOn(documentDAO, 'getDocumentById').mockResolvedValue({ areaId: 1 });

        vitest.spyOn(areaDAO, 'getAllAreas').mockResolvedValue([
            { id: 1 },
            { id: 2 }
        ]);

        const result = await documentDAO.updateDocumentAreaId(documentId, newAreaId).catch(err => err);

        expect(result).toBeInstanceOf(AreaNotFound);
    });

    test("should reject with InvalidArea if newAreaId is not an integer", async () => {
        const documentId = 1;
        const newAreaId = "invalid";

        vitest.spyOn(documentDAO, 'getDocumentById').mockResolvedValue({ areaId: 1 });

        vitest.spyOn(areaDAO, 'getAllAreas').mockResolvedValue([
            { id: 1 },
            { id: 2 }
        ]);

        const result = await documentDAO.updateDocumentAreaId(documentId, newAreaId).catch(err => err);

        expect(result).toBeInstanceOf(InvalidArea);
    });

    test("should not delete the area after modifying if oldAreaId still exists in document table after updating it to newAreaId", async () => {
        const oldAreaId = 2;
        const newAreaId = 5;
        const documentId = 1;

        // Mock getDocumentById to return document with oldAreaId
        vitest.spyOn(documentDAO, "getDocumentById").mockResolvedValueOnce({ areaId: oldAreaId });

        // Mock getAllDocuments to return documents with oldAreaId still in use by other documents
        vitest.spyOn(documentDAO, "getAllDocuments").mockResolvedValueOnce([
            { id: 1, areaId: oldAreaId }, // document being updated
            { id: 2, areaId: newAreaId }, // document with newAreaId
            { id: 3, areaId: oldAreaId }  // another document still using oldAreaId
        ]);

        vitest.spyOn(areaDAO, "getAllAreas").mockResolvedValueOnce([
            { id: oldAreaId },
            { id: newAreaId }
        ]);

        vitest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            if (typeof callback === 'function') {
                callback(null);
            }
        });

        const result = await documentDAO.updateDocumentAreaId(documentId, newAreaId);

        expect(result).toBe(true);

        expect(db.run).toBeCalledWith(
            expect.stringContaining("UPDATE document SET areaId"),
            [newAreaId, documentId],
            expect.any(Function)
        );

    });

});

describe("Unit Test getDocumentsByFilter", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new DocumentDAO(areaDAO);
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vitest.clearAllMocks();
    });

    test("should return all documents when no filter parameters are provided", async () => {
        const mockRowsDB = [
            {
                id: 1,
                title: "Document 1",
                stakeholders: [],
                date: "2023-10-01",
                type: "type1",
                language: "en",
                description: "Description 1",
                areaId: 1,
                scale: "1:1000",
                pages: 10,
                planNumber: 101
            },
            {
                id: 2,
                title: "Document 2",
                stakeholders: [],
                date: "2023-10-02",
                type: "type2",
                language: "en",
                description: "Description 2",
                areaId: 2,
                scale: "1:2000",
                pages: 20,
                planNumber: 102
            }
            // Add more mock documents as needed
        ];

        const mockDocuments = mockRowsDB.map(row => new Document(
            row.id,
            row.title,
            row.stakeholders,
            row.date,
            row.type,
            row.language,
            row.description,
            row.areaId,
            row.scale,
            row.pages,
            row.planNumber
        ));

        vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, mockRowsDB);
        });

        vitest.spyOn(documentDAO, "convertDBRowToDocument").mockImplementation(row => {
            return new Document(
                row.id,
                row.title,
                row.stakeholders,
                row.date,
                row.type,
                row.language,
                row.description,
                row.areaId,
                row.scale,
                row.pages,
                row.planNumber
            );
        });

        const documents = await documentDAO.getDocumentsByFilter({});

        expect(documents).toEqual(mockDocuments);
        expect(db.all).toBeCalledTimes(1);
        expect(db.all).toBeCalledWith(expect.stringContaining("SELECT * FROM document WHERE 1=1"), [], expect.any(Function));
    });

    test("should return documents that match the title filter", async () => {
        const titleFilter = "Document 1";
        const mockRowsDB = [
            {
                id: 1,
                title: "Document 1",
                stakeholders: [],
                date: "2023-10-01",
                type: "type1",
                language: "en",
                description: "Description 1",
                areaId: 1,
                scale: "1:1000",
                pages: 10,
                planNumber: 101
            }
            // Add more mock documents if needed
        ];

        const mockDocuments = mockRowsDB.map(row => new Document(
            row.id,
            row.title,
            row.stakeholders,
            row.date,
            row.type,
            row.language,
            row.description,
            row.areaId,
            row.scale,
            row.pages,
            row.planNumber
        ));

        vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, mockRowsDB);
        });

        vitest.spyOn(documentDAO, "convertDBRowToDocument").mockImplementation(row => {
            return new Document(
                row.id,
                row.title,
                row.stakeholders,
                row.date,
                row.type,
                row.language,
                row.description,
                row.areaId,
                row.scale,
                row.pages,
                row.planNumber
            );
        });

        const documents = await documentDAO.getDocumentsByFilter({title: titleFilter});

        expect(documents).toEqual(mockDocuments);
        expect(db.all).toBeCalledTimes(1);
        expect(db.all).toBeCalledWith(expect.stringContaining("SELECT * FROM document WHERE 1=1 AND title LIKE ?"), [`%${titleFilter}%`], expect.any(Function));
    });
    test("should return documents that match the stakeholders filter", async () => {
        const stakeholdersFilter = ["lkab", "municipality"];
        const mockRowsDB = [
            {
                id: 1,
                title: "Document 1",
                stakeholders: ["lkab", "municipality"],
                date: "2023-10-01",
                type: "type1",
                language: "en",
                description: "Description 1",
                areaId: 1,
                scale: "1:1000",
                pages: 10,
                planNumber: 101
            }
            // Add more mock documents if needed
        ];

        const mockDocuments = mockRowsDB.map(row => new Document(
            row.id,
            row.title,
            row.stakeholders,
            row.date,
            row.type,
            row.language,
            row.description,
            row.areaId,
            row.scale,
            row.pages,
            row.planNumber
        ));

        vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, mockRowsDB);
        });

        vitest.spyOn(documentDAO, "convertDBRowToDocument").mockImplementation(row => {
            return new Document(
                row.id,
                row.title,
                row.stakeholders,
                row.date,
                row.type,
                row.language,
                row.description,
                row.areaId,
                row.scale,
                row.pages,
                row.planNumber
            );
        });

        const documents = await documentDAO.getDocumentsByFilter({stakeholders: stakeholdersFilter});

        expect(documents).toEqual(mockDocuments);
        expect(db.all).toBeCalledTimes(1);

        // Construct the expected SQL condition for stakeholders
        const expectedStakeholderConditions = stakeholdersFilter.map(stakeholder => `${stakeholder} = TRUE`).join(" AND ");
        expect(db.all).toBeCalledWith(expect.stringContaining(`SELECT * FROM document WHERE 1=1 AND (${expectedStakeholderConditions})`), [], expect.any(Function));
    });
    test("should return documents that match the startDate filter", async () => {
        const startDateFilter = "2023-10-01";
        const mockRowsDB = [
            {
                id: 1,
                title: "Document 1",
                stakeholders: [],
                date: "2023-10-01",
                type: "type1",
                language: "en",
                description: "Description 1",
                areaId: 1,
                scale: "1:1000",
                pages: 10,
                planNumber: 101
            }
            // Add more mock documents if needed
        ];

        const mockDocuments = mockRowsDB.map(row => new Document(
            row.id,
            row.title,
            row.stakeholders,
            row.date,
            row.type,
            row.language,
            row.description,
            row.areaId,
            row.scale,
            row.pages,
            row.planNumber
        ));

        vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, mockRowsDB);
        });

        vitest.spyOn(documentDAO, "convertDBRowToDocument").mockImplementation(row => {
            return new Document(
                row.id,
                row.title,
                row.stakeholders,
                row.date,
                row.type,
                row.language,
                row.description,
                row.areaId,
                row.scale,
                row.pages,
                row.planNumber
            );
        });

        const documents = await documentDAO.getDocumentsByFilter({startDate: startDateFilter});

        expect(documents).toEqual(mockDocuments);
        expect(db.all).toBeCalledTimes(1);
        expect(db.all).toBeCalledWith(expect.stringContaining("SELECT * FROM document WHERE 1=1 AND date >= ?"), [startDateFilter], expect.any(Function));
    });

    test("should return documents that match the endDate filter", async () => {
        const endDateFilter = "2023-10-01";
        const mockRowsDB = [
            {
                id: 1,
                title: "Document 1",
                stakeholders: [],
                date: "2023-10-01",
                type: "type1",
                language: "en",
                description: "Description 1",
                areaId: 1,
                scale: "1:1000",
                pages: 10,
                planNumber: 101
            }
            // Add more mock documents if needed
        ];

        const mockDocuments = mockRowsDB.map(row => new Document(
            row.id,
            row.title,
            row.stakeholders,
            row.date,
            row.type,
            row.language,
            row.description,
            row.areaId,
            row.scale,
            row.pages,
            row.planNumber
        ));

        vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, mockRowsDB);
        });

        vitest.spyOn(documentDAO, "convertDBRowToDocument").mockImplementation(row => {
            return new Document(
                row.id,
                row.title,
                row.stakeholders,
                row.date,
                row.type,
                row.language,
                row.description,
                row.areaId,
                row.scale,
                row.pages,
                row.planNumber
            );
        });

        const documents = await documentDAO.getDocumentsByFilter({endDate: endDateFilter});

        expect(documents).toEqual(mockDocuments);
        expect(db.all).toBeCalledTimes(1);
        expect(db.all).toBeCalledWith(expect.stringContaining("SELECT * FROM document WHERE 1=1 AND date <= ?"), [endDateFilter], expect.any(Function));
    });

});