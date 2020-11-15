import React from 'react';
import 'TestUtils';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  mockClosedRunningDinner,
} from "TestUtils";
import Dashboard from "./Dashboard";
import {BASE_URL} from "../../shared/BackendConfig";
import { rest } from "msw";
import {setupServer} from "msw/node";
import { act } from "react-dom/test-utils";

describe('Dashboard', () => {

  const server = setupServer(
      rest.put(`${BASE_URL}/runningdinnerservice/v1/runningdinner/:adminId/mealtimes`, (req, res, ctx) => {
        const { adminId } = req.params;
        const response = mockClosedRunningDinner('PotzBlitz');
        response.adminId = adminId;
        return res(ctx.json(response));
      })
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('Closed Running Dinner is correctly displayed', () => {
    const runningDinner = mockClosedRunningDinner('PotzBlitz');
    render(<Dashboard runningDinner={runningDinner} onRuningDinnerUpdate={() => {}} />);

    expect(screen.getByRole('heading', {name: /PotzBlitz/})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /79100 Freiburg/})).toBeInTheDocument();

    expect(screen.getByRole('heading', {name: 'Sichtbarkeit'})).toBeInTheDocument();
    expect(screen.getByText(/Keine öffentliche Anmeldung/i)).toBeInTheDocument();

    expect(screen.getByText('Vorspeise')).toBeInTheDocument();
    expect(screen.getByText('Hauptspeise')).toBeInTheDocument();
    expect(screen.getByText('Dessert')).toBeInTheDocument();

    expect(screen.queryByText(/Öffentlicher Link/i)).not.toBeInTheDocument();

    const editButton = screen.getByRole('button', {name: 'edit'});
    expect(editButton).toBeInTheDocument();
  });

  test('Edit meal times dialog', async () => {

    const onRuningDinnerUpdate = jest.fn();

    const runningDinner = mockClosedRunningDinner('PotzBlitz');
    render(<Dashboard runningDinner={runningDinner} onRuningDinnerUpdate={onRuningDinnerUpdate} />);

    const editButton = screen.getByRole('button', {name: 'edit'});
    fireEvent.click(editButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Vorspeise');

    const input = screen.getByRole('textbox', {name: "Vorspeise"});
    fireEvent.change(input, { target: { value: '11:11 AM' } });

    const saveBtn = screen.getByRole('button', {name: "Speichern"});
    fireEvent.click(saveBtn);

    const notification = await screen.findByText('Zeitplan erfolgreich gespeichert!');
    expect(notification).toBeInTheDocument();

    expect(onRuningDinnerUpdate).toHaveBeenCalledTimes(1);
  });

  test('Cancel edit meal times dialog', async () => {

    const onRuningDinnerUpdate = jest.fn();

    const runningDinner = mockClosedRunningDinner('PotzBlitz');
    render(<Dashboard runningDinner={runningDinner} onRuningDinnerUpdate={onRuningDinnerUpdate} />);

    const editButton = screen.getByRole('button', {name: 'edit'});
    fireEvent.click(editButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Vorspeise');

    const cancelBtn = screen.getByRole('button', {name: "Abbrechen"});
    fireEvent.click(cancelBtn);

    act(() => {});

    expect(onRuningDinnerUpdate).toHaveBeenCalledTimes(0);
  });

});


