import { vitest } from 'vitest';
import FileDAO from '../../dao/FileDAO.mjs';
import db from '../../db'; // Assuming you have a db module for database operations

describe("Unit Test storeFile", () => {
    let fileDAO;

    beforeEach(() => {
        fileDAO = new FileDAO();
    });

    afterEach(() => {
        vitest.clearAllMocks();
    });

    test("should insert a file and return its attachment ID", async () => {
        const mockFile = {
            name: 'testfile.txt',
            type: 'text/plain',
            path: '/path/to/testfile.txt'
        };
        const docId = 1;
        const fileId = 100; // Example ID for the inserted file
        const expectedAttachmentId = 200; // Example ID for the inserted attachment

        // Mock the db.run method for the file insertion
        const runMock = vitest.spyOn(db, "run");

        runMock.mockImplementationOnce((_sql, _params, callback) => {
            callback.call({ lastID: fileId }, null); // Simulate successful file insertion with fileId
        });

        // Mock the db.run method for the attachment insertion
        runMock.mockImplementationOnce((_sql, _params, callback) => {
            callback.call({ lastID: expectedAttachmentId }, null); // Simulate successful attachment insertion with attachmentId
        });

        const result = await fileDAO.storeFile(docId, mockFile);

        expect(result).toBe(expectedAttachmentId); // Expect the automatically generated attachment ID
        expect(db.run).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("INSERT INTO file"),
            [mockFile.name, mockFile.type, mockFile.path],
            expect.any(Function)
        );
        expect(db.run).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("INSERT INTO attachment"),
            [docId, fileId],
            expect.any(Function)
        );
    });    
        
    describe("Unit Test getFilesByDocumentId", () => {
        let fileDAO;
    
        beforeEach(() => {
            fileDAO = new FileDAO();
        });
    
        afterEach(() => {
            vitest.clearAllMocks();
        });
    
        test("should return files associated with a given document ID", async () => {
            const docId = 1;
            const mockFiles = [
                { id: 100, name: 'file1.txt', type: 'text/plain', path: '/path/to/file1.txt', fileId: 100, docId: 1 },
                { id: 101, name: 'file2.txt', type: 'text/plain', path: '/path/to/file2.txt', fileId: 101, docId: 1 }
            ];
    
            // Mock the db.all method
            vitest.spyOn(db, "all").mockImplementation((_sql, _params, callback) => {
                callback(null, mockFiles); // Simulate successful query with mockFiles
            });
    
            const result = await fileDAO.getFilesByDocumentId(docId);
    
            expect(result).toEqual(mockFiles);
            expect(db.all).toBeCalledWith(`
                SELECT *
                FROM file
                INNER JOIN attachment ON file.id = attachment.fileId
                WHERE attachment.docId = ?`,
                [docId],
                expect.any(Function)
            );
        });
    });
    describe("Unit Test deleteFile", () => {
        let fileDAO;
    
        beforeEach(() => {
            fileDAO = new FileDAO();
        });
    
        afterEach(() => {
            vitest.clearAllMocks();
        });
    
        test("should delete a file and return the number of changes", async () => {
            const fileId = 100; // Example ID for the file to be deleted
            const changes = 1; // Simulate one row affected
    
            // Mock the db.run method
            vitest.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
                callback.call({ changes }, null); // Simulate successful deletion with one change
            });
    
            const result = await fileDAO.deleteFile(fileId);
    
            expect(result).toBe(changes); // Expect the number of changes
            expect(db.run).toBeCalledWith(
                expect.stringContaining("DELETE FROM file WHERE id = ?"),
                [fileId],
                expect.any(Function)
            );
        });
    });
    describe("Unit Test getFilePathById", () => {
        let fileDAO;
    
        beforeEach(() => {
            fileDAO = new FileDAO();
        });
    
        afterEach(() => {
            vitest.clearAllMocks();
        });
    
        test("should return the file path for a given file ID", async () => {
            const fileId = 100; // Example ID for the file
            const mockFile = {
                id: fileId,
                name: 'testfile.txt',
                type: 'text/plain',
                path: '/path/to/testfile.txt'
            };
    
            // Mock the db.get method
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, mockFile); // Simulate successful query with mockFile
            });
    
            const result = await fileDAO.getFilePathById(fileId);
    
            expect(result).toBe(mockFile.path); // Expect the file path
            expect(db.get).toBeCalledWith(
                expect.stringContaining("SELECT * FROM file WHERE id = ?"),
                [fileId],
                expect.any(Function)
            );
        });
    });
});