import { describe, test, expect, beforeEach, vitest } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import db from "../../db.mjs";
import DocumentDAO from "../../dao/DocumentDAO.mjs";

const basePath = "/api"

// Mock data for testing
const mockDocument = {
    id: 1,
    title: 'Test Document',
    stakeholders: ['Stakeholder A'],
    date: '2023-01-01',
    type: 'design',
    language: 'English',
    description: 'A test document',
    areaId: 1,
    scale: '1:100',
    pages: 10,
    planNumber: 123
};

describe("Integration Test GET /:DocId - Get Document by ID", () => {
    beforeEach(async () => {
        await cleanup(); 
    });

    test("should return a document for a valid document ID", async () => {
        // Mock the getDocumentById method
        const documentDAO = new DocumentDAO();
        vitest.spyOn(documentDAO, 'getDocumentById').mockResolvedValue(mockDocument);
        const result = await request(app)
            .get(`${basePath}/documents/1`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(result.body).toEqual(mockDocument);
    });

});


