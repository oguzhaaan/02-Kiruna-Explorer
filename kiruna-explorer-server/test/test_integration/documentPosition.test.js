import { describe, test, expect, beforeEach, vitest } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import Document from "../../models/Document.mjs";
import { Role } from "../../models/User.mjs";
import { DocumentNotFound } from "../../models/Document.mjs";
import DocumentDAO from "../../dao/DocumentDAO.mjs";
import DocumentPositionDAO from "../../dao/DocumentPositionDAO.mjs";

const basePath = "/api/documents"
const typePath = "/api/document-types"
const stakeholderPath = "/api/document-stakeholders"


const DocumentDao = new DocumentDAO();
const DocumentPositionDao = new DocumentPositionDAO();

const validTextPosition = {"x" : 100, "y" : 200};
const validTextPosition2 = {"x" : 101, "y" : 201};

const validPlanPosition = {"x" : 300, "y" : 400};
const validPlanPosition2 = {"x" : 301, "y" : 401};


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


//cookie for the login, in case of API that needs an authentication before
let resident_cookie
let urbanplanner_cookie

// Mock data for testing
const mockDocumentbody = {
    title: 'Test Document',
    scale: 'plan',
    date: '2023-01-01',
    typeId: null,
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
            .send(mockDocumentbody)
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

describe("integration test for GET /api/documents/diagramPositions", () => {

    beforeEach(async () => {
        try {
            await cleanup();
            urbanplanner_cookie = await login(urbanPlannerUser);

            mockTypeId = await createtype(urbanplanner_cookie, "testType");
            mockDocumentbody.typeId = mockTypeId;

            mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholdersNames);

            mockDocId = await createDocument(urbanplanner_cookie);
            const mockId2 = await  createDocumentWithParams(urbanplanner_cookie, { ...mockDocumentbody, title: mockDocumentbody.title + "2" });
           
        } catch (error) {
            console.error("Setup error:", error);
            throw error; // Fail the test if setup fails
        }
    });

    test("should get all documents' positions successfully", async () => {
        const res = await request(app)
            .post(`${basePath}/${mockDocId}/diagramPosition`)
            .set("Cookie", urbanplanner_cookie)
            .send(validPlanPosition)
            .expect(201);
        
        const res2 = await request(app)
            .post(`${basePath}/${mockDocId}/diagramPosition`)
            .set("Cookie", urbanplanner_cookie)
            .send(validTextPosition)
            .expect(201);
        
        const response = await request(app)
            .get(`${basePath}/diagramPositions`)
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

        expect(response.body).toHaveLength(2);

        expect(response.body[0].x).toEqual(10);
        expect(response.body[0].y).toEqual(20);

        expect(response.body[1].x).toEqual(20);
        expect(response.body[1].y).toEqual(20);
    });

});



