// test-utils.js
import React from 'react'
import '../shared/i18n/i18n';
import {CONSTANTS as Constants} from "../shared/Constants";
import forEach from 'lodash/forEach';

// re-export everything
//export * from '@testing-library/react';

export function mockAssignableParticipant(participantNr) {
  return {
    id: participantNr + '',
    participantNr: participantNr,
    assignmentType: Constants.ASSIGNMENT_TYPE.ASSIGNABLE
  };
}

export function mockAssignableParticipantList(numParticipants) {
  const result = [];
  for (let i = 1; i <= numParticipants; i++) {
    result.push(mockAssignableParticipant(i));
  }
  return result;
}

export function mockNotAssignableParticipantList(numParticipants) {
  const result = mockAssignableParticipantList(numParticipants);
  forEach(result, p => p.assignmentType = Constants.ASSIGNMENT_TYPE.NOT_ASSIGNABLE);
  return result;
}

export function mockClosedRunningDinner(title) {
  const date = new Date();
  return {
    adminId: '1',
    id: '1',
    email: 'max@mustermann.de',
    basicDetails: {
      date: date,
      title: title,
      zip: '79100',
      city: 'Freiburg',
      registrationType: Constants.REGISTRATION_TYPE.CLOSED
    },
    options: {
      teamSize: 2,
      meals: [
        { label: 'Vorspeise', time: date, id: '1' },
        { label: 'Hauptspeise', time: date, id: '2' },
        { label: 'Dessert', time: date, id: '3' }
      ]
    }
  };
}
