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
import StakeholderDAO from '../../dao/StakeholderDAO.mjs';

const areaDAO = new AreaDAO();
const documentDAO = new DocumentDAO();
const mockRowDB = {
    id: 1,
    title: 'Test Document',
    date: '2023-01-01',
    typeId: 1, // Assuming 1 is the ID for 'design' in the document_type table
    language: 'English',
    description: 'A test document',
    areaId: 1,
    scale: '1:100',
    pages: 10,
    planNumber: 123,
    type_name: 'design'
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
    title: 'a', // Assuming title is required and cannot be empty
    date: 'invalid-date', // Invalid date format
    typeId: null, // Invalid typeId, should be a valid integer
    language: 'English',
    description: 'A test document',
    scale: '1:100',
    areaId: null, // Assuming areaId can be null
    pages: 10,
    planNumber: 123
};

const mockinvalidRowDocument = {
    title: 'a', // Assuming title is required and cannot be empty
    date: 'invalid-date', // Invalid date format
    type: 'design', // Assuming this is a valid type name
    language: 'English',
    description: 'A test document',
    scale: '1:100',
    areaId: null, // Assuming areaId can be null
    pages: 10,
    planNumber: 123,
    stakeholders: ["lkab", "regional_authority"], // These should be validated against the stakeholder table
};

describe("Unit Test getDocumentById", () => {
    let documentDAO;
    let areaDAO;

    beforeEach(() => {
        areaDAO = new AreaDAO();
        documentDAO = new DocumentDAO(areaDAO);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("should return a Document object when a valid ID is provided", async () => {
        // Mock db.get to return a document row
        vi.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(null, mockRowDB);
        });

        // Mock the method to get stakeholders for a document
        vi.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValueOnce(mockRowDocument.stakeholders);

        // Mock the conversion function
        vi.spyOn(documentDAO, "convertDBRowToDocument").mockReturnValueOnce(new Document(
            mockRowDocument.id,
            mockRowDocument.title,
            mockRowDocument.stakeholders,
            mockRowDocument.date,
            mockRowDocument.type,
            mockRowDocument.language,
            mockRowDocument.description,
            mockRowDocument.areaId,
            mockRowDocument.scale,
            mockRowDocument.pages,
            mockRowDocument.planNumber
        ));

        const document = await documentDAO.getDocumentById(1);

        expect(document).toEqual(new Document(
            mockRowDocument.id,
            mockRowDocument.title,
            mockRowDocument.stakeholders,
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
        expect(documentDAO.getStakeholdersForDocument).toBeCalledWith(1);
    });
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
        vi.spyOn(documentDAO, 'convertDocumentForDB').mockReturnValue({
            ...mockRowDB,
        });

        // Mock the db.run method
        const lastID = 42; // Example ID for the inserted document
        vi.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback.call({ lastID }, null);
        });

        const result = await documentDAO.addDocument(mockRowDocument);

        expect(result).toBe(lastID);
        expect(db.run).toBeCalledWith(
            expect.stringContaining("INSERT INTO document"),
            [
                mockRowDB.title,
                mockRowDB.date,
                mockRowDB.typeId,
                mockRowDB.language,
                mockRowDB.description,
                mockRowDB.scale,
                mockRowDB.areaId,
                mockRowDB.pages,
                mockRowDB.planNumber
            ],
            expect.any(Function)
        );
    });

    test("should insert a document and return its ID if areaId is not provided", async () => {
        // Mock the convertDocumentForDB method
        vi.spyOn(documentDAO, 'convertDocumentForDB').mockReturnValue({
            ...mockRowDB,
            areaId: null // Ensure areaId is null to simulate it not being provided
        });

        // Mock the db.run method
        const lastID = 42; // Example ID for the inserted document
        vi.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback.call({ lastID }, null); // Simulate successful insertion with lastID
        });

        const result = await documentDAO.addDocument(mockRowDocument);

        expect(result).toBe(lastID);
        expect(db.run).toBeCalledWith(
            expect.stringContaining("INSERT INTO document"),
            [
                mockRowDB.title,
                mockRowDB.date,
                mockRowDB.typeId,
                mockRowDB.language,
                mockRowDB.description,
                mockRowDB.scale,
                null,
                mockRowDB.pages,
                mockRowDB.planNumber
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
        // Mock data
        const documentId = 1;
        const oldAreaId = 2;
        const newAreaId = 3;

        const mockDocument = { id: documentId, areaId: oldAreaId };
        const mockDocuments = [
            { id: 1, areaId: oldAreaId },
            { id: 2, areaId: 4 },
        ]; // Other documents not using oldAreaId after update
        const mockUpdatedDocuments = [
            { id: 1, areaId: newAreaId },
            { id: 2, areaId: 4 },
        ]; // New state of documents after update
        const mockAreas = [
            { id: 2 },
            { id: 3 },
            { id: 4 },
        ]; // Existing areas in the system

        // Mock dependencies
        vi.spyOn(documentDAO, "getDocumentById").mockResolvedValue(mockDocument);
        vi.spyOn(documentDAO, "getAllDocuments")
            .mockResolvedValueOnce(mockDocuments) // Before update
            .mockResolvedValueOnce(mockUpdatedDocuments); // After update
        vi.spyOn(areaDAO, "getAllAreas").mockResolvedValue(mockAreas);

        // Mock database update query
        const dbRunMock = vi.fn((query, params, callback) => {
            callback(null); // Simulate success
        });
        vi.spyOn(db, "run").mockImplementation(dbRunMock);

        // Mock area deletion
        const deleteAreaMock = vi.fn().mockResolvedValue();
        vi.spyOn(areaDAO, "deleteAreaById").mockImplementation(deleteAreaMock);

        // Call the function
        const result = await documentDAO.updateDocumentAreaId(documentId, newAreaId);

        // Assertions
        expect(result).toBe(true); // Should return true

        // Validate that the document's areaId was updated
        expect(dbRunMock).toHaveBeenCalledWith(
            "UPDATE document SET areaId = ? WHERE id = ?",
            [newAreaId, documentId],
            expect.any(Function)
        );

        // Validate that the old areaId was deleted
        expect(deleteAreaMock).toHaveBeenCalledWith(oldAreaId);

        // Ensure all methods were called the correct number of times
        expect(documentDAO.getDocumentById).toHaveBeenCalledTimes(1);
        expect(documentDAO.getAllDocuments).toHaveBeenCalledTimes(2); // Before and after update
        expect(areaDAO.getAllAreas).toHaveBeenCalledTimes(1);
    });


    test("should reject with AreaNotFound if newAreaId does not exist in the area table", async () => {
        // Mock data
        const documentId = 1;
        const oldAreaId = 2;
        const newAreaId = 999; // Non-existent areaId

        const mockDocument = { id: documentId, areaId: oldAreaId };
        const mockDocuments = [
            { id: 1, areaId: oldAreaId },
            { id: 2, areaId: 4 },
        ]; // Documents before update
        const mockAreas = [
            { id: 2 },
            { id: 3 },
            { id: 4 },
        ]; // Available areas (newAreaId is missing)

        // Mock dependencies
        vi.spyOn(documentDAO, "getDocumentById").mockResolvedValue(mockDocument);
        vi.spyOn(documentDAO, "getAllDocuments").mockResolvedValue(mockDocuments);
        vi.spyOn(areaDAO, "getAllAreas").mockResolvedValue(mockAreas);

        // Call the function and catch the error
        await expect(documentDAO.updateDocumentAreaId(documentId, newAreaId)).rejects.toThrow(AreaNotFound);

        // Validate that no SQL update was performed
        expect(db.run).not.toHaveBeenCalled();

        // Ensure all methods were called the correct number of times
        expect(documentDAO.getDocumentById).toHaveBeenCalledTimes(1);
        expect(documentDAO.getAllDocuments).toHaveBeenCalledTimes(1); // Only fetched before finding the issue
        expect(areaDAO.getAllAreas).toHaveBeenCalledTimes(1);
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

        const documentId = 1;
        const oldAreaId = 2;
        const newAreaId = 3;

        const mockDocument = {
            id: documentId,
            areaId: oldAreaId,
        };

        const allDocumentsBeforeUpdate = [
            { id: 1, areaId: oldAreaId },
            { id: 2, areaId: oldAreaId }, // Another document with the same areaId
        ];

        const allDocumentsAfterUpdate = [
            { id: 1, areaId: newAreaId },
            { id: 2, areaId: oldAreaId }, // Still references oldAreaId
        ];

        const allAreas = [
            { id: oldAreaId, name: "Old Area" },
            { id: newAreaId, name: "New Area" },
        ];

        // Mock database and DAO behavior
        vi.spyOn(documentDAO, "getDocumentById").mockResolvedValueOnce(mockDocument);
        vi.spyOn(documentDAO, "getAllDocuments")
            .mockResolvedValueOnce(allDocumentsBeforeUpdate) // Before the update
            .mockResolvedValueOnce(allDocumentsAfterUpdate); // After the update
        vi.spyOn(areaDAO, "getAllAreas").mockResolvedValueOnce(allAreas);

        const dbRunMock = vi.spyOn(db, "run").mockImplementation((_query, _params, callback) => callback(null));
        const deleteAreaByIdMock = vi.spyOn(areaDAO, "deleteAreaById");

        // Execute the function
        const result = await documentDAO.updateDocumentAreaId(documentId, newAreaId);

        // Assertions
        expect(result).toBe(true);
        expect(dbRunMock).toHaveBeenCalledWith("UPDATE document SET areaId = ? WHERE id = ?", [newAreaId, documentId], expect.any(Function));
        expect(documentDAO.getAllDocuments).toHaveBeenCalledTimes(2); // Called before and after the update
        expect(deleteAreaByIdMock).not.toHaveBeenCalled(); // Old area should not be deleted
    });


});

describe("Unit Test getDocumentsByFilter", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new DocumentDAO();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("should return all documents when no filter parameters are provided", async () => {
        // Mock db.all to simulate a successful query
        vi.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, [mockRowDB]); // Simulate returning one or more rows from the database
        });

        // Mock the method to get stakeholders for a document
        vi.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValueOnce(mockRowDocument.stakeholders);

        // Mock the conversion function
        vi.spyOn(documentDAO, "convertDBRowToDocument").mockReturnValueOnce(new Document(
            mockRowDocument.id,
            mockRowDocument.title,
            mockRowDocument.stakeholders,
            mockRowDocument.date,
            mockRowDocument.type,
            mockRowDocument.language,
            mockRowDocument.description,
            mockRowDocument.areaId,
            mockRowDocument.scale,
            mockRowDocument.pages,
            mockRowDocument.planNumber
        ));

        const documents = await documentDAO.getDocumentsByFilter({}); // No filters provided

        // Expectations
        expect(documents).toHaveLength(1); // Should return all available documents
        expect(documents[0]).toEqual(new Document(
            mockRowDocument.id,
            mockRowDocument.title,
            mockRowDocument.stakeholders,
            mockRowDocument.date,
            mockRowDocument.type,
            mockRowDocument.language,
            mockRowDocument.description,
            mockRowDocument.areaId,
            mockRowDocument.scale,
            mockRowDocument.pages,
            mockRowDocument.planNumber
        ));

        // Define the formatted query
        const expectedQuery = `
            SELECT
                document.id,
                document.title,
                document.date,
                document.language,
                document.description,
                document.scale,
                document.areaId,
                document.pages,
                document.planNumber,
                document_type.name AS type_name
            FROM document
            LEFT JOIN document_type ON document.typeId = document_type.id
            WHERE 1=1
        `.replace(/\s+/g, " ").trim(); // Normalize whitespace for comparison

        // Extract and normalize the actual query
        const actualQuery = db.all.mock.calls[0][0].replace(/\s+/g, " ").trim();

        // Compare the normalized queries
        expect(actualQuery).toEqual(expectedQuery);

        // Ensure db.all was called once
        expect(db.all).toBeCalledTimes(1);

        // Ensure getStakeholdersForDocument was called with the correct ID
        expect(documentDAO.getStakeholdersForDocument).toBeCalledWith(mockRowDB.id);
    });

    test("should return documents that match the title filter", async () => {
        // Mock db.all to simulate a successful query
        vi.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, [mockRowDB]);
        });

        // Mock the method to get stakeholders for a document
        vi.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValueOnce(mockRowDocument.stakeholders);

        // Mock the conversion function
        vi.spyOn(documentDAO, "convertDBRowToDocument").mockReturnValueOnce(new Document(
            mockRowDocument.id,
            mockRowDocument.title,
            mockRowDocument.stakeholders,
            mockRowDocument.date,
            mockRowDocument.type,
            mockRowDocument.language,
            mockRowDocument.description,
            mockRowDocument.areaId,
            mockRowDocument.scale,
            mockRowDocument.pages,
            mockRowDocument.planNumber
        ));

        // Call the method with a title filter
        const titleFilter = "Test Document";
        const documents = await documentDAO.getDocumentsByFilter({ title: titleFilter });

        // Log the actual query for debugging
        console.log("Actual Query:", db.all.mock.calls[0][0]);
        console.log("Actual Params:", db.all.mock.calls[0][1]);

        // Normalize expected and actual queries for comparison
        const expectedQuery = `
            SELECT
                document.id,
                document.title,
                document.date,
                document.language,
                document.description,
                document.scale,
                document.areaId,
                document.pages,
                document.planNumber,
                document_type.name AS type_name
            FROM document
            LEFT JOIN document_type ON document.typeId = document_type.id
            WHERE 1=1
            AND document.title LIKE ?
        `.replace(/\s+/g, " ").trim();

        const actualQuery = db.all.mock.calls[0][0].replace(/\s+/g, " ").trim();

        // Compare normalized queries
        expect(actualQuery).toEqual(expectedQuery);

        // Verify the parameters passed to the query
        expect(db.all.mock.calls[0][1]).toEqual([`%${titleFilter}%`]);

        // Assertions
        expect(documents).toHaveLength(1);
        expect(db.all).toBeCalledTimes(1);
    });


    test("should return documents that match the startDate filter", async () => {
        // Mock db.all to simulate a successful query
        vi.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, [mockRowDB]);
        });

        // Mock the method to get stakeholders for a document
        vi.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValueOnce(mockRowDocument.stakeholders);

        // Mock the conversion function
        vi.spyOn(documentDAO, "convertDBRowToDocument").mockReturnValueOnce(new Document(
            mockRowDocument.id,
            mockRowDocument.title,
            mockRowDocument.stakeholders,
            mockRowDocument.date,
            mockRowDocument.type,
            mockRowDocument.language,
            mockRowDocument.description,
            mockRowDocument.areaId,
            mockRowDocument.scale,
            mockRowDocument.pages,
            mockRowDocument.planNumber
        ));

        // Call the method with a startDate filter
        const startDateFilter = "2023-01-01";
        const documents = await documentDAO.getDocumentsByFilter({ startDate: startDateFilter });

        // Log the actual query for debugging
        console.log("Actual Query:", db.all.mock.calls[0][0]);
        console.log("Actual Params:", db.all.mock.calls[0][1]);

        // Normalize expected and actual queries for comparison
        const expectedQuery = `
            SELECT
                document.id,
                document.title,
                document.date,
                document.language,
                document.description,
                document.scale,
                document.areaId,
                document.pages,
                document.planNumber,
                document_type.name AS type_name
            FROM document
            LEFT JOIN document_type ON document.typeId = document_type.id
            WHERE 1=1
            AND document.date >= ?
        `.replace(/\s+/g, " ").trim();

        const actualQuery = db.all.mock.calls[0][0].replace(/\s+/g, " ").trim();

        // Compare normalized queries
        expect(actualQuery).toEqual(expectedQuery);

        // Verify the parameters passed to the query
        expect(db.all.mock.calls[0][1]).toEqual([startDateFilter]);

        // Assertions
        expect(documents).toHaveLength(1);
        expect(db.all).toBeCalledTimes(1);
    });

    test("should return documents that match the endDate filter", async () => {
        // Mock db.all to simulate a successful query
        vi.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, [mockRowDB]);
        });

        // Mock the method to get stakeholders for a document
        vi.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValueOnce(mockRowDocument.stakeholders);

        // Mock the conversion function
        vi.spyOn(documentDAO, "convertDBRowToDocument").mockReturnValueOnce(new Document(
            mockRowDocument.id,
            mockRowDocument.title,
            mockRowDocument.stakeholders,
            mockRowDocument.date,
            mockRowDocument.type,
            mockRowDocument.language,
            mockRowDocument.description,
            mockRowDocument.areaId,
            mockRowDocument.scale,
            mockRowDocument.pages,
            mockRowDocument.planNumber
        ));

        // Call the method with an endDate filter
        const endDateFilter = "2023-12-31";
        const documents = await documentDAO.getDocumentsByFilter({ endDate: endDateFilter });

        // Log the actual query for debugging
        console.log("Actual Query:", db.all.mock.calls[0][0]);
        console.log("Actual Params:", db.all.mock.calls[0][1]);

        // Normalize expected and actual queries for comparison
        const expectedQuery = `
            SELECT
                document.id,
                document.title,
                document.date,
                document.language,
                document.description,
                document.scale,
                document.areaId,
                document.pages,
                document.planNumber,
                document_type.name AS type_name
            FROM document
            LEFT JOIN document_type ON document.typeId = document_type.id
            WHERE 1=1
            AND document.date <= ?
        `.replace(/\s+/g, " ").trim();

        const actualQuery = db.all.mock.calls[0][0].replace(/\s+/g, " ").trim();

        // Compare normalized queries
        expect(actualQuery).toEqual(expectedQuery);

        // Verify the parameters passed to the query
        expect(db.all.mock.calls[0][1]).toEqual([endDateFilter]);

        // Assertions
        expect(documents).toHaveLength(1);
        expect(db.all).toBeCalledTimes(1);
    });

});


describe("Unit Test getDocumentsWithPagination", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new DocumentDAO();
    });

    afterEach(() => {
        vitest.clearAllMocks();
    });

    test("should return all documents with default pagination when no filters are provided", async () => {
        const mockRows = [
            { id: 1, title: "Doc 1", type_name: "design", date: "2023-01-01" },
            { id: 2, title: "Doc 2", type_name: "report", date: "2023-01-02" },
        ];

        vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(null, mockRows);
        });

        vitest.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValue([]);

        const documents = await documentDAO.getDocumentsWithPagination();

        expect(documents).toHaveLength(2);
        expect(documents[0].title).toBe("Doc 1");
        expect(documents[1].type).toBe("report");
        expect(db.all).toBeCalledTimes(1);
    });

    test("should filter documents by type", async () => {
        const mockRows = [
            { id: 1, title: "Design Doc", type_name: "design", date: "2023-01-01" },
        ];

        vitest.spyOn(db, "all").mockImplementation((_sql, params, callback) => {
            expect(params).toContain("design");
            callback(null, mockRows);
        });

        vitest.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValue([]);

        const documents = await documentDAO.getDocumentsWithPagination({ type: "design" });

        expect(documents).toHaveLength(1);
        expect(documents[0].type).toBe("design");
        expect(db.all).toBeCalledTimes(1);
    });

    test("should filter documents by title", async () => {
        const mockRows = [
            { id: 1, title: "Test Title", type_name: "design", date: "2023-01-01" },
        ];

        vitest.spyOn(db, "all").mockImplementation((_sql, params, callback) => {
            expect(params).toContain("%Test%");
            callback(null, mockRows);
        });

        vitest.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValue([]);

        const documents = await documentDAO.getDocumentsWithPagination({ title: "Test" });

        expect(documents).toHaveLength(1);
        expect(documents[0].title).toBe("Test Title");
        expect(db.all).toBeCalledTimes(1);
    });

    test("should filter documents by stakeholders", async () => {
        const mockRows = [
            { id: 1, title: "Stakeholder Doc", type_name: "design", date: "2023-01-01" },
        ];

        vitest.spyOn(db, "all").mockImplementation((_sql, params, callback) => {
            expect(params).toContain("lkab");
            callback(null, mockRows);
        });

        vitest.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValue(["lkab"]);

        const documents = await documentDAO.getDocumentsWithPagination({ stakeholders: ["lkab"] });

        expect(documents).toHaveLength(1);
        expect(documents[0].title).toBe("Stakeholder Doc");
        expect(db.all).toBeCalledTimes(1);
    });

    test("should filter documents by date range", async () => {
        const mockRows = [
            { id: 1, title: "Date Range Doc", type_name: "design", date: "2023-01-02" },
        ];

        vitest.spyOn(db, "all").mockImplementation((_sql, params, callback) => {
            expect(params).toContain("2023-01-01");
            expect(params).toContain("2023-01-05");
            callback(null, mockRows);
        });

        vitest.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValue([]);

        const documents = await documentDAO.getDocumentsWithPagination({ startDate: "2023-01-01", endDate: "2023-01-05" });

        expect(documents).toHaveLength(1);
        expect(documents[0].date).toBe("2023-01-02");
        expect(db.all).toBeCalledTimes(1);
    });

    test("should apply pagination correctly", async () => {
        const mockRows = [
            { id: 1, title: "Paginated Doc", type_name: "design", date: "2023-01-01" },
        ];

        vitest.spyOn(db, "all").mockImplementation((_sql, params, callback) => {
            expect(params).toContain(5); // Limit
            expect(params).toContain(10); // Offset
            callback(null, mockRows);
        });

        vitest.spyOn(documentDAO, "getStakeholdersForDocument").mockResolvedValue([]);

        const documents = await documentDAO.getDocumentsWithPagination({ offset: 10 });

        expect(documents).toHaveLength(1);
        expect(documents[0].title).toBe("Paginated Doc");
        expect(db.all).toBeCalledTimes(1);
    });

    test("should handle database errors gracefully", async () => {
        const error = new Error("Database error");

        vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
            callback(error, null);
        });

        const result = await documentDAO.getDocumentsWithPagination().catch(err => err);

        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe("Database error");
        expect(db.all).toBeCalledTimes(1);
    });
});
describe("Unit Test addStakeholders", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new DocumentDAO();
    });

    afterEach(() => {
        vitest.clearAllMocks();
    });

    test("should resolve immediately if no stakeholders are provided", async () => {
        const result = await documentDAO.addStakeholders(1, []);
        expect(result).toBeUndefined(); // addStakeholders should resolve with undefined
    });
});

describe("getDocumentStakeholders", () => {
    let documentDAO;

    beforeEach(() => {
        documentDAO = new StakeholderDAO(); // Assuming DocumentDAO contains this.getDocumentStakeholders
 
    });

    afterEach(() => {
        vitest.clearAllMocks();
    });

    test("should retrieve stakeholders successfully", async () => {
        const mockRows = [
            { id: 1, name: "Stakeholder 1", email: "stakeholder1@example.com" },
            { id: 2, name: "Stakeholder 2", email: "stakeholder2@example.com" },
        ];

        const mockDbAll = vitest.spyOn(db, "all").mockImplementation((query, params, callback) => {
            expect(query).toBe(`SELECT * FROM stakeholder WHERE id IN (SELECT stakeholderId FROM document_stakeholder WHERE docId = ?)`);
            expect(params).toEqual([42]); // Assuming docId is 42
            callback(null, mockRows);
        });

        const docId = 42;
        const result = await documentDAO.getDpcumentStakeholders(docId);

        expect(result).toEqual(mockRows);
        expect(mockDbAll).toHaveBeenCalledTimes(1);
        expect(mockDbAll).toHaveBeenCalledWith(
            `SELECT * FROM stakeholder WHERE id IN (SELECT stakeholderId FROM document_stakeholder WHERE docId = ?)`,
            [42],
            expect.any(Function)
        );
    });
});