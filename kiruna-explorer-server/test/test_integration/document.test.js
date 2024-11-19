import { describe, test, expect, beforeEach, vitest } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import Document from "../../models/Document.mjs";
import { Role } from "../../models/User.mjs";
import { DocumentNotFound } from "../../models/Document.mjs";

const basePath = "/api/documents"
// Helper function that logs in a user and returns the cookie
// Can be used to log in a user before the tests or in the tests
const login = async (userInfo) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`/api/sessions`)
            .send({
                username: userInfo.username,
                password: userInfo.password
            })
            .expect(201)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}
// Example Parameters for the tests
const residentUser = { id:1, username: "Romeo", password: "1111", role: Role.URBAN_PLANNER}
const urbanplannerUser = { id:2, username: "Juliet", password: "2222", role: Role.RESIDENT}
const no_profile = { id:3, username: "user1", password: "pass1", role: null}
//cookie for the login, in case of API that needs an authentication before
let resident_cookie
let urbanplanner_cookie
// Mock data for testing
const mockDocumentbody = {
    title: 'Test Document',
    scale: 'plan',
    date: '2023-01-01',
    type: 'design',
    language: 'English',
    pages: 3,
    description: 'A test document',
    stakeholders: ['lkab','municipality'],
    planNumber: 10,
};
let mockDocId
// Helper function to create a document
const createDocument = async (usercookie) =>{
    return new Promise((resolve,reject)=>{
        request(app)
        .post(`${basePath}`)
        .send(mockDocumentbody)
        .set("Cookie",usercookie)
        .expect(201)
        .end((err, res) => {
            if (err) {
                reject(err)
            }
            resolve(res.body.lastId)
        })
    })
}

describe("Integration Test GET /:DocId - Get Document by ID", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanplannerUser);
        mockDocId = await createDocument(urbanplanner_cookie);
    });

    test("should return a document for a valid document ID", async () => {
        // Mock the getDocumentById method
        const result = await request(app)
            .get(`${basePath}/${mockDocId}`)
            .set("Cookie",urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(result.body).toEqual({id:mockDocId, areaId: null, ...mockDocumentbody});
    });

    test("should return 404 if the document does not exist", async () => {
        const nonExistentDocId = 9999; // Assuming this ID does not exist
    
        const result = await request(app)
            .get(`${basePath}/${nonExistentDocId}`)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(404)
            .catch(err=>err)

        console.log(result.text.error)
    
        expect(result.body.error.customMessage).toEqual("Document Not Found");
    });

    test("should return 400 for an invalid document ID", async () => {
        const invalidDocId = "invalid-id";

        await request(app)
            .get(`${basePath}/${invalidDocId}`)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(400);
    });


});

describe("Integration Test GET / - Get All documents", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanplannerUser);
    });

    test("should return a document for a valid document ID", async () => {
        // Mock the getDocumentById method
        mockDocId = await createDocument(urbanplanner_cookie);

        const result = await request(app)
            .get(`${basePath}/`)
            .expect('Content-Type', /json/)
            .expect(200);

            expect(result.body).toEqual([{id:mockDocId, areaId: null, ...mockDocumentbody}]);
        });

    test("should return empty array if there are no documents", async () => {
    
        const result = await request(app)
            .get(`${basePath}/`)
            .expect('Content-Type', /json/)
            .expect(200)
    
        expect(result.body).toEqual([]);
    });

});

describe("Integration Test POST / - Add Document", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanplannerUser);
    });

    test("should add a document successfully", async () => {
        const result = await request(app)
            .post(`${basePath}`)
            .send(mockDocumentbody)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(result.body).toHaveProperty('lastId');
        expect(result.body.message).toBe("Document added successfully");
    }); 

    test("should return 400 if required fields are missing", async () => {
        const incompleteDocumentBody = { ...mockDocumentbody };
        delete incompleteDocumentBody.title; // Remove a required field

        const result = await request(app)
            .post(`${basePath}`)
            .send(incompleteDocumentBody)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(400);

        expect(result.body.message).toEqual(
            expect.arrayContaining([
               "Title is required"
            ])
        );
    });

    test("should add a document successfully with areaId is not provided", async () => {
        const documentWithNullAreaId = { ...mockDocumentbody };

        const result = await request(app)
            .post(`${basePath}`)
            .send(documentWithNullAreaId)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(result.body).toHaveProperty('lastId');
        expect(result.body.message).toBe("Document added successfully");
    });

    describe("Integration Test GET /filter - Get Documents by Filter", () => {
        beforeEach(async () => {
            await cleanup();
            urbanplanner_cookie = await login(urbanplannerUser);
            // Create a document to ensure there is data to filter
            mockDocId = await createDocument(urbanplanner_cookie);
        });
    
        test("should return all documents when no filter parameters are provided", async () => {
            const result = await request(app)
                .get(`${basePath}/filter`)
                .set("Cookie", urbanplanner_cookie)
                .expect('Content-Type', /json/)
                .expect(200);
    
            expect(result.body).toEqual([
                { id: mockDocId, areaId: null, ...mockDocumentbody }
                // Add more expected documents if needed
            ]);
        });
    });
    describe("Integration Test GET /filter - Get Documents by Title", () => {
        beforeEach(async () => {
            await cleanup();
            urbanplanner_cookie = await login(urbanplannerUser);
    
            // Create documents with different titles
            await createDocument(urbanplanner_cookie); // Uses mockDocumentbody with title 'Test Document'
            await request(app)
                .post(`${basePath}`)
                .send({ ...mockDocumentbody, title: 'Another Document' })
                .set("Cookie", urbanplanner_cookie)
                .expect(201);
        });
    
        test("should return documents that match the title filter", async () => {
            const titleFilter = 'Test Document';
            const result = await request(app)
                .get(`${basePath}/filter`)
                .query({ title: titleFilter })
                .set("Cookie", urbanplanner_cookie)
                .expect('Content-Type', /json/)
                .expect(200);
    
            expect(result.body).toEqual([
                { id: expect.any(Number), areaId: null, ...mockDocumentbody }
            ]);
        });
    });
    describe("Integration Test GET /filter - Get Documents by Type", () => {
        beforeEach(async () => {
            await cleanup();
            urbanplanner_cookie = await login(urbanplannerUser);
    
            // Create documents with different types
            await createDocument(urbanplanner_cookie); // Uses mockDocumentbody with type 'design'
            await request(app)
                .post(`${basePath}`)
                .send({ ...mockDocumentbody, type: 'informative' })
                .set("Cookie", urbanplanner_cookie)
                .expect(201);
        });
    
        test("should return documents that match the type filter", async () => {
            const typeFilter = 'design';
            const result = await request(app)
                .get(`${basePath}/filter`)
                .query({ type: typeFilter })
                .set("Cookie", urbanplanner_cookie)
                .expect('Content-Type', /json/)
                .expect(200);
    
            expect(result.body).toEqual([
                { id: expect.any(Number), areaId: null, ...mockDocumentbody }
            ]);
        });
    });
    describe("Integration Test GET /filter - Get Documents by Stakeholders", () => {
        beforeEach(async () => {
            await cleanup();
            urbanplanner_cookie = await login(urbanplannerUser);
    
            // Create documents with different stakeholders
            await createDocument(urbanplanner_cookie); // Uses mockDocumentbody with stakeholders ['lkab', 'municipality']
            await request(app)
                .post(`${basePath}`)
                .send({ ...mockDocumentbody, stakeholders: ['citizens'] })
                .set("Cookie", urbanplanner_cookie)
                .expect(201);
        });
    
        test("should return documents that match the stakeholders filter", async () => {
            const stakeholdersFilter = 'lkab,municipality';
            const result = await request(app)
                .get(`${basePath}/filter`)
                .query({ stakeholders: stakeholdersFilter })
                .set("Cookie", urbanplanner_cookie)
                .expect('Content-Type', /json/)
                .expect(200);
    
            expect(result.body).toEqual([
                { id: expect.any(Number), areaId: null, ...mockDocumentbody }
            ]);
        });
    });
    describe("Integration Test GET /filter - Get Documents by Start Date", () => {
        beforeEach(async () => {
            await cleanup();
            urbanplanner_cookie = await login(urbanplannerUser);
    
            // Create documents with different dates
            await createDocument(urbanplanner_cookie); // Uses mockDocumentbody with date '2023-01-01'
            await request(app)
                .post(`${basePath}`)
                .send({ ...mockDocumentbody, date: '2022-12-01' })
                .set("Cookie", urbanplanner_cookie)
                .expect(201);
        });
    
        test("should return documents that match the startDate filter", async () => {
            const startDateFilter = '2023-01-01';
            const result = await request(app)
                .get(`${basePath}/filter`)
                .query({ startDate: startDateFilter })
                .set("Cookie", urbanplanner_cookie)
                .expect('Content-Type', /json/)
                .expect(200);
    
            expect(result.body).toEqual([
                { id: expect.any(Number), areaId: null, ...mockDocumentbody }
            ]);
        });
    });
    
    describe("Integration Test GET /filter - Get Documents by End Date", () => {
        beforeEach(async () => {
            await cleanup();
            urbanplanner_cookie = await login(urbanplannerUser);
    
            // Create documents with different dates
            await createDocument(urbanplanner_cookie); // Uses mockDocumentbody with date '2023-01-01'
            await request(app)
                .post(`${basePath}`)
                .send({ ...mockDocumentbody, date: '2023-02-01' })
                .set("Cookie", urbanplanner_cookie)
                .expect(201);
        });
    
        test("should return documents that match the endDate filter", async () => {
            const endDateFilter = '2023-01-01';
            const result = await request(app)
                .get(`${basePath}/filter`)
                .query({ endDate: endDateFilter })
                .set("Cookie", urbanplanner_cookie)
                .expect('Content-Type', /json/)
                .expect(200);
    
            expect(result.body).toEqual([
                { id: expect.any(Number), areaId: null, ...mockDocumentbody }
            ]);
        });
    });
});

