// these imports are something you'd normally configure Jest to import for you
// automatically. Learn more in the setup docs: https://testing-library.com/docs/react-testing-library/setup#cleanup
import '@testing-library/jest-dom'
// NOTE: jest-dom adds handy assertions to Jest and is recommended, but not required

import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import {AddressLocation} from "./AddressLocation";

test('City and Zip is rendered', () => {

  //expect.extend({toBeInTheDocument, toBeVisible});
  render(<AddressLocation zip="12345" cityName="Musterstadt"/>);
  screen.debug();
  let result = screen.getByText('12345 Musterstadt');
  expect(result).toBeInTheDocument();
});
