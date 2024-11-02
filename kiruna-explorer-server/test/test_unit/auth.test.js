import { describe, test, expect, beforeEach } from "vitest";

import { User, Role } from "../../models/User.mjs";

const basePath = "/api"

// Example Parameters for the tests
const residentUser = { username: "user1", password: "password1", role: Role.RESIDENT}
const urbanplannerUser = { username: "user2", password: "password2", role: Role.URBAN_PLANNER}

describe("Unit Test POST /session - Login", ()=>{
    beforeEach(async ()=>{
        
    })

    test("Login as a resident", async ()=>{
        
        
    })

    test("Login as a urban planner", async ()=>{
        
        
    })
})