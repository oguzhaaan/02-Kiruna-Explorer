import { describe, test, expect, beforeEach } from "vitest";
import { app } from "../../server.mjs";
import request from "supertest";
import { cleanup } from "../cleanup.js";
import { Role } from "../../models/User.mjs";
import { rejects } from "assert";

const path = require('path');
const filePath = path.resolve(__dirname, '../file/test.pdf'); 
const videoPath = path.resolve(__dirname, '../file/video.mp4'); 
const basePath = "/api/documents"

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

const deleteFile= async (usercookie, DocId, FileId) =>{
    return new Promise((resolve,reject)=>{
        request(app)
        .delete(`${basePath}/${DocId}/files/${FileId}`)
        .set("Cookie",usercookie)
        .expect(200)
        .end((err,res)=>{
            if(err){
                reject(err)
            }
            resolve(true)
        });
    })
}

//example for a mockdocument
// Example Parameters for the tests
const mockDocumentbody = {
    title: 'Test Document',
    scale: 'plan',
    date: '2023-01-01',
    type: 'design',
    language: 'English',
    pages: 3,
    description: 'A test document',
    stakeholders: ['lkab','municipality'],
    planNumber: 10,
  };
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
let mockDocId

// POST /api/areas - Create a new area
describe("Integration Test POST /api/documents/:DocId/files - Attach a new file", () => {
    beforeEach(async () => {
      // Reset or clean up the data
      await cleanup();
      urbanplanner_cookie = await login(urbanPlannerUser);
      resident_cookie = await login(residentUser); // Resident has no permission to upload files
      mockDocId = await createDocument(urbanplanner_cookie,mockDocumentbody);
    });
  
    test("Should Upload a file with success", async ()=>{
        const response = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie",urbanplanner_cookie)
            .attach('file', filePath) // Mock di un file PNG
            .field('fileType', 'original');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('File uploaded successfully');

        //clear
        const fileId = response.body.fileId;
        await deleteFile(urbanplanner_cookie,mockDocId,fileId)
    })

    test("Should return error if the file type is not between attachment or original", async ()=>{
        const response = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie",urbanplanner_cookie)
            .attach('file', filePath) // Mock di un file PNG
            .field('fileType', 'other');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid file type. Allowed types: attachment, original');
    })

    it('should return error if the extension is not handled', async () => {
        const response = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie",urbanplanner_cookie)
            .attach('file', videoPath) // Mock di un file PNG
            .field('fileType', 'original');
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid file type. Only JPEG, PNG, PDF, JPG, SVG, and TXT are allowed.');
    });

    it('should return error if there is no file attached', async () => {
        const response = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie",urbanplanner_cookie)
            .field('fileType', 'original');
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('File upload failed. No file provided.');
    });
    
  });


  describe("Integration Test GET /api/documents/:DocId/files/download/:FileId - Download a file", () => {
    beforeEach(async () => {
      // Reset or clean up the data
      await cleanup();
      urbanplanner_cookie = await login(urbanPlannerUser);
      resident_cookie = await login(residentUser); // Resident has no permission to upload files
      mockDocId = await createDocument(urbanplanner_cookie,mockDocumentbody);
    });
  
    test("Should download a file with success", async ()=>{
        //upload file Doc
        const res = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie",urbanplanner_cookie)
            .attach('file', filePath) // Mock di un file PNG
            .field('fileType', 'original');
        //download it
        const fileId = res.body.fileId;
        const response = await request(app)
            .get(`${basePath}/${mockDocId}/files/download/${fileId}`)
            .set("Cookie",urbanplanner_cookie);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('application/pdf');

        //clear
        await deleteFile(urbanplanner_cookie,mockDocId,fileId)
    })

    test("Should return error if the file does not exist", async ()=>{;
        //download a non existing file
        const fileId=-1
        const response = await request(app)
            .get(`${basePath}/${mockDocId}/files/download/${fileId}`)
            .set("Cookie",urbanplanner_cookie)
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('File not found');
    })

  })

describe("Integration Test DELETE /api/documents/:DocId/files/:FileId - delete a file", () => {
    beforeEach(async () => {
      // Reset or clean up the data
      await cleanup();
      urbanplanner_cookie = await login(urbanPlannerUser);
      resident_cookie = await login(residentUser); // Resident has no permission to upload files
      mockDocId = await createDocument(urbanplanner_cookie,mockDocumentbody);
    });
  
    test("Should delete a file with success", async ()=>{
        //upload file Doc
        const res = await request(app)
            .post(`${basePath}/${mockDocId}/files`)
            .set("Cookie",urbanplanner_cookie)
            .attach('file', filePath) // Mock di un file PNG
            .field('fileType', 'original');
        //download it
        const fileId = res.body.fileId;

        const response = await request(app)
            .delete(`${basePath}/${mockDocId}/files/${fileId}`)
            .set("Cookie",urbanplanner_cookie);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('File deleted successfully');
    })

    test("Should return error if the file does not exist", async ()=>{;
        //download a non existing file
        const fileId=-1
        const response = await request(app)
            .delete(`${basePath}/${mockDocId}/files/${fileId}`)
            .set("Cookie",urbanplanner_cookie);
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('File not found');
    })

  })

describe("Integration Test GET /api/documents/:DocId/files - get all files", () => {
beforeEach(async () => {
    // Reset or clean up the data
    await cleanup();
    urbanplanner_cookie = await login(urbanPlannerUser);
    resident_cookie = await login(residentUser); // Resident has no permission to upload files
    mockDocId = await createDocument(urbanplanner_cookie,mockDocumentbody);
});

test("Should get all file with success", async ()=>{
    //upload file Doc
    const res = await request(app)
        .post(`${basePath}/${mockDocId}/files`)
        .set("Cookie",urbanplanner_cookie)
        .attach('file', filePath) // Mock di un file PNG
        .field('fileType', 'original');
    //download it

    const response = await request(app)
        .get(`${basePath}/${mockDocId}/files`)
        .set("Cookie",urbanplanner_cookie);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);

    //clear
    const fileId = res.body.fileId;
    await deleteFile(urbanplanner_cookie,mockDocId,fileId)
})

})