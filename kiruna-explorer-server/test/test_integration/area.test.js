import { describe, test, expect, beforeEach } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import { Role } from "../../models/User.mjs";
import AreaDAO from "../../dao/AreaDAO.mjs";

const docPath = "/api/documents";
const areaPath = "/api/areas";
const typePath = "/api/document-types"
const stakeholderPath = "/api/document-stakeholders"
const AreaDao = new AreaDAO();

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

const createDocument = async (usercookie, doc) => {
  return new Promise((resolve, reject) => {
    request(app)
      .post(`${docPath}`)
      .send(doc)
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




let mockDocId
let mockTypeId
let mockStakeholdersIds
const mockStakeholdersNames = ["Stakeholder1", "Stakeholder2"]


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







//example for a mockdocument
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
    const geoJson = {
      geoJson: '{"type":"Feature","geometry":{"type":"Point","coordinates":[125.6, 10.1]}}'
    };

    const res = await request(app)
      .post(areaPath)
      .set("Cookie", urbanplanner_cookie) // Authorized role
      .send(geoJson)
      .expect(201);

    expect(typeof res.body).toBe("number"); // Controlla che sia effettivamente un numero
    expect(res.body).toBeGreaterThan(0); // Should return lastid
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

  test("Should return 200 for unauthenticated user", async () => {
    const res = await request(app).get(areaPath).expect(200);

    expect(res.body).toBeInstanceOf(Array);
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
    const geoJson = {
      geoJson: '{"type":"Feature","geometry":{"type":"Point","coordinates":[125.6, 10.1]}}'
    };
    //create new area
    const resarea = await request(app)
      .post(areaPath)
      .set("Cookie", urbanplanner_cookie) // Authorized role
      .send(geoJson)
      .expect(201);
    const areaId = resarea.body
    //create document in that area
    const mockDocumentbody = {
      title: 'Test Document',
      scale: 'plan',
      date: '2023-01-01',
      typeId: null,
      language: 'English',
      pages: 3,
      description: 'A test document',
      planNumber: 10,
      areaId: areaId
    };

    const typeId = await createtype(urbanplanner_cookie, "testtype");

    mockDocumentbody.typeId = typeId

    await createDocument(urbanplanner_cookie, mockDocumentbody)

    //take documents from area  
    const res = await request(app)
      .get(`${docPath}/area/${areaId}`)
      .set("Cookie", urbanplanner_cookie) // Authenticated user
      .expect(200);

    expect(res.body).toBeInstanceOf(Array); // Check if the response is an array of documents
    res.body.forEach((doc) => {
      expect(doc).toHaveProperty("id");
      expect(doc).toHaveProperty("title");
      expect(doc).toHaveProperty("areaId", areaId);
    });
  });

  test("Should return 404 if no documents found for the given areaId", async () => {
    const geoJson = {
      geoJson: '{"type":"Feature","geometry":{"type":"Point","coordinates":[125.6, 10.1]}}'
    };
    //create new area but without document connected
    const resarea = await request(app)
      .post(areaPath)
      .set("Cookie", urbanplanner_cookie) // Authorized role
      .send(geoJson)
      .expect(201);

    const areaId = resarea.body
    const res = await request(app)
      .get(`${docPath}/area/${areaId}`)
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

    expect(res.body.error).toBe("Invalid area ID");
  });


});


// GET /api/areas/areaId - Get area by id
describe("Integration Test GET /api/areas/:areaId - Get area by id", () => {
  beforeEach(async () => {
    // Clean up the database or reset mock data
    await cleanup();
    urbanplanner_cookie = await login(urbanPlannerUser);
  });

  test("Should retrieve an area successfully for an authenticated user", async () => {
    const response = await request(app)
      .post(areaPath)
      .set("Cookie", urbanplanner_cookie) // Ensure the user is authenticated
      .send({ geoJson: '{"type":"Feature","geometry":{"type":"Point","coordinates":[125.6, 10.1]}}' })
      .expect(201);

    const areaId = response.body;


    const res = await request(app)
      .get(`${areaPath}/${areaId}`)
      .set("Cookie", urbanplanner_cookie) // Ensure the user is authenticated
      .expect(200);

    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toHaveProperty("id", areaId);
    expect(res.body).toHaveProperty("geoJson");
  });


  test("Should return 404 for non-existing areaId", async () => {
    const invalidAreaId = -1

    const res = await request(app)
      .get(`${areaPath}/${invalidAreaId}`)
      .set("Cookie", urbanplanner_cookie) // Ensure the user is authenticated
      .expect(404);

    expect(res.body).toHaveProperty(
      "error",
      "Area not found"
    );
  })

  test("Should return 400 if areaId is not a valid integer", async () => {
    const invalidAreaId = "abc"; // Non-integer ID

    const res = await request(app)
      .get(`${areaPath}/${invalidAreaId}`)
      .set("Cookie", urbanplanner_cookie)
      .expect(400);

    expect(res.body.errors[0].msg).toBe("Area ID must be a valid number");
  })

});


