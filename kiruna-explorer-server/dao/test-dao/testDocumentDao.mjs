// test file for quick testing the functions in the DocumentDAO.mjs. uncomment the function you want to test.
// run the file with the command: node dao/test-dao/testDocumentDao.mjs
import DocumentDAO from '../../dao/DocumentDAO.mjs';
import Document from '../../models/Document.mjs';
import AreaDAO from '../../dao/AreaDAO.mjs';

async function testGetDocumentById() {
    const documentDAO = new DocumentDAO();

    try {
        const document = await documentDAO.getDocumentById(1); // Replace 1 with the ID you want to test
        if (document) {
            console.log('Document found:', document);
        } else {
            console.log('No document found with the given ID.');
        }
    } catch (error) {
        console.error('Error fetching document:', error);
    }
}

//testGetDocumentById();

async function testAddDocument() {
    const documentDAO = new DocumentDAO();
    const newDocument = {
        title: 'New Document',
        stakeholders: 'Stakeholder E',
        date: '2023-09-01',
        type: 'informative', // Ensure this is one of the allowed values
        language: 'English',
        description: 'This is a new document.',
        areaId: 1 // Ensure this areaId exists in your area table
    };

    try {
        const documentId = await documentDAO.addDocument(newDocument);
        console.log('Document added with ID:', documentId);
    } catch (error) {
        console.error('Error adding document:', error);
    }
}

//testAddDocument();

async function testAddArea() {
    const areaDAO = new AreaDAO();
    const newArea = {
        geoJson: '{"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [10, 10]}}]}'
    };
    const areaId = await areaDAO.addArea(newArea);
    console.log('Area added with ID:', areaId);
}

//testAddArea();