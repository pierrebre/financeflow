import React from 'react';
import RootLayout from '../../app/layout';

describe('<RootLayout />', () => {
	it('renders', () => {
		// see: https://on.cypress.io/mounting-react
		cy.mount(<RootLayout children={<div>Hello</div>} session={null} />);
	});
});
