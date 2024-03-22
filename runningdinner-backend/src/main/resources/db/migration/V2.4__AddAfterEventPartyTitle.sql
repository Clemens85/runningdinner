ALTER TABLE runningdinner.runningdinner ADD COLUMN afterPartyTitle text;

UPDATE runningdinner.runningdinner SET afterPartyTitle = 'After-Event-Party' WHERE length(afterPartyLocationZip) > 0;
