import DocumentDAO from "./DocumentDAO.mjs";

const documentDao = new DocumentDAO();

documentDao.updateDocumentAreaId(1,40);
/*
async function testGetDocumentsByFilter() {
    try {
        // Test case 1: No filters
        console.log("Test 1: No filters");
        let documents = await documentDao.getDocumentsByFilter({});
        console.log("Documents:", documents);

        // Test case 2: Filter by type
        console.log("\nTest 2: Filter by type 'technical'");
        documents = await documentDao.getDocumentsByFilter({ type: 'informative' });
        console.log("Documents:", documents);

        // Test case 3: Filter by name
        console.log("\nTest 3: Filter by name 'doc1'");
        documents = await documentDao.getDocumentsByFilter({ title: 'Document 1' });
        console.log("Documents:", documents);

        // Test case 4: Filter by stakeholders
        console.log("\nTest 4: Filter by stakeholders 'lkab,municipality'");
        documents = await documentDao.getDocumentsByFilter({ stakeholders: ['lkab', 'municipality'] });
        console.log("Documents:", documents);

        // Test case 5: Filter by date range
        console.log("\nTest 5: Filter by date range '2023-01-01' to '2023-12-31'");
        documents = await documentDao.getDocumentsByFilter({ startDate: '2023-01-01', endDate: '2023-12-31' });
        console.log("Documents:", documents);

        // Add more test cases as needed
    } catch (error) {
        console.error("Error during testing:", error);
    }
}
*/
//testGetDocumentsByFilter();