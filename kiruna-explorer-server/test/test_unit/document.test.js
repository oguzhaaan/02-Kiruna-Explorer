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