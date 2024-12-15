describe("Iterate documents in the diagram", () => {
  it("iterates through all nodes", () => {
    cy.visit("http://localhost:5173/login"); // Visit the login page

    // Log in
    cy.get('input[name="username"]').type("Romeo");
    cy.get('input[name="password"]').type("1111");
    cy.get('button[type="submit"]').click();

    cy.url().should("not.include", "/login"); // Verify the URL has changed

    // Open the side panel
    cy.get(".navbar-toggler", { timeout: 10000 }).should("be.visible").click();
    // Go to diagram
    cy.get(".offcanvas-item").contains("Diagram").parent().click();
    // Close the side panel
    cy.get(".navbar-toggler", { timeout: 10000 }).should("be.visible").click();

    // Wait for to load
    cy.wait(3000);

    // Iterate over all nodes
    cy.get('[data-testid^="rf__node-"]')
      .each(($node, index) => {
        cy.log(`Clicking node ${index + 1}`);

        // Open the document
        cy.wrap($node).parent().find('.fixed').click(); // Should be fixed

        cy.wait(10000);

        // Close the document
        cy.get("i.bi.bi-x-lg.text-2xl") 
          .parent() 
          .parent() 
          .click(); 
      });
  });
});
