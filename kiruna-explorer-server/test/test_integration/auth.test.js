import { describe, test, expect, beforeEach } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import { User, Role } from "../../models/User.mjs";

const basePath = "/api"

// Example Parameters for the tests
const residentUser = { id:1, username: "Romeo", password: "1111", role: Role.URBAN_PLANNER}
const urbanplannerUser = { id:2, username: "Juliet", password: "2222", role: Role.RESIDENT}
const no_profile = { id:3, username: "user1", password: "pass1", role: null}

describe("Integration Test POST /session - Login", ()=>{
    beforeEach(async ()=>{
        await cleanup()
    })

    test("Login as a resident", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: residentUser.username,
                password: residentUser.password
            })

        expect(result.status).toBe(201)

        expect(result.body).toEqual({
            id: residentUser.id,
            username: residentUser.username,
            role: residentUser.role
        })
    })

    test("Login as a urban planner", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: urbanplannerUser.username,
                password: urbanplannerUser.password
            })

        expect(result.status).toBe(201)

        expect(result.body).toEqual({
            id: urbanplannerUser.id,
            username: urbanplannerUser.username,
            role: urbanplannerUser.role
        })
    })

    test("Login as non-existing user", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: no_profile.username,
                password: no_profile.password
            })

        expect(result.status).toBe(401)

        expect(result.body).toEqual({message: "Incorrect username or password."})
    })

    test("Login with wrong password", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: urbanplannerUser.username,
                password: "222"
            })

        expect(result.status).toBe(401)

        expect(result.body).toEqual({message: "Incorrect username or password."})
    })

    test("Login with wrong username", async ()=>{
        const result = await request(app)
            .post(`${basePath}/sessions`)
            .send({
                username: "giuliet",
                password: urbanplannerUser.password
            })

        expect(result.status).toBe(401)

        expect(result.body).toEqual({message: "Incorrect username or password."})
    })

})