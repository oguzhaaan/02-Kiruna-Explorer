// 02-Kiruna-Explorer/kiruna-explorer-server/test/document.test.js
import { describe, beforeEach, afterEach, test, expect, vitest } from 'vitest';
import db from '../../db.mjs';
import DocumentDAO from '../../dao/DocumentDAO.mjs';
import Document from '../../models/Document.mjs';

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
        const mockRow = {
            id: 1,
            title: 'Test Document',
            lkab: true, // Mocking boolean fields
            municipality: false,
            regional_authority: true,
            architecture_firms: false,
            citizens: true,
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

        vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(null, mockRow);
        });

        const document = await documentDAO.getDocumentById(1);

        expect(document).toEqual(new Document(
            mockRow.id,
            mockRow.title,
            ['lkab', 'regional authority', 'citizens'], // Expected stakeholders array
            mockRow.date,
            mockRow.type,
            mockRow.language,
            mockRow.description,
            mockRow.areaId,
            mockRow.scale,
            mockRow.pages,
            mockRow.planNumber
        ));
        expect(db.get).toBeCalledTimes(1);
    });

    test("should return false when no document is found", async () => {
        vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(null, undefined);
        });

        const result = await documentDAO.getDocumentById(999);

        expect(result).toBe(false);
        expect(db.get).toBeCalledTimes(1);
    });

    test("should reject with an error when a database error occurs", async () => {
        const error = new Error('Database error');
        vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(error, null);
        });

        await expect(documentDAO.getDocumentById(1)).rejects.toThrow('Database error');
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
        const mockDocumentData = {
            title: 'Test Document',
            date: '2023-01-01',
            type: 'design',
            language: 'English',
            description: 'A test document',
            scale: '1:100',
            areaId: 1,
            pages: 10,
            planNumber: 123,
            lkab: true,
            municipality: false,
            regional_authority: true,
            architecture_firms: false,
            citizens: true,
            others: false
        };
        const expectedDbDocument = {
            ...mockDocumentData,
            lkab: 1,
            municipality: 0,
            regional_authority: 1,
            architecture_firms: 0,
            citizens: 1,
            others: 0
        };

        // Mock the convertDocumentForDB method
        vitest.spyOn(documentDAO, 'convertDocumentForDB').mockReturnValue(expectedDbDocument);

         // Mock the db.run method
         const lastID = 42; // Example ID for the inserted document
         vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback.call({ lastID }, null); // Simulate successful insertion with lastID
        });

        const result = await documentDAO.addDocument(mockDocumentData);

        expect(result).toBe(lastID);
        expect(db.run).toBeCalledWith(
            expect.stringContaining("INSERT INTO document"),
            [
                expectedDbDocument.title,
                expectedDbDocument.date,
                expectedDbDocument.type,
                expectedDbDocument.language,
                expectedDbDocument.description,
                expectedDbDocument.scale,
                expectedDbDocument.areaId,
                expectedDbDocument.pages,
                expectedDbDocument.planNumber,
                expectedDbDocument.lkab,
                expectedDbDocument.municipality,
                expectedDbDocument.regional_authority,
                expectedDbDocument.architecture_firms,
                expectedDbDocument.citizens,
                expectedDbDocument.others
            ],
            expect.any(Function)
        );
    });

    test("should insert a document and return its ID if areaID is not provided", async () => {
        const mockDocumentData = {
            title: 'Test Document',
            date: '2023-01-01',
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
            citizens: true,
            others: false
        };
        const expectedDbDocument = {
            ...mockDocumentData,
            lkab: 1,
            municipality: 0,
            regional_authority: 1,
            architecture_firms: 0,
            citizens: 1,
            others: 0
        };

        // Mock the convertDocumentForDB method
        vitest.spyOn(documentDAO, 'convertDocumentForDB').mockReturnValue(expectedDbDocument);

         // Mock the db.run method
         const lastID = 42; // Example ID for the inserted document
         vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback.call({ lastID }, null); // Simulate successful insertion with lastID
        });

        const result = await documentDAO.addDocument(mockDocumentData);

        expect(result).toBe(lastID);
        expect(db.run).toBeCalledWith(
            expect.stringContaining("INSERT INTO document"),
            [
                expectedDbDocument.title,
                expectedDbDocument.date,
                expectedDbDocument.type,
                expectedDbDocument.language,
                expectedDbDocument.description,
                expectedDbDocument.scale,
                expectedDbDocument.areaId, // should be null
                expectedDbDocument.pages,
                expectedDbDocument.planNumber,
                expectedDbDocument.lkab,
                expectedDbDocument.municipality,
                expectedDbDocument.regional_authority,
                expectedDbDocument.architecture_firms,
                expectedDbDocument.citizens,
                expectedDbDocument.others
            ],
            expect.any(Function)
        );
    });

    test("should reject with an error if input is invalid", async () => {
        const invalidDocumentData = {
            // Example of invalid data: missing required fields or invalid types
            title: '', // Assuming title is required and cannot be empty
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
            citizens: true,
            others: false
        };

        // Mock the convertDocumentForDB method to return the invalid data
        vitest.spyOn(documentDAO, 'convertDocumentForDB').mockReturnValue(invalidDocumentData);

        // Mock the db.run method to simulate an error due to invalid input
        const error = new Error('Invalid input data');
        vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback(error); // Simulate an error during insertion
        });

        await expect(documentDAO.addDocument(invalidDocumentData)).rejects.toThrow('Invalid input data');
    });
});