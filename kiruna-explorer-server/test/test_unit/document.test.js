// 02-Kiruna-Explorer/kiruna-explorer-server/test/document.test.js
import { describe, beforeEach, afterEach, test, expect, vitest } from 'vitest';
import db from '../../db.mjs';
import DocumentDAO from '../../dao/DocumentDAO.mjs';
import Document from '../../models/Document.mjs';
import { DocumentNotFound } from '../../models/Document.mjs';

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
    stakeholders : ["lkab","regional_authority"],
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
    stakeholders : ["lkab","regional_authority"],
};

describe("Unit Test getDocumentById", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new DocumentDAO();
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

        const result = await documentDAO.getDocumentById(999).catch(err=>err);

        expect(result).toBeInstanceOf(DocumentNotFound)
        expect(db.get).toBeCalledTimes(1);
    });

    test("should reject with an error when a database error occurs", async () => {
        const error = new Error('Database error');
        vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(error, null);
        });

        const res = await documentDAO.getDocumentById(1).catch(err=>err)

        expect(res).toBeInstanceOf(Error)
        expect(db.get).toBeCalledTimes(1);
    });
});

describe("Unit Test addDocument", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new DocumentDAO();
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
            callback.call({ lastID }, null); // Simulate successful insertion with lastID
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
            callback.call({ lastID }, null); // Simulate successful insertion with lastID
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
            callback(error,null); // Simulate an error during insertion
        });

        const res = await documentDAO.addDocument(mockinvalidRowDocument).catch(err=>err);
        expect(res).toBeInstanceOf(Error)
    });
});