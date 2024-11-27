import Providers from '@/app/providers';
import React from 'react';

describe('<Providers />', () => {
	it('renders', () => {
		// see: https://on.cypress.io/mounting-react
		cy.mount(<Providers children={<div>Hello</div>} />);
	});
});
