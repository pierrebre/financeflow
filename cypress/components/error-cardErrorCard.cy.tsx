import { ErrorCard } from '@/components/auth/error-card';
import React from 'react';

describe('<ErrorCard />', () => {
	it('renders', () => {
		// see: https://on.cypress.io/mounting-react
		cy.mount(<ErrorCard />);
	});
});
