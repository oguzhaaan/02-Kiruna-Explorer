import { describe, beforeEach, afterEach, test, expect, vitest } from 'vitest';
import db from '../../db.mjs';
import DocumentDAO from '../../dao/DocumentDAO.mjs';
import DocumentLinksDAO from '../../dao/DocumentLinksDAO.mjs';
import Document from '../../models/Document.mjs';
import { DocumentNotFound } from '../../models/Document.mjs';
import Link from '../../models/Link.mjs';

describe("Unit Test CheckLinkExisting", () => {
    let linkdocumentDAO;

    beforeEach(() => {
        linkdocumentDAO = new DocumentLinksDAO();
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vitest.clearAllMocks();
    });

    test("Link exist and returns id", async () => {
        const mock_id = 1

        vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(null, mock_id);
        });

        const document = await linkdocumentDAO.checkLinkExists(1, 2, 'someConnectionType');
        expect(document).toBe(1)
        expect(db.get).toHaveBeenCalledOnce();
    });

    test('should reject with an error when there is a database error', async () => {
        // Mock the db.get to simulate an error
        const mockError = new Error('Database error');
        db.get.mockImplementation((query, params, callback) => {
          callback(mockError, null);
        });
    
        // Call the function and catch the error
        await expect(linkdocumentDAO.checkLinkExists(1, 2, 'someConnectionType')).rejects.toThrow('Database error');
        expect(db.get).toHaveBeenCalledOnce();
      });

});

describe('deleteAll', () => {
    let linkdocumentDAO;

    beforeEach(() => {
        linkdocumentDAO = new DocumentLinksDAO();
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vitest.clearAllMocks();
    });

    test('should resolve with the number of rows deleted when deletion is successful', async () => {
      // Mock db.run to simulate a successful deletion with a specific number of rows deleted
      vitest.spyOn(db, "run").mockImplementation((query, params, callback) => {
        callback.call({changes:3}, null); // No error
      });
  
      // Call the function and check the result
      const result = await linkdocumentDAO.deleteAll(1);
      expect(result).toEqual({ deletedCount: 3 });
      expect(db.run).toHaveBeenCalledOnce();
    });
  
    test('should reject with an error when there is a database error', async () => {
      // Mock db.run to simulate a database error
      const mockError = new Error('Database error');
      vitest.spyOn(db, "run").mockImplementation((query, params, callback) => {
        callback(mockError); // Simulate an error
      });
  
      // Call the function and check for rejection
      await expect(linkdocumentDAO.deleteAll(1)).rejects.toThrow('Database error');
      expect(db.run).toHaveBeenCalledOnce();
    });
  });


  describe('delete Links', () => {
    let linkdocumentDAO;

    beforeEach(() => {
        linkdocumentDAO = new DocumentLinksDAO();
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vitest.clearAllMocks();
    });

    test('should successfully delete links', async () => {
        const mockLinks = [
          { originalDocId: '1', selectedDocId: '2', connectionType: 'related' }
        ];
    
        const mockRows = [{ id: 3 }, { id: 4 }];
        vitest.spyOn(db, "all").mockImplementation((query, param, callback) => {
          callback(null, mockRows); // Simulate retrieving rows to delete
        });
        vitest.spyOn(db, "run").mockImplementation((query, callback) => {
          callback(null); // Simulate successful deletion
        });
    
        await linkdocumentDAO.deleteLinks(mockLinks);
    
        expect(db.all).toHaveBeenCalledOnce();
        expect(db.run).toHaveBeenCalledOnce();
      });
    
      test('should resolve immediately if links array is empty', async () => {
        await linkdocumentDAO.deleteLinks([]); // Empty links array should return immediately
    
        expect(db.all).not.toHaveBeenCalled();
        expect(db.run).not.toHaveBeenCalled();
      });
    
      test('should return database error for db.all', async () => {
        const mockLinks = [
          { originalDocId: '1', selectedDocId: '2', connectionType: 'related' }
        ];
    
        const mockError = new Error('Database retrieval error');
        vitest.spyOn(db, "all").mockImplementation((query, param, callback) => {
          callback(mockError, null); // Simulate a database error during retrieval
        });
    
        await expect(linkdocumentDAO.deleteLinks(mockLinks)).rejects.toThrow('Unable to retrieve links for deletion');
        expect(db.all).toHaveBeenCalledOnce();
        expect(db.run).not.toHaveBeenCalled();
      });

      test('should return database error for db.run', async () => {
        const mockLinks = [
          { originalDocId: '1', selectedDocId: '2', connectionType: 'related' }
        ];
    
        const mockError = new Error('Database retrieval error');
        vitest.spyOn(db, "all").mockImplementation((query, param, callback) => {
          callback(null, mockLinks); // Simulate a database error during retrieval
        });

        vitest.spyOn(db, "run").mockImplementation((query, callback) => {
            callback(mockError, null); // Simulate a database error during retrieval
          });
    
        await expect(linkdocumentDAO.deleteLinks(mockLinks)).rejects.toThrow("Unable to delete the links.");

        expect(db.all).toHaveBeenCalledOnce();
        expect(db.run).toHaveBeenCalledOnce();
      });

  });

  describe('Get links by document id', () => {
    let linkdocumentDAO;

    beforeEach(() => {
        linkdocumentDAO = new DocumentLinksDAO();
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vitest.clearAllMocks();
    });

    test('should return all links of a specific document successfully', async () => {
        // Mock db.all to simulate a successful query returning rows
        const mockRows = [
          { id: 1, doc1Id: '1', doc2Id: '2', date: '2023-01-01', connection: 'related' },
          { id: 2, doc1Id: '1', doc2Id: '3', date: '2023-01-02', connection: 'cited' }
        ];
        vitest.spyOn(db, "all").mockImplementation((query, params, callback) => {
          callback(null, mockRows);
        });
    
        const result = await linkdocumentDAO.getLinksByDocumentId(1);
    
        expect(result).toEqual([
          new Link(1, '1', '2', '2023-01-01', 'related'),
          new Link(2, '1', '3', '2023-01-02', 'cited')
        ]);
        expect(db.all).toHaveBeenCalledOnce();
      });
    
      test('should return empty array if no links are found', async () => {
        // Mock db.all to simulate a successful query with no matching rows
        vitest.spyOn(db, "all").mockImplementation((query, params, callback) => {
          callback(null, []); // No rows found
        });
    
        const result = await linkdocumentDAO.getLinksByDocumentId(1);
    
        expect(result).toEqual([]); // Should resolve to an empty array
        expect(db.all).toHaveBeenCalledOnce();
      });
    
      test('should return a database error', async () => {
        // Mock db.all to simulate a database error
        const mockError = new Error('Database error');
        vitest.spyOn(db, "all").mockImplementation((query, params, callback) => {
          callback(mockError, null); // Simulate error
        });
    
        await expect(linkdocumentDAO.getLinksByDocumentId(1)).rejects.toThrow('Database error');
        expect(db.all).toHaveBeenCalledOnce();
      });
    })


    describe('Add link to document', () => {
        let linkdocumentDAO;
    
        beforeEach(() => {
            linkdocumentDAO = new DocumentLinksDAO();
        });
    
        afterEach(() => {
            // Clear all created function mocks after each test
            vitest.clearAllMocks();
        });

        test('should return lastID when success adding', async () => {
            vitest.spyOn(db, "run").mockImplementation((query, params, callback) => {
                callback.call({ lastID:1 }, null);
            });
            const result = await linkdocumentDAO.addLinktoDocument({ doc1Id: '1', doc2Id: '2', date: '2023-01-01', connection: 'related' });
            expect(result).toBe(1);
            expect(db.run).toHaveBeenCalledOnce();
          });
      
        test('should return Database error', async () => {
            const mockError = new Error('Database error');
            vitest.spyOn(db, "run").mockImplementation((query, params, callback) => callback(mockError));
            await expect(linkdocumentDAO.addLinktoDocument({ doc1Id: '1', doc2Id: '2', date: '2023-01-01', connection: 'related' })).rejects.toThrow('Database error');
        });

    })

    describe('Add link to document at insertion time', () => {
        let linkdocumentDAO;
    
        beforeEach(() => {
            linkdocumentDAO = new DocumentLinksDAO();
        });
    
        afterEach(() => {
            // Clear all created function mocks after each test
            vitest.clearAllMocks();
        });

        test('should return lastID when success adding', async () => {
            vitest.spyOn(db, "run").mockImplementation((query, params, callback) => {
                callback.call({ lastID:2 }, null);
            });
            const result = await linkdocumentDAO.addLinkstoDocumentAtInsertionTime({ selectedDocId: '3', date: '2023-01-02', connectionType: 'cited' }, 1);
            expect(result).toBe(2);
            expect(db.run).toHaveBeenCalledOnce();
          });
      
        test('should return Database error', async () => {
            const mockError = new Error('Database error');
            vitest.spyOn(db, "run").mockImplementation((query, params, callback) => callback(mockError));
            await expect(linkdocumentDAO.addLinkstoDocumentAtInsertionTime({ selectedDocId: '3', date: '2023-01-02', connectionType: 'cited' }, 1)).rejects.toThrow('Database error');
        });
    })

    describe('Add link to document at insertion time', () => {
        let linkdocumentDAO;
    
        beforeEach(() => {
            linkdocumentDAO = new DocumentLinksDAO();
        });
    
        afterEach(() => {
            // Clear all created function mocks after each test
            vitest.clearAllMocks();
        });

        test('should return lastID when success adding', async () => {
            vitest.spyOn(db, "run").mockImplementation((query, params, callback) => {
                callback.call({ lastID:2 }, null);
            });
            const result = await linkdocumentDAO.addLinkstoDocumentAtInsertionTime({ selectedDocId: 3, date: '2023-01-02', connectionType: 'cited' }, 1);
            expect(result).toBe(2);
            expect(db.run).toHaveBeenCalledOnce();
          });
      
        test('should return Database error', async () => {
            const mockError = new Error('Database error');
            vitest.spyOn(db, "run").mockImplementation((query, params, callback) => callback(mockError));
            await expect(linkdocumentDAO.addLinkstoDocumentAtInsertionTime({ selectedDocId: 3, date: '2023-01-02', connectionType: 'cited' }, 1)).rejects.toThrow('Database error');
        });
    })

    describe('is Link', () => {
        let linkdocumentDAO;
    
        beforeEach(() => {
            linkdocumentDAO = new DocumentLinksDAO();
        });
    
        afterEach(() => {
            // Clear all created function mocks after each test
            vitest.clearAllMocks();
        });

        test('should return true if it is a link', async () => {
            vitest.spyOn(db, "all").mockImplementation((query, params, callback) => callback(null, [{}])); // Simulate a found row
            const result = await linkdocumentDAO.isLink({ doc1Id: 1, doc2Id: 2, connection: 'related' });
            expect(result).toBe(true);
            expect(db.all).toHaveBeenCalledOnce();
        });
      
        test('should return false if it is not a link', async () => {
            vitest.spyOn(db, "all").mockImplementation((query, params, callback) => callback(null, [])); // No matching rows
            const result = await linkdocumentDAO.isLink({ doc1Id: 1, doc2Id: 2, connection: 'related' });
            expect(result).toBe(false);
            expect(db.all).toHaveBeenCalledOnce();
        });
    
        test('should return a Database error', async () => {
            const mockError = new Error('Database error');
            vitest.spyOn(db, "all").mockImplementation((query, params, callback) => callback(mockError));
            await expect(linkdocumentDAO.isLink({ doc1Id: 1, doc2Id: 2, connection: 'related' })).rejects.toThrow('Database error');
        });
    })

    describe('get Possible Links', () => {
        let linkdocumentDAO;
    
        beforeEach(() => {
            linkdocumentDAO = new DocumentLinksDAO();
        });
    
        afterEach(() => {
            // Clear all created function mocks after each test
            vitest.clearAllMocks();
        });

        test('should resolve with an array of possible links if found', async () => {
            const mockRows = [
              { id: '3', title: 'Document 3' },
              { id: '4', title: 'Document 4' }
            ];
            vitest.spyOn(db, "all").mockImplementation((query, params, callback) => callback(null, mockRows));
            const result = await linkdocumentDAO.getPossibleLinks(1);
            expect(result).toEqual(mockRows);
            expect(db.all).toHaveBeenCalledOnce();
        });
      
          test('should resolve with an empty array if no links are found', async () => {
            vitest.spyOn(db, "all").mockImplementation((query, params, callback) => callback(null, [])); // No rows found
            const result = await linkdocumentDAO.getPossibleLinks(1);
            expect(result).toEqual([]);
            expect(db.all).toHaveBeenCalledOnce();
        });
      
        test('should reject with an error if there is a database error', async () => {
            const mockError = new Error('Database error');
            vitest.spyOn(db, "all").mockImplementation((query, params, callback) => callback(mockError));
            await expect(linkdocumentDAO.getPossibleLinks(1)).rejects.toThrow('Database error');
        });
    })





