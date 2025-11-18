// these imports are something you'd normally configure Jest to import for you
// automatically. Learn more in the setup docs: https://testing-library.com/docs/react-testing-library/setup#cleanup
import '@testing-library/jest-dom';

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AddressLocation } from './AddressLocation';

test('City and Zip is rendered', () => {
  //expect.extend({toBeInTheDocument, toBeVisible});
  render(<AddressLocation zip="12345" cityName="Musterstadt" />);
  screen.debug();
  let result = screen.getByText('12345 Musterstadt');
  expect(result).toBeInTheDocument();
});
