import { describe, test, expect, beforeEach, vitest } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import Document from "../../models/Document.mjs";
import { Role } from "../../models/User.mjs";
import { DocumentNotFound } from "../../models/Document.mjs";

const basePath = "/api/documents"
const typePath = "/api/document-types"
const stakeholderPath = "/api/document-stakeholders"

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
const urbanPlannerUser = { id: 1, username: "Romeo", password: "1111", role: Role.URBAN_PLANNER }
const residentUser = { id: 2, username: "Juliet", password: "2222", role: Role.RESIDENT }
const no_profile = { id: 3, username: "user1", password: "pass1", role: null }

//cookie for the login, in case of API that needs an authentication before
let resident_cookie
let urbanplanner_cookie

// Mock data for testing
const mockDocumentbodyToAdd = {
    title: 'Test Document',
    scale: 'plan',
    date: '2023-01-01',
    typeId: null,
    language: 'English',
    pages: 3,
    description: 'A test document',
    planNumber: 10,
};

const mockDocumentbodyToGet = {
    title: 'Test Document',
    scale: 'plan',
    date: '2023-01-01',
    type: 'testType',
    language: 'English',
    pages: 3,
    description: 'A test document',
    planNumber: 10,
};



let mockDocId
let mockTypeId
let mockStakeholdersIds
const mockStakeholdersNames = ["Stakeholder1", "Stakeholder2"]

// Helper function to create a document
const createDocument = async (usercookie) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${basePath}`)
            .send(mockDocumentbodyToAdd)
            .set("Cookie", usercookie)
            .expect(201)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.body.lastId)
            })
    })
}

// Helper function to create a document different form default mock 
const createDocumentWithParams = async (usercookie, document) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${basePath}`)
            .send(document)
            .set("Cookie", usercookie)
            .expect(201)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.body.lastId)
            })
    })
}

// Helper function to create a type
const createtype = async (usercookie, typeName) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${typePath}`)
            .send({ name: typeName })
            .set("Cookie", usercookie)
            .expect(201)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.body.typeId)
            })
    })
}
const createStakeholders = async (usercookie, stakeholders) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${stakeholderPath}`)
            .send({ stakeholders: stakeholders })
            .set("Cookie", usercookie)
            .expect(201)
            .end((err, res) => {
                if (err) {
                    reject(res.message)
                }
                resolve(res.body.ids)
            })
    })
}

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

describe("Integration Test GET /:DocId - Get Document by ID", () => {
    beforeEach(async () => {
        try {
            await cleanup();
            urbanplanner_cookie = await login(urbanPlannerUser);

            mockTypeId = await createtype(urbanplanner_cookie, "testType");
            mockDocumentbodyToAdd.typeId = mockTypeId;

            mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

            mockDocId = await createDocument(urbanplanner_cookie);

            await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId, mockStakeholdersNames);
            expect(mockDocId).toBeDefined(); // Assert document creation
        } catch (error) {
            console.error("Setup error:", error);
            throw error; // Fail the test if setup fails
        }
    });

    test("should return a document for a valid document ID", async () => {
        // Mock the getDocumentById method
        const result = await request(app)
            .get(`${basePath}/${mockDocId}`)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(200);


        const stakeholders = mockStakeholdersIds.map((id, index) => ({
            id,
            name: mockStakeholdersNames[index]
        }));

        const exp_result = {
            id: mockDocId,
            areaId: null,
            stakeholders: stakeholders,
            ...mockDocumentbodyToGet
        };
        expect(result.body).toEqual(exp_result);
    });

    test("should return 404 if the document does not exist", async () => {
        const nonExistentDocId = 9999; // Assuming this ID does not exist

        const result = await request(app)
            .get(`${basePath}/${nonExistentDocId}`)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(404)
            .catch(err => err)

        //console.log(result.text.error)

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

        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbodyToAdd.typeId = mockTypeId;

        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

        mockDocId = await createDocument(urbanplanner_cookie);

        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId, mockStakeholdersNames);


        const result = await request(app)
            .get(`${basePath}`)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(200);

        const stakeholders = mockStakeholdersIds.map((id, index) => ({
            id,
            name: mockStakeholdersNames[index]
        }));

        const exp_result = {
            id: mockDocId,
            areaId: null,
            stakeholders: stakeholders,
            ...mockDocumentbodyToGet
        };
        expect(result.body).toEqual([exp_result]);
    });

    test("should return empty array if there are no documents", async () => {

        const result = await request(app)
            .get(`${basePath}/`)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(200)

        expect(result.body).toEqual([]);
    });

});

describe("Integration Test POST / - Add Document", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbodyToAdd.typeId = mockTypeId;

        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

        mockDocId = await createDocument(urbanplanner_cookie);

        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId, mockStakeholdersNames);
    });



    test("should add a document successfully", async () => {
        const result = await request(app)
            .post(`${basePath}`)
            .send(mockDocumentbodyToAdd)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(result.body).toHaveProperty('lastId');
        expect(result.body.message).toBe("Document added successfully");
    });

    test("should return 400 if required fields are missing", async () => {
        const incompleteDocumentBody = { ...mockDocumentbodyToAdd };
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
        const documentWithNullAreaId = { ...mockDocumentbodyToAdd };

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

describe("Integration Test GET /filter - Get Documents by Filter", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);
        // Create a document to ensure there is data to filter
        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbodyToAdd.typeId = mockTypeId;

        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

        mockDocId = await createDocument(urbanplanner_cookie);

        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId, mockStakeholdersNames);

    });

    test("should return all documents when no filter parameters are provided", async () => {
        const result = await request(app)
            .get(`${basePath}/filter`)
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(200);

        const stakeholders = mockStakeholdersIds.map((id, index) => ({
            id,
            name: mockStakeholdersNames[index]
        }));

        const exp_result = {
            id: mockDocId,
            areaId: null,
            stakeholders: stakeholders,
            ...mockDocumentbodyToGet
        };

        expect(result.body).toEqual([
            exp_result
            // Add more expected documents if needed
        ]);
    });
});

describe("Integration Test GET /filter - Get Documents by Title", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbodyToAdd.typeId = mockTypeId;

        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

        mockDocId = await createDocument(urbanplanner_cookie);
        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId, mockStakeholdersNames);

        // Create documents with different titles
        await request(app)
            .post(`${basePath}`)
            .send({ ...mockDocumentbodyToAdd, title: 'Another Document', typeId: mockTypeId })
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

        const stakeholders = mockStakeholdersIds.map((id, index) => ({
            id,
            name: mockStakeholdersNames[index]
        }));

        expect(result.body).toEqual([
            { id: expect.any(Number), areaId: null, stakeholders: stakeholders, ...mockDocumentbodyToGet }
        ]);
    });
});



describe("Integration Test GET /filter - Get Documents by Stakeholders", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbodyToAdd.typeId = mockTypeId;

        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

        mockDocId = await createDocument(urbanplanner_cookie);
        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId, mockStakeholdersNames);

        // Create documents with different stakeholders
        const mockDocId2 = await createDocumentWithParams(urbanplanner_cookie, { title: " Test Document 2", typeId: mockTypeId, ...mockDocumentbodyToAdd })
        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId2, [mockStakeholdersNames[1]]);


    });

    test("should return documents that match the stakeholders filter", async () => {
        const stakeholdersFilter = mockStakeholdersNames[0];
        const result = await request(app)
            .get(`${basePath}/filter`)
            .query({ stakeholders: stakeholdersFilter })
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(200);

        const stakeholders = mockStakeholdersIds.map((id, index) => ({
            id,
            name: mockStakeholdersNames[index]
        }));

        expect(result.body).toEqual([
            { id: expect.any(Number), areaId: null, stakeholders: stakeholders, ...mockDocumentbodyToGet }
        ]);
    });
});

describe("Integration Test GET /filter - Get Documents by Start Date", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbodyToAdd.typeId = mockTypeId;

        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

        mockDocId = await createDocument(urbanplanner_cookie);
        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId, mockStakeholdersNames);

        const mockDoc2 = {
            ...mockDocumentbodyToAdd,
            title: "Test Document 2",
            typeId: mockTypeId,
            date: '2022-01-02',
        }
        // Create documents with different dates
        const mockDocId2 = await createDocumentWithParams(urbanplanner_cookie, mockDoc2)
        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId2, mockStakeholdersNames);

    });

    test("should return documents that match the startDate filter", async () => {
        const startDateFilter = '2023-01-01';
        const result = await request(app)
            .get(`${basePath}/filter`)
            .query({ startDate: startDateFilter })
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(200);

        const stakeholders = mockStakeholdersIds.map((id, index) => ({
            id,
            name: mockStakeholdersNames[index]
        }));

        console.log(result.body)
        expect(result.body).toEqual([
            { id: mockDocId, areaId: null, stakeholders: stakeholders, ...mockDocumentbodyToGet }
        ]);
    });
});

describe("Integration Test GET /filter - Get Documents by End Date", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbodyToAdd.typeId = mockTypeId;

        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

        mockDocId = await createDocument(urbanplanner_cookie);
        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId, mockStakeholdersNames);

        const mockDoc2 = {
            ...mockDocumentbodyToAdd,
            title: "Test Document 2",
            typeId: mockTypeId,
            date: '2023-02-01',
        }
        // Create documents with different dates
        const mockDocId2 = await createDocumentWithParams(urbanplanner_cookie, mockDoc2)
        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId2, mockStakeholdersNames);
    });

    test("should return documents that match the endDate filter", async () => {
        const endDateFilter = '2023-01-01';
        const result = await request(app)
            .get(`${basePath}/filter`)
            .query({ endDate: endDateFilter })
            .set("Cookie", urbanplanner_cookie)
            .expect('Content-Type', /json/)
            .expect(200);

        const stakeholders = mockStakeholdersIds.map((id, index) => ({
            id,
            name: mockStakeholdersNames[index]
        }));

        console.log(result.body)
        expect(result.body).toEqual([
            { id: mockDocId, areaId: null, stakeholders: stakeholders, ...mockDocumentbodyToGet }
        ]);
    });
});

describe("Integration Test PUT /api/documents/:DocId/area", () => {
    const areaPath = "/api/areas";
    const geoJson = {
        geoJson: '{"type":"Feature","geometry":{"type":"Point","coordinates":[125.6, 10.1]}}'
    };
    const geoJson2 = {
        geoJson: '{"type":"Feature","geometry":{"type":"Point","coordinates":[34.7, 6.43]}}'
    };

    beforeEach(async () => {
        // Reset data
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbodyToAdd.typeId = mockTypeId;

        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

        mockDocId = await createDocument(urbanplanner_cookie);
        await matchDocumentToStakeholders(urbanplanner_cookie, mockDocId, mockStakeholdersNames);
        
    });

    test("Should move a document to a new area successfully", async () => {
        const resArea1 = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie)
            .send(geoJson)
            .expect(201);
        const firstAreaId = resArea1.body;

        const documentId = await createDocumentWithParams(urbanplanner_cookie, { ...mockDocumentbodyToAdd, typeId: mockTypeId, areaId: firstAreaId });
       
        const resArea2 = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie)
            .send(geoJson2)
            .expect(201);
        const secondAreaId = resArea2.body;

        await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie)
            .send({ newAreaId: secondAreaId })
            .expect(200);
    });

    test("Should return 404 if the document does not exist", async () => {
        const nonExistentDocId = -9999;

        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie)
            .send(geoJson)
            .expect(201);
        const firstAreaId = resArea.body;

        const res = await request(app)
            .put(`${basePath}/${nonExistentDocId}/area`)
            .set("Cookie", urbanplanner_cookie)
            .send({ newAreaId: firstAreaId })
            .expect(404);
        expect(res.body.error).toEqual("Document not found");
    });

    test("Should return 404 if the area does not exist", async () => {
        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie)
            .send(geoJson)
            .expect(201);
        const firstAreaId = resArea.body;
        
        const documentId = await createDocumentWithParams(urbanplanner_cookie, { ...mockDocumentbodyToAdd, typeId: mockTypeId, areaId: firstAreaId });
        
        const res = await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie)
            .send({ newAreaId: 99999 })
            .expect(404);
        expect(res.body.error).toEqual("Area not found");
    });

    test("Should return 400 if areaId is invalid", async () => {
        const invalidIds = ["abc", null, 0, -1, 1.5]; // Invalid area IDs to test

        const resArea = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie)
            .send(geoJson)
            .expect(201);
        const firstAreaId = resArea.body;

     
        const documentId = await createDocumentWithParams(urbanplanner_cookie, { ...mockDocumentbodyToAdd, typeId: mockTypeId, areaId: firstAreaId });

        for (const invalidId of invalidIds) {
            const res = await request(app)
                .put(`${basePath}/${documentId}/area`)
                .set("Cookie", urbanplanner_cookie)
                .send({ newAreaId: invalidId })
                .expect(400);
            expect(res.body.error).toEqual("Invalid area ID");
        }
    });

    test("The previous areaId should not exist after moving the document", async () => {
        const resArea1 = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie)
            .send(geoJson)
            .expect(201);
        const firstAreaId = resArea1.body;

       
        const documentId = await createDocumentWithParams(urbanplanner_cookie, { ...mockDocumentbodyToAdd, typeId: mockTypeId, areaId: firstAreaId });

        const resArea2 = await request(app)
            .post(areaPath)
            .set("Cookie", urbanplanner_cookie)
            .send(geoJson2)
            .expect(201);
        const secondAreaId = resArea2.body;

        await request(app)
            .put(`${basePath}/${documentId}/area`)
            .set("Cookie", urbanplanner_cookie)
            .send({ newAreaId: secondAreaId })
            .expect(200);

        const res = await request(app)
            .get(`${basePath}/area/${firstAreaId}`)
            .set("Cookie", urbanplanner_cookie)
            .expect(404);
        expect(res.body.error).toEqual("No documents found for this area");
    });
});
