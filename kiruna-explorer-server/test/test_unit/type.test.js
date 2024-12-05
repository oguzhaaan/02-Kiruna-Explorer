import { describe, beforeEach, afterEach, test, expect, vitest } from "vitest";
import db from "../../db.mjs";
import DocumentTypDAO from "../../dao/DocumentTypDAO.mjs";
import {
    InvalidDocumentType,
    DocumentTypeNameAlreadyExists,
} from "../../models/DocumentType.mjs";

const documentTypeDAO = new DocumentTypDAO();

describe("Unit Tests for DocumentTypDAO", () => {
    beforeEach(() => {
        vitest.clearAllMocks();
    });

    describe("getAllDocumentTypes", () => {
        beforeEach(()=>{
            vitest.clearAllMocks()
        })
        test("should return an array of document types when the query is successful", async () => {
            const mockRows = [
                { id: 1, name: "Type 1" },
                { id: 2, name: "Type 2" },
            ];

            vitest.spyOn(db, "all").mockImplementation((_sql, callback) => {
                callback(null, mockRows);
            });

            const result = await documentTypeDAO.getAllDocumentTypes();

            expect(result).toHaveLength(2);
            expect(result.map(type => type.name)).toEqual(["Type 1", "Type 2"]);
            expect(db.all).toBeCalledTimes(1);
        });

        test("should reject with an error when the database query fails", async () => {
            vitest.spyOn(db, "all").mockImplementation((_sql, callback) => {
                callback(new Error("Database error"), null);
            });

            const result = await documentTypeDAO.getAllDocumentTypes().catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Database error");
            expect(db.all).toBeCalledTimes(1);
        });
    });

    describe("getDocumentTypeByName", () => {
        beforeEach(()=>{
            vitest.clearAllMocks()
        })
        test("should return a document type when a valid name is provided", async () => {
            const mockRow = { id: 1, name: "Type 1" };

            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, mockRow);
            });

            const result = await documentTypeDAO.getDocumentTypeByName("Type 1");

            expect(result).toEqual(mockRow);
            expect(db.get).toBeCalledTimes(1);
        });

        test("should return undefined when no document type is found", async () => {
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, undefined);
            });

            const result = await documentTypeDAO.getDocumentTypeByName("Nonexistent Type");

            expect(result).toBeUndefined();
            expect(db.get).toBeCalledTimes(1);
        });

        test("should reject with an error when the database query fails", async () => {
            const error = new Error("Database error");
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(error, null);
            });

            const result = await documentTypeDAO.getDocumentTypeByName("Type 1").catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Database error");
            expect(db.get).toBeCalledTimes(1);
        });
    });

    describe("getDocumentTypeById", () => {
        beforeEach(()=>{
            vitest.clearAllMocks()
        })
        test("should return a document type when a valid ID is provided", async () => {
            const mockRow = { id: 1, name: "Type 1" };

            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, mockRow);
            });

            const result = await documentTypeDAO.getDocumentTypeById(1);

            expect(result).toEqual(mockRow);
            expect(db.get).toBeCalledTimes(1);
        });

        test("should return undefined when no document type is found", async () => {
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, undefined);
            });

            const result = await documentTypeDAO.getDocumentTypeById(999);

            expect(result).toBeUndefined();
            expect(db.get).toBeCalledTimes(1);
        });

        test("should reject with an error when the database query fails", async () => {
            const error = new Error("Database error");
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(error, null);
            });

            const result = await documentTypeDAO.getDocumentTypeById(1).catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Database error");
            expect(db.get).toBeCalledTimes(1);
        });
    });

    describe("addDocumentType", () => {
        beforeEach(()=>{
            vitest.clearAllMocks()
        })
        test("should add a new document type and return its ID", async () => {

            vitest.spyOn(documentTypeDAO, "getDocumentTypeByName").mockResolvedValue(undefined);

            vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ lastID: 1 }, null);
            });

            const result = await documentTypeDAO.addDocumentType("New Type");

            expect(result).toBe(1);
            expect(db.run).toBeCalledTimes(1);
        });

        test("should throw InvalidDocumentType when the input is invalid", async () => {
            const result = await documentTypeDAO.addDocumentType(123).catch(err => err);

            expect(result).toBeInstanceOf(InvalidDocumentType);
        });

        test("should throw DocumentTypeNameAlreadyExists if the name already exists", async () => {
            vitest.spyOn(documentTypeDAO, "getDocumentTypeByName").mockResolvedValue({
                id: 1,
                name: "Existing Type",
            });

            const result = await documentTypeDAO.addDocumentType("Existing Type").catch(err => err);

            expect(result).toBeInstanceOf(DocumentTypeNameAlreadyExists);
        });

        test("should reject with an error when the insert query fails", async () => {
            vitest.spyOn(documentTypeDAO, "getDocumentTypeByName").mockResolvedValue(undefined);

            const error = new Error("Insert error");
            vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback(error);
            });

            const result = await documentTypeDAO.addDocumentType("New Type").catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Insert error");
            expect(db.run).toBeCalledTimes(1);
        });
    });
});
