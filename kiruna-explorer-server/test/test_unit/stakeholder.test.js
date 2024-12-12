import { describe, beforeEach, afterEach, test, expect, vitest } from 'vitest';
import db from '../../db.mjs';
import StakeholderDAO from '../../dao/StakeholderDAO.mjs';

const stakeholderDAO = new StakeholderDAO();

describe("Unit Tests for StakeholderDAO", () => {
    beforeEach(() => {
        vitest.clearAllMocks();
    });

    describe("getStakeholders", () => {
        test("should return an array of stakeholders when the query is successful", async () => {
            const mockRows = [
                { id: 1, name: "Stakeholder 1" },
                { id: 2, name: "Stakeholder 2" },
            ];

            vitest.spyOn(db, "all").mockImplementation((_sql, callback) => {
                callback(null, mockRows);
            });

            const result = await stakeholderDAO.getStakeholders();

            expect(result).toEqual(mockRows);
            expect(db.all).toBeCalledTimes(1);
        });

        test("should reject with an error when the database query fails", async () => {
            const error = new Error("Database error");
            vitest.spyOn(db, "all").mockImplementation((_sql, callback) => {
                callback(error, null);
            });

            const result = await stakeholderDAO.getStakeholders().catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Database error");
            expect(db.all).toBeCalledTimes(1);
        });
    });

    describe("getStakeHolderById", () => {
        test("should return a stakeholder object when a valid ID is provided", async () => {
            const mockRow = { id: 1, name: "Stakeholder 1" };

            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, mockRow);
            });

            const result = await stakeholderDAO.getStakeHolderById(1);

            expect(result).toEqual(mockRow);
            expect(db.get).toBeCalledTimes(1);
        });

        test("should return undefined when no stakeholder is found", async () => {
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, undefined);
            });

            const result = await stakeholderDAO.getStakeHolderById(999);

            expect(result).toBeUndefined();
            expect(db.get).toBeCalledTimes(1);
        });

        test("should reject with an error when the database query fails", async () => {
            const error = new Error("Database error");
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(error, null);
            });

            const result = await stakeholderDAO.getStakeHolderById(1).catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Database error");
            expect(db.get).toBeCalledTimes(1);
        });
    });

    describe("getStakeholderByName", () => {
        test("should return a stakeholder object when a valid name is provided", async () => {
            const mockRow = { id: 1, name: "Stakeholder 1" };

            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, mockRow);
            });

            const result = await stakeholderDAO.getStakeholderByName("Stakeholder 1");

            expect(result).toEqual(mockRow);
            expect(db.get).toBeCalledTimes(1);
        });

        test("should return undefined when no stakeholder is found", async () => {
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, undefined);
            });

            const result = await stakeholderDAO.getStakeholderByName("Nonexistent Stakeholder");

            expect(result).toBeUndefined();
            expect(db.get).toBeCalledTimes(1);
        });

        test("should reject with an error when the database query fails", async () => {
            const error = new Error("Database error");
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(error, null);
            });

            const result = await stakeholderDAO.getStakeholderByName("Stakeholder 1").catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Database error");
            expect(db.get).toBeCalledTimes(1);
        });
    });

    describe("addStakeholder", () => {
        test("should return the ID of the newly added stakeholder", async () => {
            vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ lastID: 1 }, null)
            });

            const result = await stakeholderDAO.addStakeholder("New Stakeholder");

            expect(result).toBe(1);
            expect(db.run).toBeCalledTimes(1);
        });

        test("should reject with an error when the insert query fails", async () => {
            const error = new Error("Insert error");
            vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback(error);
            });

            const result = await stakeholderDAO.addStakeholder("New Stakeholder").catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Insert error");
            expect(db.run).toBeCalledTimes(1);
        });
    });

    describe("getDocumentStakeholders", () => {
        test("should return an array of stakeholders for a document", async () => {
            const mockRows = [
                { id: 1, name: "Stakeholder 1" },
                { id: 2, name: "Stakeholder 2" },
            ];

            vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
                callback(null, mockRows);
            });

            const result = await stakeholderDAO.getDocumentStakeholders(1);

            expect(result).toEqual(mockRows);
            expect(db.all).toBeCalledTimes(1);
        });

        test("should reject with an error when the query fails", async () => {
            const error = new Error("Database error");
            vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
                callback(error, null);
            });

            const result = await stakeholderDAO.getDocumentStakeholders(1).catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Database error");
            expect(db.all).toBeCalledTimes(1);
        });
    });

    describe("addDocumentStakeholder", () => {
        test("should return the ID of the newly added document-stakeholder relation", async () => {
            vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ lastID: 1 }, null)
            });

            const result = await stakeholderDAO.addDocumentStakeholder(1, 1);

            expect(result).toBe(1);
            expect(db.run).toBeCalledTimes(1);
        });

        test("should reject with an error when the insert query fails", async () => {
            const error = new Error("Insert error");
            vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback(error);
            });

            const result = await stakeholderDAO.addDocumentStakeholder(1, 1).catch(err => err);

            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe("Insert error");
            expect(db.run).toBeCalledTimes(1);
        });
    });
});
