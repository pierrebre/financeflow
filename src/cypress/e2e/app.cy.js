describe('Navigation', () => {
	it('should navigate to the watchlist page', () => {
		// Start from the index page
		cy.visit('http://localhost:3000/');

		cy.get('button[aria-label="User button dropdown"]').click();
		cy.get('a[href*="watchlist"]').click();

		cy.url().should('include', '/watchlist');

		cy.get('h1').contains('Watchlist');
	});
});
