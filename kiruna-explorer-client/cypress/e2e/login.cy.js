describe("Login as Urban Planner", () => {
  it("logs in with valid credentials", () => {
    cy.visit("http://localhost:5173/login"); // Visit the login page

    // Enter username
    cy.get('input[name="username"]').type("Romeo");

    // Enter password
    cy.get('input[name="password"]').type("1111");

    // Click the login button
    cy.get('button[type="submit"]').click();

    cy.url().should("not.include", "/login"); //Verify that the URL has changed
  });
});
