import Providers from '@/app/providers';
import React from 'react';

describe('<Providers />', () => {
	it('renders', () => {
		cy.mount(<Providers>{<div>Hello</div>}</Providers>);
	});
});
