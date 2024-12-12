import { describe, test, expect, beforeEach, vitest } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import { Role } from "../../models/User.mjs";
import StakeholderDAO from "../../dao/StakeholderDAO.mjs";

const basePath = "/api/document-stakeholders";
const docPath = "/api/documents"
const typePath = "/api/document-types";

require('dotenv').config();

const StakeholderDao = new StakeholderDAO();

const mockDocumentbodyToAdd = {
    title: 'Test Document',
    scale: 'plan',
    date: '2023-01-01',
    typeId: 1,
    language: 'English',
    pages: 3,
    description: 'A test document',
    planNumber: 10,
};

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
            .post(`${basePath}`)
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

const createDocument = async (usercookie) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`${docPath}`)
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

// Helper function per login
const login = async (userInfo) => {
    return new Promise((resolve, reject) => {
        request(app)
            .post(`/api/sessions`)
            .send({
                username: userInfo.username,
                password: userInfo.password,
            })
            .expect(201)
            .end((err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res.header["set-cookie"][0]);
            });
    });
};

// Utenti di test
const urbanPlannerUser = { id: 1, username: "Romeo", password: process.env.URBAN_PLANNER_PASSWORD, role: Role.URBAN_PLANNER };

// Mock per stakeholder
const mockStakeholders = ["Stakeholder1", "Stakeholder2"];
const duplicateStakeholder = ["Stakeholder1", "Stakeholder3"];

// Variabile globale per il cookie
let urbanplanner_cookie;
let mockDocId

describe("Integration Test POST / - Add Stakeholders", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);
    });

    test("should add new stakeholders successfully", async () => {
        const response = await request(app)
            .post(basePath)
            .send({ stakeholders: mockStakeholders })
            .set("Cookie", urbanplanner_cookie)
            .expect(201);

        expect(response.body.ids).toHaveLength(mockStakeholders.length);
    });

    // test("should return error for duplicate stakeholders", async () => {
    //     Aggiungi Stakeholder1
    //     await request(app)
    //         .post(basePath)
    //         .send({ stakeholders: [duplicateStakeholder[0]] })
    //         .set("Cookie", urbanplanner_cookie)
    //         .expect(201);

    //     Prova ad aggiungere Stakeholder1 di nuovo
    //     const response = await request(app)
    //         .post(basePath)
    //         .send({ stakeholders: duplicateStakeholder })
    //         .set("Cookie", urbanplanner_cookie)
    //         .expect(400);

    //     expect(response.body.errors).toEqual([
    //         { name: "Stakeholder1", error: "Stakeholder already exists" },
    //     ]);
    // });

    test("should return 400 if input is invalid", async () => {
        const response = await request(app)
            .post(basePath)
            .send({ stakeholders: "invalid" }) // Non è un array
            .set("Cookie", urbanplanner_cookie)
            .expect(400);

        expect(response.body.errors).toBeDefined();
    });
});

describe("Integration Test GET / - Fetch All Stakeholders", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);
        await request(app)
            .post(basePath)
            .send({ stakeholders: mockStakeholders })
            .set("Cookie", urbanplanner_cookie)
            .expect(201);
    });

    test("should return all stakeholders", async () => {
        const response = await request(app)
            .get(basePath)
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

        expect(response.body).toHaveLength(mockStakeholders.length);
        expect(response.body.map((s) => s.name)).toEqual(
            expect.arrayContaining(mockStakeholders)
        );
    });
});

let mockStakeholdersIds
let mockTypeId

describe("Integration Test POST /:docId - Match Stakeholders to Document", () => {
    let mockDocId;

    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);

        mockTypeId = await createtype(urbanplanner_cookie, "testType");
        mockDocumentbodyToAdd.typeId = mockTypeId;

        mockStakeholdersIds = await createStakeholders(urbanplanner_cookie, mockStakeholders);

        mockDocId = await createDocument(urbanplanner_cookie);

    });

    test("should associate stakeholders with a document successfully", async () => {

        const response = await request(app)
            .post(`${basePath}/${mockDocId}`)
            .send({ stakeholders: mockStakeholders })
            .set("Cookie", urbanplanner_cookie)
            .expect(201);

        expect(response.body.message).toBe("Stakeholders matched to document successfully");
    });

    test("should return 404 for non-existing stakeholders", async () => {
        const response = await request(app)
            .post(`${basePath}/${mockDocId}`)
            .send({ stakeholders: ["NonExistingStakeholder"] })
            .set("Cookie", urbanplanner_cookie)
            .expect(404);

        expect(response.body.error).toBe("Stakeholder not found");
    });

    test("should return 400 for invalid document ID", async () => {
        const response = await request(app)
            .post(`${basePath}/invalid-id`)
            .send({ stakeholders: mockStakeholders })
            .set("Cookie", urbanplanner_cookie)
            .expect(400);

        expect(response.body.errors).toBeDefined();
    });
});
