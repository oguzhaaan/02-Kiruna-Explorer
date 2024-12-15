describe("Navigate to Diagram and Test Multiple Documents from Side Panel", () => {
  const testDocumentNavigation = (documentTitle, index) => {
    // Open the side panel only if it's not already open (except for the first document)
    if (index != 0) {
      cy.get(".navbar-toggler > .bi", { timeout: 10000 })
        .should("be.visible")
        .click();
    }

    cy.get(".offcanvas-content").should("be.visible");

    // Locate and click the diagram icon for the document
    cy.contains(".offcanvas-content .font-sans", documentTitle)
      .should("exist") // Assert the document is present
      .parents("div.flex-row")
      .find('div[title="see document in the diagram"]')
      .click();

    // Assert navigation to the diagram page
    cy.url().should("include", "/diagram");

    // Wait
    cy.wait(2000);

    // Navigate back to the map
    cy.visit("http://localhost:5173/mapDocuments");
    cy.url().should("include", "/mapDocuments");
  };

  it("Clicks on diagram icons for multiple documents", () => {
    // Visit the login page
    cy.visit("http://localhost:5173/login");

    // Log in
    cy.get('input[name="username"]').type("Romeo");
    cy.get('input[name="password"]').type("1111");
    cy.get('button[type="submit"]').click();

    // Verify login is successful
    cy.url().should("not.include", "/login");

    // Open the side panel (for the first document)
    cy.get(".navbar-toggler > .bi", { timeout: 10000 })
      .should("be.visible")
      .click();

    // Get all document titles dynamically from the panel
    cy.get(".offcanvas-content .font-sans").then(($documents) => {
      const documentTitles = [];
      $documents.each((index, doc) => {
        const title = Cypress.$(doc).text().trim();
        if (title) {
          documentTitles.push(title);
        }
      });

      // Iterate over each document and test navigation
      documentTitles.forEach((title, index) => {
        testDocumentNavigation(title, index);
      });
    });
  });
});
