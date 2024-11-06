import { describe, beforeEach, afterEach, test, expect, vitest } from 'vitest';
import db from '../../db.mjs';
import DocumentDAO from '../../dao/DocumentDAO.mjs';
import DocumentLinksDAO from '../../dao/DocumentLinksDAO.mjs';
import Document from '../../models/Document.mjs';
import { DocumentNotFound } from '../../models/Document.mjs';
import Link from '../../models/Link.mjs';

describe("Unit Test getDocumentById", () => {
    let linkdocumentDAO;

    beforeEach(() => {
        linkdocumentDAO = new DocumentLinksDAO();
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vitest.clearAllMocks();
    });

    test("should return Id ", async () => {
        const mock_id = 1

        vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(null, mock_id);
        });

        const document = await linkdocumentDAO.checkLinkExists();
        expect(document).toBe(1)

    });

});

