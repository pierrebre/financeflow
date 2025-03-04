describe('Authentication Flow', () => {
	beforeEach(() => {
		cy.visit('http://localhost:3000/auth/login');
	});

	it('should display login form', () => {
		cy.get('form').should('exist');
		cy.get('input[type="email"]').should('exist');
		cy.get('input[type="password"]').should('exist');
		cy.get('button[type="submit"]').should('exist');
	});

	it('should show error with invalid credentials', () => {
		cy.get('input[type="email"]').type('test@invalid.com');
		cy.get('input[type="password"]').type('1234678');
		cy.get('button[type="submit"]').click();

		cy.get('div').contains('Invalid credentials').should('be.visible');
	});

	it('should successfully login with valid credentials', () => {
		cy.get('input[type="email"]').type(Cypress.env('USER_EMAIL'));
		cy.get('input[type="password"]').type(Cypress.env('USER_PASSWORD'));
		cy.get('button[type="submit"]').click();

		cy.url().should('include', '/dashboard');
	});

	it('should navigate to register page', () => {
		cy.get('a[href*="/auth/register"]').click();
		cy.url().should('include', '/auth/register');
	});

	it('should navigate to forgot password page', () => {
		cy.get('a').contains('Forgot password?').click();
		cy.url().should('include', '/auth/reset-password');
	});
});

describe('Password Reset Flow', () => {
	it('should send reset password email', () => {
		cy.visit('http://localhost:3000/auth/reset-password');
		cy.get('input[type="email"]').type(Cypress.env('USER_EMAIL'));
		cy.get('button[type="submit"]').click();

		cy.contains('Reset email sent').should('be.visible');
	});
});
