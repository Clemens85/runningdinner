/// <reference types="cypress" />

import { assertParticipantListLength, getByTestId, navigateParticipantsList } from '../../support';
import { createRunningDinner } from '../../support/runningDinnerSetup';

describe('excel import participants', () => {
  let adminId;

  beforeEach(() => {
    createRunningDinner({
      date: new Date(),
      numParticipantsToCreate: 0,
    }).then((createRunningDinnerResponse) => {
      adminId = createRunningDinnerResponse.runningDinner.adminId;
    });
  });

  it('shows preview with all 3 rows and imports participants with correct data', () => {
    navigateParticipantsList(adminId);

    // Open import dialog via the Excel actions dropdown
    getByTestId('excel-actions-btn').click();
    getByTestId('excel-import-menu-item').click();

    // Upload the xlsx file directly to the hidden file input
    getByTestId('import-file-input').selectFile('cypress/fixtures/import/e2e.xlsx', { force: true });

    // Preview step: table should appear, total chip shows 3 rows
    getByTestId('import-preview-table').should('exist');
    cy.contains('Gesamt: 3').should('be.visible');

    // All 3 participants should be importable (no row with ERROR status)
    getByTestId('dialog-submit').should('contain', '3 Teilnehmer importieren');

    // Confirm import
    getByTestId('dialog-submit').click();

    // Dialog should close after successful full import
    getByTestId('import-preview-table').should('not.exist');

    // Clara's fixed team partner (Fix Fox) is also created → 4 participants total
    assertParticipantListLength(4);

    // --- Verify participant data via API ---
    cy.request(`/rest/participantservice/v1/runningdinner/${adminId}/participants`).then((response) => {
      const { participants } = response.body;
      expect(participants).to.have.length(4);

      // --- Anna Müller ---
      const anna = participants.find((p) => p.email === 'anna.müller0@example.com');
      expect(anna, 'Anna should be imported').to.exist;
      expect(anna.firstnamePart).to.eq('Anna');
      expect(anna.lastname).to.eq('Müller');
      expect(anna.gender).to.eq('MALE');
      expect(anna.age).to.eq(22);
      expect(anna.street).to.eq('Hauptstraße');
      expect(anna.streetNr).to.eq('1');
      expect(anna.zip).to.eq('10115');
      expect(anna.cityName).to.eq('Berlin');
      expect(anna.addressRemarks).to.eq('Wohnung 1');
      expect(anna.numSeats).to.eq(5);
      expect(anna.mobileNumber).to.eq('+49 170 1000000');
      expect(anna.vegetarian).to.be.true;
      expect(anna.vegan).to.be.true;
      expect(anna.lactose).to.be.true;
      expect(anna.gluten).to.be.true;
      expect(anna.mealSpecificsNote).to.eq('Bitte kein Fleisch und keine tierischen Produkte');
      expect(anna.notes).to.eq('Komme etwas später');
      expect(anna.teamPartnerWishEmail).to.be.empty;

      // --- Ben Schmidt ---
      const ben = participants.find((p) => p.email === 'ben.schmidt1@example.com');
      expect(ben, 'Ben should be imported').to.exist;
      expect(ben.firstnamePart).to.eq('Ben');
      expect(ben.lastname).to.eq('Schmidt');
      expect(ben.gender).to.eq('UNDEFINED');
      expect(ben.street).to.eq('Bahnhofstraße');
      expect(ben.streetNr).to.eq('2');
      expect(ben.zip).to.eq('20095');
      expect(ben.cityName).to.eq('Hamburg');
      expect(ben.numSeats).to.eq(0);
      expect(ben.vegetarian).to.be.false;
      expect(ben.vegan).to.be.false;
      // Ben has a team partner wish email pointing to a non-existent participant
      expect(ben.teamPartnerWishEmail).to.eq('not@existent.de');

      // --- Clara Schneider ---
      const clara = participants.find((p) => p.email === 'clara.schneider2@example.com');
      expect(clara, 'Clara should be imported').to.exist;
      expect(clara.firstnamePart).to.eq('Clara');
      expect(clara.lastname).to.eq('Schneider');
      expect(clara.gender).to.eq('FEMALE');
      expect(clara.age).to.eq(24);
      expect(clara.street).to.eq('Gartenweg');
      expect(clara.streetNr).to.eq('3');
      expect(clara.zip).to.eq('80331');
      expect(clara.cityName).to.eq('München');
      expect(clara.numSeats).to.eq(6);
      expect(clara.teamPartnerWishEmail).to.be.empty;
      // Clara is the root of the fixed team partner pair
      expect(clara.teamPartnerWishOriginatorId, 'Clara should have teamPartnerWishOriginatorId set').to.exist;
      expect(clara.teamPartnerWishRegistrationRoot).to.be.true;
      expect(clara.teamPartnerWishRegistrationChild).to.be.false;

      // --- Fix Fox (fixed team partner auto-created for Clara) ---
      const fixFox = participants.find((p) => p.email === 'fix@fox.de');
      expect(fixFox, 'Fix Fox should be auto-created as fixed team partner').to.exist;
      expect(fixFox.firstnamePart).to.eq('Fix');
      expect(fixFox.lastname).to.eq('Fox');
      // Fix Fox is the child: shares the same originatorId as Clara (= Clara's ID)
      expect(fixFox.teamPartnerWishOriginatorId).to.eq(clara.teamPartnerWishOriginatorId);
      expect(fixFox.teamPartnerWishRegistrationChild).to.be.true;
      expect(fixFox.teamPartnerWishRegistrationRoot).to.be.false;
    });
  });
});
