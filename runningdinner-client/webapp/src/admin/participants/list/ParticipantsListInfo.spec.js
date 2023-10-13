import React from 'react';
import 'TestUtils';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ParticipantsListInfo from "./ParticipantsListInfo";
import {
  mockAssignableParticipantList,
  mockNotAssignableParticipantList,
} from "../../../test/TestUtils";

describe('ParticipantsListInfo', () => {

  const mockedRunningDinnerSessionData = {
    assignableParticipantSizes: {
      minimumParticipantsNeeded: 18
    }
  };

  test('No info is displayed when user searches', () => {
    render(<ParticipantsListInfo hasSearchText={true}  participants={[]} runningDinnerSessionData={mockedRunningDinnerSessionData}/>);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('Info is displayed for empty participants', () => {
    render(<ParticipantsListInfo hasSearchText={false}  participants={[]} runningDinnerSessionData={mockedRunningDinnerSessionData}/>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Keine Teilnehmer vorhanden')).toBeInTheDocument();
  });

  test('Info is displayed for exact matching participant size', () => {
    const participants = mockAssignableParticipantList(18);
    render(<ParticipantsListInfo hasSearchText={false}  participants={participants} runningDinnerSessionData={mockedRunningDinnerSessionData}/>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Warteliste leer')).toBeInTheDocument();
  });

  test('Info is displayed for too few participants', () => {
    const participants = mockNotAssignableParticipantList(17);
    render(<ParticipantsListInfo hasSearchText={false}  participants={participants} runningDinnerSessionData={mockedRunningDinnerSessionData}/>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getAllByText(/Nicht.*Teilnehmer/i)).toHaveLength(2);
  });

});


