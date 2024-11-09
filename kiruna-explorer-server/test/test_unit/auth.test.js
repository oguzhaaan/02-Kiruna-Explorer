import { describe, test, expect, beforeEach, afterEach, vitest } from "vitest";
import crypto from "node:crypto"
import { User, Role } from "../../models/User.mjs";
import db from "../../db.mjs"
import UserDao from "../../dao/UserDAO.mjs"

// In unit tests for dao we are going to mock the database with some data
// Example Parameters for the tests
const testUser = { id: 1, username: "user1", password: "password1", role: Role.RESIDENT}

let UserDAO

describe("Unit Test POST /session - Login", ()=>{
    beforeEach(async ()=>{
        UserDAO = new UserDao()
    })

    afterEach(()=>{
        // clear all created function mocks after each test
        vitest.clearAllMocks()
    })

    test("Login as a user", async ()=>{
            const salt = Buffer.from("salt")
            const hashedPassword = Buffer.from(testUser.password)
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, {
                    id: testUser.id,
                    role:testUser.role,
                    username: testUser.username,
                    password: hashedPassword,
                    salt: salt
                })
                return {}
            });
            vitest.spyOn(crypto, "scrypt").mockImplementation((_password, _salt, _keylen, callback) => {
                callback(null, hashedPassword); 
            });

            vitest.spyOn(crypto, "timingSafeEqual").mockImplementation((_password, _hashedPassword) => {
                return true
            })

            const result = await UserDAO.getUser(
                testUser.username,
                testUser.password,
            )
            expect(result).toEqual(new User(
                testUser.id,
                testUser.role,
                testUser.username
            ))
            expect(db.get).toBeCalledTimes(1)
    })

    test("Login as a non-existing user", async ()=>{
        const salt = Buffer.from("salt")
            const hashedPassword = Buffer.from(testUser.password)
            vitest.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
                callback(null, {
                    id: testUser.id,
                    role:testUser.role,
                    username: testUser.username,
                    password: hashedPassword,
                    salt: salt
                })
                return {}
            });
            vitest.spyOn(crypto, "scrypt").mockImplementation((_password, _salt, _keylen, callback) => {
                callback(null, hashedPassword); 
            });

            vitest.spyOn(crypto, "timingSafeEqual").mockImplementation((_password, _hashedPassword) => {
                return false
            })

            const result = await UserDAO.getUser(
                testUser.username,
                testUser.password,
            )
            expect(result).toEqual(false)
            expect(db.get).toBeCalledTimes(1)  
    })
})