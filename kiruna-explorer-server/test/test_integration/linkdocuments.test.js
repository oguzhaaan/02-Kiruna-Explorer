import { describe, test, expect, beforeEach, vitest } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import Document from "../../models/Document.mjs";
import Link from "../../models/Link.mjs";
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
const mockDocumentbody1 = {
    title: 'Test Document1',
    scale: 'plan',
    date: '2023-01-01',
    type: 'design',
    language: 'English',
    pages: 3,
    description: 'A test document',
    stakeholders: ['lkab','municipality'],
    planNumber: 10,
};

const mockDocumentbody2 = {
    title: 'Test Document2',
    scale: 'plan',
    date: '2023-01-01',
    type: 'design',
    language: 'English',
    pages: 3,
    description: 'A test document',
    stakeholders: ['lkab','municipality'],
    planNumber: 10,
};

const mockDocumentbody3 = {
    title: 'Test Document3',
    scale: 'plan',
    date: '2023-01-01',
    type: 'design',
    language: 'English',
    pages: 3,
    description: 'A test document',
    stakeholders: ['lkab','municipality'],
    planNumber: 10,
};

const mockDocumentbody4 = {
    title: 'Test Document3',
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
const createDocument = async (usercookie,doc) =>{
    return new Promise((resolve,reject)=>{
        request(app)
        .post(`${basePath}`)
        .send(doc)
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

// mock data for testing a link
const mockLinkbody = {
    doc1Id : 1,
    doc2Id : 2,
    connection : 'update',
    date : '2023-01-01',
};

//helper function to create a link
const createLink = async (usercookie, d1, d2) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${basePath}/link`)
            .send({
                doc1Id: d1,
                doc2Id: d2,
                connection: 'update',
                date: '2023-01-01',
            }
            )
            .set("Cookie", usercookie)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.body)
            })
    })
}
describe("Integration Test POST /link", () => {
    beforeEach(async () => {
        // Reset data
        await cleanup();
        //we create the cookie of resident login before each test so that we can authenticate with it
        resident_cookie = await login(residentUser)
        //we create the cookie of urbanplanner login before each test so that we can authenticate with it
        urbanplanner_cookie = await login(urbanplannerUser)
    });

    test("should return 400 if link is empty", async () => {
        const result = await request(app)
            .post(`${basePath}/link`)
            .send({})
            .set("Cookie", resident_cookie)
            .expect(400);

    });

    test("should return 402 if link has invalid connection type", async () => {
        const invalidConnection = {...mockLinkbody, connection: 'invalid'}
       
        console.log(invalidConnection)
        const result = await request(app)
            .post(`${basePath}/link`)
            .send(invalidConnection)
            .set("Cookie", resident_cookie)
            .expect(402);
    });

    test("should return 404 if document does not exist", async () => {
        const invalidDocId = {...mockLinkbody, doc1Id: 29}

        const result = await request(app)
            .post(`${basePath}/link`)
            .send(invalidDocId)
            .set("Cookie", resident_cookie)
            .expect(404);
    });

    test("should return 404 if document does not exist", async () => {
        const invalidDocId = {...mockLinkbody, doc2Id: 29}

        const result = await request(app)
            .post(`${basePath}/link`)
            .send(invalidDocId)
            .set("Cookie", resident_cookie)
            .expect(404);
    });
    
    test("should return 200 if link is valid", async () => {
        const d1 =  await createDocument(urbanplanner_cookie, mockDocumentbody1)
        const d2 = await createDocument(urbanplanner_cookie,mockDocumentbody2)
        
        const result = await request(app)
            .post(`${basePath}/link`)
            .send({
                doc1Id: d1,
                doc2Id: d2,
                connection: "direct_consequence",
                date: "2023-01-01",
            })
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

            expect(result.body).toEqual({ message: "Link added successfully" });
    });


})


describe("Integration Test POST /links", () => {
    beforeEach(async () => {
        // Resetta i dati
        await cleanup();
        // Login per ottenere il cookie di autenticazione
        urbanplanner_cookie = await login(urbanplannerUser);
    });

    test("should return 200 if links array is valid", async () => {
        const d1 =  await createDocument(urbanplanner_cookie, mockDocumentbody1)
        const d2 = await createDocument(urbanplanner_cookie,mockDocumentbody2)
        const d3 = await createDocument(urbanplanner_cookie,mockDocumentbody3)
        const d4 = await createDocument(urbanplanner_cookie,mockDocumentbody3)
        
        const validLinks = [
            {
                originalDocId: d1,
                selectedDocId: d2,
                connectionType: "prevision",
                date: "2023-01-01",
            },
            {
                originalDocId: d3,
                selectedDocId: d4,
                connectionType: "direct_consequence",
                date: "2023-01-02",
            }
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
            {
                originalDocId: 1,
                selectedDocId: 2,
                connectionType: "invalid_type",
                date: "2023-01-01",
            },
            {
                originalDocId: 3,
                selectedDocId: 4,
                connectionType: "direct_consequence",
                date: "2023-01-02",
            }
        ];

        const result = await request(app)
            .post(`${basePath}/links`)
            .send({ links: invalidLinks })
            .set("Cookie", urbanplanner_cookie)
            .expect(402);

        expect(result.body.error).toBe("Invalid connection type for the following links");
        expect(result.body.invalidLinks).toEqual([
            {
                originalDocId: 1,
                selectedDocId: 2,
                connectionType: "invalid_type",
                date: "2023-01-01",
            }
        ]);
    });
});


describe("GET /:DocId/links", () => {
    test("should return 200 with linked documents if DocId is valid", async () => {
        // Prima crea documenti e link per il test
        const d1 =  await createDocument(urbanplanner_cookie, mockDocumentbody1)
        const d2 = await createDocument(urbanplanner_cookie,mockDocumentbody2)
        const d3 = await createDocument(urbanplanner_cookie,mockDocumentbody3)

        await createLink(urbanplanner_cookie,d1,d2)
        await createLink(urbanplanner_cookie,d1,d3)
        
        const linkedDocs = [
            { id: d2, title: "Test Document2", type: "design", connection: "update" },
            { id: d3, title: "Test Document3", type: "design", connection: "update" },
        ];

        const result = await request(app)
            .get(`${basePath}/${d1}/links`)
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

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

describe("DELETE /:DocId/links", () => {
    test("should return 200 and delete all links if DocId is valid", async () => {
        const d1 =  await createDocument(urbanplanner_cookie, mockDocumentbody1)
        const d2 = await createDocument(urbanplanner_cookie,mockDocumentbody2)
        await createLink(urbanplanner_cookie,d1,d2)

        const result = await request(app)
            .delete(`${basePath}/${d1}/links`)
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
