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
const urbanPlannerUser = { id:1, username: "Romeo", password: "1111", role: Role.URBAN_PLANNER}
const residentUser = { id:2, username: "Juliet", password: "2222", role: Role.RESIDENT}
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
        urbanplanner_cookie = await login(urbanPlannerUser);
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
        urbanplanner_cookie = await login(urbanPlannerUser);
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
        urbanplanner_cookie = await login(urbanPlannerUser);
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
});

/* PUT /api/documents/:DocId/area */
describe.only("Integration Test PUT /api/documents/:DocId/area", () => {
    const areaPath = "/api/areas";

    const geoJson = {
        geoJson:  '{"type":"Feature","geometry":{"type":"Point","coordinates":[125.6, 10.1]}}'
    };

    const geoJson2 = {
        geoJson:  '{"type":"Feature","geometry":{"type":"Point","coordinates":[34.7, 6.43]}}'
    };

    beforeEach(async () => {
        // Reset data
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);
    });

    test("Should move a document to a new area successfully", async () => {
        //create new area
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body
        //create document in that area
        const resDocument = await request(app)
            .post(`${basePath}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ ...mockDocumentbody, areaId: firstAreaId })
            .expect(201);
        const documentId = resDocument.body.lastId;
        //create new area
        const resArea2 = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson2 )
            .expect(201);
        const secondAreaId = resArea2.body
        //move document to new area
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ newAreaId: secondAreaId })
            .expect(200);
    });

    test("Should return 404 if the document does not exist", async () => {
        const nonExistentDocId = -9999; // Assuming this ID does not exist
        //create new area
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body

        const res = await request(app)
            .put(`${basePath}/${nonExistentDocId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ newAreaId: firstAreaId })
            .expect(404);
        expect(res.body.error).toEqual("Document not found");
    });

    test("Should return 404 if the area does not exist", async () => {
        //create new area
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body
        //create document in that area
        const resDocument = await request(app)
            .post(`${basePath}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ ...mockDocumentbody, areaId: firstAreaId })
            .expect(201);
        const documentId = resDocument.body.lastId;
        //move document to new area
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ newAreaId: 99999 })
            .expect(404);
        expect(res.body.error).toEqual("Area not found");
    });

    test("Should return 400 if areaId is not a valid integer", async () => {
        const invalidAreaId = "abc"; // Non-integer ID
        //create new area
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body
        //create document in that area
        const resDocument = await request(app)
            .post(`${basePath}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ ...mockDocumentbody, areaId: firstAreaId })
            .expect(201);
        const documentId = resDocument.body.lastId;
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ newAreaId: invalidAreaId })
            .expect(400);
        expect(res.body.error).toEqual("Invalid area ID");
    });

    test("Should return 400 if areaId is not provided", async () => {
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body
        //create document in that area
        const resDocument = await request(app)
            .post(`${basePath}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ ...mockDocumentbody, areaId: firstAreaId })
            .expect(201);
        const documentId = resDocument.body.lastId;
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .expect(400);
    });

    test("Should return 400 if areaId is null", async () => {
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body
        //create document in that area
        const resDocument = await request(app)
            .post(`${basePath}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ ...mockDocumentbody, areaId: firstAreaId })
            .expect(201);
        const documentId = resDocument.body.lastId;
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ newAreaId: null })
            .expect(400);
        expect(res.body.error).toEqual("Invalid area ID");
    });

    test("Should return 400 if areaId is 0", async () => {
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body
        //create document in that area
        const resDocument = await request(app)
            .post(`${basePath}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ ...mockDocumentbody, areaId: firstAreaId })
            .expect(201);
        const documentId = resDocument.body.lastId;
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ newAreaId: 0 })
            .expect(400);
        expect(res.body.error).toEqual("Invalid area ID");
    });

    test("Should return 400 if areaId is negative", async () => {
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body
        //create document in that area
        const resDocument = await request(app)
            .post(`${basePath}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ ...mockDocumentbody, areaId: firstAreaId })
            .expect(201);
        const documentId = resDocument.body.lastId;
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ newAreaId: -1 })
            .expect(400);
        expect(res.body.error).toEqual("Invalid area ID");
    });

    test("Should return 400 if areaId is a float", async () => {
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body
        //create document in that area
        const resDocument = await request(app)
            .post(`${basePath}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ ...mockDocumentbody, areaId: firstAreaId })
            .expect(201);
        const documentId = resDocument.body.lastId;
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ newAreaId: 1.5 })
            .expect(400);
        expect(res.body.error).toEqual("Invalid area ID");
    });

    test("The previous areaId should not exist after moving the document", async () => {
        //create new area
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson )
            .expect(201);
        const firstAreaId = resArea.body
        //create document in that area
        const resDocument = await request(app)
            .post(`${basePath}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ ...mockDocumentbody, areaId: firstAreaId })
            .expect(201);
        const documentId = resDocument.body.lastId;
        //create new area
        const resArea2 = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send( geoJson2 )
            .expect(201);
        const secondAreaId = resArea2.body
        //move document to new area
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .send({ newAreaId: secondAreaId })
            .expect(200);
        // try to get the document from the first area
        const res2 = await request(app)
            .get(`${basePath}/area/${firstAreaId}`)
            .set("Cookie", urbanplanner_cookie) // Authorized role
            .expect(404);
        expect(res2.body.error).toEqual("No documents found for this area");
    });
});