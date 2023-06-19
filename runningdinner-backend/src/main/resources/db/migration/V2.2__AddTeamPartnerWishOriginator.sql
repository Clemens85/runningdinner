ALTER TABLE runningdinner.participant
	ADD COLUMN teamPartnerWishOriginatorId uuid;
	
alter table runningdinner.participant
    add constraint teamPartnerWishOriginatorId_fk
    foreign key (teamPartnerWishOriginatorId)
    references runningdinner.participant;

