//test file for AreaDao.mjs

import AreaDAO from "./AreaDAO.mjs";
import Area from "../models/Area.mjs";
import DocumentDAO from "./DocumentDAO.mjs";
import Document from "../models/Document.mjs";

const areaDAO = new AreaDAO();
const documentDAO = new DocumentDAO();

function testAddArea() {
areaDAO.addArea(new Area(1, "geoJson"))
.then(id => {
    console.log("Area added with id:", id);
})
.catch(err => {
    console.error("Error adding area:", err);
});

}

//testAddArea();

function testGetAreas() {
    areaDAO.getAllAreas()
    .then(areas => {
        console.log("Areas:", areas);
    })
}

//testGetAreas();

function testGetDocumentsByAreaId() {
    documentDAO.getDocumentsByAreaId(1)
    .then(documents => {
        console.log("Documents:", documents);
    })
    .catch(err => {
        console.error("Error getting documents:", err);
    });
}

//testGetDocumentsByAreaId();
