import { describe, test, expect, beforeEach } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import { Role } from "../../models/User.mjs";
import path from "path";

require('dotenv').config();

const filePath = path.resolve(__dirname, '../file/test.pdf');
const videoPath = path.resolve(__dirname, '../file/video.mp4');
const basePath = "/api/documents";
const typePath = "/api/document-types";
const stakeholderPath = "/api/document-stakeholders";



// Helper functions
const login = async (userInfo) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`/api/sessions`)
            .send(userInfo)
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

const createDocument = async (usercookie, doc) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${basePath}`)
            .send(doc)
            .set("Cookie", usercookie)
            .expect(201)
            .end((err, res) => {
                if (err) reject(err);
                resolve(res.body.lastId);
            });
    });
};

const deleteFile = async (usercookie, DocId, FileId) => {
    return new Promise((resolve, reject) => {
        request(app)
            .delete(`${basePath}/${DocId}/files/${FileId}`)
            .set("Cookie", usercookie)
            .expect(200)
            .end((err, res) => {
                if (err) reject(err);
                resolve(true);
            });
    });
};

const matchDocumentToStakeholders = async (usercookie, docId, stakeholders) => {

    return new Promise((resolve, reject) => {
        request(app)
            .post(`${stakeholderPath}/${docId}`)
            .send({ stakeholders: stakeholders })
            .set("Cookie", usercookie)
            .expect(201)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.body)
            })
    })
}

// Mock Data
const urbanPlannerUser = { username: "Romeo", password: process.env.URBAN_PLANNER_PASSWORD };
const residentUser = { username: "Juliet", password: process.env.RESIDENT_PASSWORD };

const mockDocumentbody = {
    title: 'Test Document',
    scale: 'plan',
    date: '2023-01-01',
    typeId: null,
    language: 'English',
    pages: 3,
    description: 'A test document',
    stakeholders: [],
    planNumber: 10,
    areaId: null
};

let urbanplanner_cookie;
let resident_cookie;
let mockDocId;

// Test Suites
describe("Integration Test POST /api/documents/:DocId/files - Attach a new file", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);
        // resident_cookie = await login(residentUser);
        console.log("Creating type...");
        const mockTypeId = await createtype(urbanplanner_cookie, "testType");
        console.log("Type created with ID:", mockTypeId);

        console.log("Creating stakeholders...");
        const stakeholders = ["Stakeholder1", "Stakeholder2"];
        const stakeholderIds = await createStakeholders(urbanplanner_cookie, stakeholders);
        console.log("Stakeholders created with IDs:", stakeholderIds);

        console.log("Creating document...");
        mockDocumentbody.typeId = mockTypeId;
        console.log("Document body:", mockDocumentbody);
        //   mockDocumentbody.stakeholders = stakeholders;

        try {
            mockDocId = await createDocument(urbanplanner_cookie, mockDocumentbody);
            console.log("Document created with ID:", mockDocId);
        } catch (err) {
            console.error("Error adding document:", err);
        }

    });

    test("Should upload a file successfully", async () => {
        const response = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie", urbanplanner_cookie)
            .attach("file", filePath)
            .field("fileType", "original");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("File uploaded successfully");

        // Cleanup
        const fileId = response.body.fileId;
        await deleteFile(urbanplanner_cookie, mockDocId, fileId);
    });

    test("Should return error if no file is attached", async () => {
        const response = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie", urbanplanner_cookie)
            .field("fileType", "original");

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("File upload failed. No file provided.");
    });

    test("Should return error if file type is invalid", async () => {
        const response = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie", urbanplanner_cookie)
            .attach("file", filePath)
            .field("fileType", "invalid");

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid file type. Allowed types: attachment, original");
    });


});

describe("Integration Test GET /api/documents/:DocId/files - Get all files", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        const mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbody.typeId = mockTypeId;

        const stakeholders = ["Stakeholder1", "Stakeholder2"];
        const stakeholderIds = await createStakeholders(urbanplanner_cookie, stakeholders);


        mockDocId = await createDocument(urbanplanner_cookie, mockDocumentbody);
    });

    test("Should get all files successfully", async () => {
        const res = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie", urbanplanner_cookie)
            .attach('file', filePath)
            .field('fileType', 'original');

        const response = await request(app)
            .get(`${basePath}/${mockDocId}/files`)
            .set("Cookie", urbanplanner_cookie);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);

        // Cleanup
        const fileId = res.body.fileId;
        await deleteFile(urbanplanner_cookie, mockDocId, fileId);
    });
});

describe("Integration Test DELETE /api/documents/:DocId/files/:FileId - Delete a file", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        const mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbody.typeId = mockTypeId;

        const stakeholders = ["Stakeholder1", "Stakeholder2"];
        const stakeholderIds = await createStakeholders(urbanplanner_cookie, stakeholders);
        //  mockDocumentbody.stakeholders = stakeholders;

        mockDocId = await createDocument(urbanplanner_cookie, mockDocumentbody);
    });

    test("Should delete a file successfully", async () => {
        const res = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie", urbanplanner_cookie)
            .attach('file', filePath)
            .field('fileType', 'original');

        const fileId = res.body.fileId;

        const response = await request(app)
            .delete(`${basePath}/${mockDocId}/files/${fileId}`)
            .set("Cookie", urbanplanner_cookie);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('File deleted successfully');
    });

    test("Should return error if the file does not exist", async () => {
        const fileId = -1;

        const response = await request(app)
            .delete(`${basePath}/${mockDocId}/files/${fileId}`)
            .set("Cookie", urbanplanner_cookie);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('File not found');
    });
});

describe("Integration Test GET /api/documents/:DocId/files/downloads/:FileId - Get all files", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        const mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbody.typeId = mockTypeId;

        const stakeholders = ["Stakeholder1", "Stakeholder2"];
        const stakeholderIds = await createStakeholders(urbanplanner_cookie, stakeholders);


        mockDocId = await createDocument(urbanplanner_cookie, mockDocumentbody);
    });

    test("download file successfully", async () => {
        const res = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie", urbanplanner_cookie)
            .attach('file', filePath)
            .field('fileType', 'original');
        console.log(res.body);

        const response = await request(app)
            .get(`${basePath}/${mockDocId}/files/download/${res.body.fileId}`)
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

        // Check that the response is a file
        expect(response.headers['content-disposition']).toBe(`attachment; filename="${res.body.fileName}"`);


        // Cleanup
        const fileId = res.body.fileId;
        await deleteFile(urbanplanner_cookie, mockDocId, fileId);
    });

    test("should return 400 if parameters (file id or doc id) aren't vlaid ids", async () => {
        const response = await request(app)
            .get(`${basePath}/a/files/download/b`)
            .set("Cookie", urbanplanner_cookie)
            .expect(400);
    });

    test("should return 404 if file doesn't exist", async () => {
        const response = await request(app)
            .get(`${basePath}/${mockDocId}/files/download/-1`)
            .set("Cookie", urbanplanner_cookie)
            .expect(404);
        
    });

    // test("should return 500 if download fails", async () => {
    //     const response = await request(app)
    //         .post(`${basePath}/${mockDocId}/files`)
    //         .set("Cookie", urbanplanner_cookie)
    //         .attach('file', filePath)
    //         .field('fileType', 'original');
    //     const fileId = response.body.fileId;

    //     const response2 = await request(app)

    //     )

});

