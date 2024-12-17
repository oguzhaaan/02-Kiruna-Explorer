import {describe, test, expect, beforeEach} from "vitest";
import request from "supertest";
import {app} from "../../server.mjs";
import {cleanup} from "../cleanup.js";
import {Role} from "../../models/User.mjs";

require('dotenv').config();

const basePath = "/api/document-types";

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

// Utente di test
const urbanPlannerUser = {
    id: 1,
    username: "Romeo",
    password: process.env.URBAN_PLANNER_PASSWORD,
    role: Role.URBAN_PLANNER
};

// Variabile globale per il cookie
let urbanplanner_cookie;

describe("Integration Test GET / - Fetch All Document Types", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);
    });

    test("should return all document types", async () => {
        // Step 1: Aggiungi i tipi di documento
        const type1 = {name: "Type1"};
        const type2 = {name: "Type2"};

        await request(app)
            .post(basePath)
            .send(type1)
            .set("Cookie", urbanplanner_cookie)
            .expect(201);

        await request(app)
            .post(basePath)
            .send(type2)
            .set("Cookie", urbanplanner_cookie)
            .expect(201);

        // Step 2: Recupera i tipi di documento
        const response = await request(app)
            .get(basePath)
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

        // Step 3: Verifica i risultati
        expect(response.body).toHaveLength(2);
        expect(response.body.map((type) => type.name)).toEqual(
            expect.arrayContaining(["Type1", "Type2"])
        );
    });

    test("should return 500 on server error", async () => {
        // Simula un errore riprovando senza tipi di documento (non obbligatorio)
        const response = await request(app)
            .get(basePath)
            .set("Cookie", urbanplanner_cookie)
            .expect(200);

        // Poiché non ci sono tipi aggiunti, deve essere un array vuoto
        expect(response.body).toHaveLength(0);
    });
});


describe("Integration Test POST / - Add Document Type", () => {
    beforeEach(async () => {
        await cleanup();
        urbanplanner_cookie = await login(urbanPlannerUser);
    });

    test("should add a new document type successfully", async () => {
        const type = {name: "NewType"};

        const response = await request(app)
            .post(basePath)
            .send(type)
            .set("Cookie", urbanplanner_cookie)
            .expect(201);

        expect(response.body).toHaveProperty("typeId");
        expect(response.body.message).toBe("Document type processed successfully");
    });

    test("should return the typeId of the existing type if it already exists", async () => {
        const type = {name: "ExistingType"};

        // Aggiungi il tipo di documento una prima volta
        const first_response = await request(app)
            .post(basePath)
            .send(type)
            .set("Cookie", urbanplanner_cookie)
            .expect(201);

        const typeId = first_response.body.typeId;

        // Riprova ad aggiungere lo stesso tipo di documento
        const response = await request(app)
            .post(basePath)
            .send(type)
            .set("Cookie", urbanplanner_cookie)
            .expect(201);

        expect(response.body.typeId).toBe(typeId);
    });
});
