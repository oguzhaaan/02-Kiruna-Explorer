//test file for AreaDao.mjs

import AreaDAO from "./AreaDAO.mjs";
import Area from "../models/Area.mjs";

const areaDAO = new AreaDAO();

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

testGetAreas();   
