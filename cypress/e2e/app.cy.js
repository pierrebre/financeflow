describe('Navigation', () => {
	it('should navigate to the about page', () => {
		// Start from the index page
		cy.visit('http://localhost:3000/');

		cy.get('a[href*="watchlist"]').click();

		cy.url().should('include', '/watchlist');

		cy.get('h1').contains('Watchlist');
	});
});
