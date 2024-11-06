import { describe, test, expect, beforeEach } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import { Role } from "../../models/User.mjs";

const docPath = "/api/documents";
const areaPath = "/api/areas";

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
// Example Parameters for the tests
const urbanPlannerUser = {
  id: 1,
  username: "Romeo",
  password: "1111",
  role: Role.URBAN_PLANNER,
};
const residentUser = {
  id: 2,
  username: "Juliet",
  password: "2222",
  role: Role.RESIDENT,
};
//cookie for the login, in case of API that needs an authentication before
let resident_cookie;
let urbanplanner_cookie;

// POST /api/areas - Create a new area
describe("Integration Test POST /api/areas - Create a new area", () => {
  beforeEach(async () => {
    // Reset or clean up the data
    await cleanup();
    urbanplanner_cookie = await login(urbanPlannerUser);
    resident_cookie = await login(residentUser); // Resident has no permission to create an area
  });

  test("Should create a new area for an authorized user", async () => {
    const geoJson =
      '{"type":"Feature","geometry":{"type":"Point","coordinates":[125.6, 10.1]}}';

    const res = await request(app)
      .post(areaPath)
      .set("Cookie", urbanplanner_cookie) // Authorized role
      .send({ geoJson })
      .expect(201);

    expect(res.body).toHaveProperty("id"); // Check if the response has an id for the new area
    expect(res.body.geoJson).toBe(geoJson);
  });

  test("Should return 400 for invalid geoJson data", async () => {
    const res = await request(app)
      .post(areaPath)
      .set("Cookie", urbanplanner_cookie) // Authorized role
      .send({ geoJson: "" }) // Invalid data
      .expect(400);

    expect(res.body.errors[0].msg).toBe("GeoJSON is required");
  });

  test("Should return 403 for unauthorized role", async () => {
    const geoJson =
      '{"type":"Feature","geometry":{"type":"Point","coordinates":[125.6, 10.1]}}';

    const res = await request(app)
      .post(areaPath)
      .set("Cookie", resident_cookie) // Unauthorized role
      .send({ geoJson })
      .expect(403);

    expect(res.body).toHaveProperty("error", "Forbidden");
  });
});

// GET /api/areas - Get all areas
describe("Integration Test GET /api/areas - Get all areas", () => {
  beforeEach(async () => {
    // Clean up the database or reset mock data
    await cleanup();
    urbanplanner_cookie = await login(urbanPlannerUser);
  });

  test("Should retrieve all areas successfully for an authenticated user", async () => {
    const res = await request(app)
      .get(areaPath)
      .set("Cookie", urbanplanner_cookie) // Ensure the user is authenticated
      .expect(200);

    expect(res.body).toBeInstanceOf(Array); // Check if the response is an array
    res.body.forEach((area) => {
      expect(area).toHaveProperty("id");
      expect(area).toHaveProperty("geoJson");
    });
  });

  test("Should return 401 for unauthenticated user", async () => {
    const res = await request(app).get(areaPath).expect(401);
    expect(res.body).toHaveProperty("error", "Not authorized");
  });
});

// GET /api/documents/area/:areaId
describe("Integration Test GET /api/documents/area/:areaId", () => {
  beforeEach(async () => {
    // Reset data
    await cleanup();
    urbanplanner_cookie = await login(urbanPlannerUser);
  });

  test("Should retrieve documents for a valid areaId", async () => {
    const validAreaId = 1; // Assume this area exists in your mock data setup

    const res = await request(app)
      .get(`${docPath}/area/${validAreaId}`)
      .set("Cookie", urbanplanner_cookie) // Authenticated user
      .expect(200);

    expect(res.body).toBeInstanceOf(Array); // Check if the response is an array of documents
    res.body.forEach((doc) => {
      expect(doc).toHaveProperty("id");
      expect(doc).toHaveProperty("title");
      expect(doc).toHaveProperty("areaId", validAreaId);
    });
  });

  test("Should return 404 if no documents found for the given areaId", async () => {
    const noDocsAreaId = 2; // Assume this area exists but has no documents

    const res = await request(app)
      .get(`${docPath}/area/${noDocsAreaId}`)
      .set("Cookie", urbanplanner_cookie)
      .expect(404);

    expect(res.body).toHaveProperty(
      "error",
      "No documents found for this area"
    );
  });

  test("Should return 404 for non-existing areaId", async () => {
    const invalidAreaId = 999;

    const res = await request(app)
      .get(`${docPath}/area/${invalidAreaId}`)
      .set("Cookie", urbanplanner_cookie) // Authenticated user
      .expect(404);

    expect(res.body).toHaveProperty(
      "error",
      "No documents found for this area"
    );
  });

  test("Should return 400 if areaId is not a valid integer", async () => {
    const invalidAreaId = "abc"; // Non-integer ID

    const res = await request(app)
      .get(`${docPath}/area/${invalidAreaId}`)
      .set("Cookie", urbanplanner_cookie)
      .expect(400);

    expect(res.body.errors[0]).toHaveProperty(
      "msg",
      "Area ID must be a valid integer"
    );
  });
});
