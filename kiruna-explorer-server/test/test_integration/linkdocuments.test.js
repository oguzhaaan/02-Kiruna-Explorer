import { describe, test, expect, beforeEach, vitest } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import { Role } from "../../models/User.mjs";

require('dotenv').config();

const basePath = "/api/documents";
const typePath = "/api/document-types";
const stakeholderPath = "/api/document-stakeholders";

const urbanplannerUser = { id: 1, username: "Romeo", password: process.env.URBAN_PLANNER_PASSWORD, role: Role.URBAN_PLANNER };
const residentUser = { id: 2, username: "Juliet", password: process.env.RESIDENT_PASSWORD, role: Role.RESIDENT };

let urbanplanner_cookie, resident_cookie;

const mockDocumentbody1 = {
    title: 'Test Document1',
    scale: 'plan',
    date: '2023-01-01',
    typeId: null,
    language: 'English',
    pages: 3,
    description: 'A test document',
    planNumber: 10,
};

const mockDocumentbody2 = {
    title: 'Test Document2',
    scale: 'plan',
    date: '2023-01-01',
    typeId: null,
    language: 'English',
    pages: 3,
    description: 'A test document',
    planNumber: 10,
};

const mockLinkbody = {
    doc1Id: null,
    doc2Id: null,
    connection: 'update',
    date: '2023-01-01',
};

// Helper functions
const login = async (userInfo) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`/api/sessions`)
            .send({ username: userInfo.username, password: userInfo.password })
            .expect(201)
            .end((err, res) => {
                if (err) reject(err);
                resolve(res.header["set-cookie"][0]);
            });
    });
};

const createtype = async (usercookie, typeName) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${typePath}`)
            .send({ name: typeName })
            .set("Cookie", usercookie)
            .expect(201)
            .end((err, res) => {
                if (err) reject(err);
                resolve(res.body.typeId);
            });
    });
};

const createStakeholders = async (usercookie, stakeholders) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${stakeholderPath}`)
            .send({ stakeholders })
            .set("Cookie", usercookie)
            .expect(201)
            .end((err, res) => {
                if (err) reject(res.message);
                resolve(res.body.ids);
            });
    });
};

const createDocument = async (usercookie, document) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${basePath}`)
            .send(document)
            .set("Cookie", usercookie)
            .expect(201)
            .end((err, res) => {
                if (err) reject(err);
                resolve(res.body.lastId);
            });
    });
};

const createLink = async (usercookie, d1, d2) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${basePath}/link`)
            .send({
                doc1Id: d1,
                doc2Id: d2,
                connection: 'update',
                date: '2023-01-01',
            })
            .set("Cookie", usercookie)
            .expect(200)
            .end((err, res) => {
                if (err) reject(err);
                resolve(res.body);
            });
    });
};

describe("Integration Test POST /link", () => {
    let mockTypeId;
    let mockStakeholdersIds;
    let doc1Id, doc2Id;

    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanplannerUser);
        resident_cookie = await login(residentUser);

        // Create type and stakeholders
        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        const stakeholders = ["Stakeholder1", "Stakeholder2"];
        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, stakeholders);

        // Update documents with typeId
        mockDocumentbody1.typeId = mockTypeId;
        mockDocumentbody2.typeId = mockTypeId;

        // Create documents
        doc1Id = await createDocument(urbanplanner_cookie, mockDocumentbody1);
        doc2Id = await createDocument(urbanplanner_cookie, mockDocumentbody2);
    });

    test("should return 400 if link is empty", async () => {
        await request(app)
            .post(`${basePath}/link`)
            .send({})
            .set("Cookie", urbanplanner_cookie)
            .expect(400);
    });

    test("should return 402 if link has invalid connection type", async () => {
        const invalidLink = { ...mockLinkbody, doc1Id, doc2Id, connection: 'invalid' };
        await request(app)
            .post(`${basePath}/link`)
            .send(invalidLink)
            .set("Cookie", urbanplanner_cookie)
            .expect(402);
    });

    test("should return 404 if document does not exist", async () => {
        const invalidLink = { ...mockLinkbody, doc1Id: 9999, doc2Id };
        await request(app)
            .post(`${basePath}/link`)
            .send(invalidLink)
            .set("Cookie", urbanplanner_cookie)
            .expect(404);
    });

    test("should return 403 because the resident user is not allowed to create links", async () => {
        const unauthorizedLink = { ...mockLinkbody, doc1Id, doc2Id };
        await request(app)
            .post(`${basePath}/link`)
            .send(unauthorizedLink)
            .set("Cookie", resident_cookie)
            .expect(403);
    });

    test("should return 200 if link is valid", async () => {
        const validLink = { ...mockLinkbody, doc1Id, doc2Id, connection: "direct_consequence" };
        const result = await request(app)
            .post(`${basePath}/link`)
            .send(validLink)
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

        expect(result.body).toEqual({ message: "Link added successfully" });
    });
});

describe("Integration Test POST /links", () => {
    let mockTypeId;
    let mockStakeholdersIds;
    let doc1Id, doc2Id, doc3Id, doc4Id;

    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanplannerUser);

        // Create type and stakeholders
        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        const stakeholders = ["Stakeholder1", "Stakeholder2"];
        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, stakeholders);

        // Update documents with typeId
        mockDocumentbody1.typeId = mockTypeId;
        mockDocumentbody2.typeId = mockTypeId;

        // Create documents
        doc1Id = await createDocument(urbanplanner_cookie, mockDocumentbody1);
        doc2Id = await createDocument(urbanplanner_cookie, mockDocumentbody2);
        doc3Id = await createDocument(urbanplanner_cookie, { ...mockDocumentbody1, title: "Test Document3" });
        doc4Id = await createDocument(urbanplanner_cookie, { ...mockDocumentbody2, title: "Test Document4" });
    });

    test("should return 200 if links array is valid", async () => {
        const validLinks = [
            { originalDocId: doc1Id, selectedDocId: doc2Id, connectionType: "projection", date: "2023-01-01" },
            { originalDocId: doc3Id, selectedDocId: doc4Id, connectionType: "direct_consequence", date: "2023-01-02" },
        ];

        const result = await request(app)
            .post(`${basePath}/links`)
            .send({ links: validLinks })
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

        expect(result.body).toEqual({ message: "Links added successfully" });
    });

    test("should return 402 if any link has an invalid connection type", async () => {
        const invalidLinks = [
            { originalDocId: doc1Id, selectedDocId: doc2Id, connectionType: "invalid_type", date: "2023-01-01" },
            { originalDocId: doc3Id, selectedDocId: doc4Id, connectionType: "direct_consequence", date: "2023-01-02" },
        ];

        const result = await request(app)
            .post(`${basePath}/links`)
            .send({ links: invalidLinks })
            .set("Cookie", urbanplanner_cookie)
            .expect(400);

        expect(result.body.error).toBe("Invalid connection type for the following links");
        expect(result.body.invalidLinks).toEqual([
            { originalDocId: doc1Id, selectedDocId: doc2Id, connectionType: "invalid_type", date: "2023-01-01" },
        ]);
    });
});
describe("Integration Test GET /:DocId/links", () => {
    let mockTypeId;
    let mockStakeholdersIds;
    let doc1Id, doc2Id, doc3Id;

    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanplannerUser);

        // Create type and stakeholders
        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        const stakeholders = ["Stakeholder1", "Stakeholder2"];
        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, stakeholders);

        // Update documents with typeId
        mockDocumentbody1.typeId = mockTypeId;
        mockDocumentbody2.typeId = mockTypeId;

        // Create documents
        doc1Id = await createDocument(urbanplanner_cookie, mockDocumentbody1);
        doc2Id = await createDocument(urbanplanner_cookie, mockDocumentbody2);
        doc3Id = await createDocument(urbanplanner_cookie, { ...mockDocumentbody1, title: "Test Document3" });

        // Create links
        await createLink(urbanplanner_cookie, doc1Id, doc2Id);
        await createLink(urbanplanner_cookie, doc1Id, doc3Id);
    });

    test("should return 200 with linked documents if DocId is valid", async () => {
        const result = await request(app)
            .get(`${basePath}/${doc1Id}/links`)
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

        const linkedDocs = [
            { id: doc2Id, title: "Test Document2", type: "testType", connection: "update" },
            { id: doc3Id, title: "Test Document3", type: "testType", connection: "update" },
        ];

        expect(result.body).toEqual(linkedDocs);
    });

    test("should return 400 if DocId is not valid", async () => {
        const result = await request(app)
            .get(`${basePath}/invalidId/links`)
            .set("Cookie", urbanplanner_cookie)
            .expect(400);

        expect(result.body.errors[0].msg).toBe("Document ID must be a valid number");
    });
});

describe("Integration Test DELETE /:DocId/links", () => {
    let mockTypeId;
    let doc1Id, doc2Id;

    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanplannerUser);

        // Create type
        mockTypeId = await createtype(urbanplanner_cookie, "testType");

        // Update documents with typeId
        mockDocumentbody1.typeId = mockTypeId;
        mockDocumentbody2.typeId = mockTypeId;

        // Create documents
        doc1Id = await createDocument(urbanplanner_cookie, mockDocumentbody1);
        doc2Id = await createDocument(urbanplanner_cookie, mockDocumentbody2);

        // Create link
        await createLink(urbanplanner_cookie, doc1Id, doc2Id);
    });

    test("should return 200 and delete all links if DocId is valid", async () => {
        const result = await request(app)
            .delete(`${basePath}/${doc1Id}/links`)
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

        expect(result.body).toEqual({ message: "All links deleted successfully" });
    });

    test("should return 400 if DocId is not valid", async () => {
        const result = await request(app)
            .delete(`${basePath}/invalidId/links`)
            .set("Cookie", urbanplanner_cookie)
            .expect(400);

        expect(result.body.errors[0].msg).toBe("Document ID must be a valid number");
    });
});
