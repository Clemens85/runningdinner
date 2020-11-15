ALTER TABLE runningdinner.runningdinner ADD COLUMN languageCode varchar(16);
UPDATE runningdinner.runningdinner SET languageCode = 'de';
ALTER TABLE runningdinner.runningdinner ALTER COLUMN languageCode SET NOT NULL;

ALTER TABLE runningdinner.deletedrunningdinner ADD COLUMN languageCode varchar(16);
UPDATE runningdinner.deletedrunningdinner SET languageCode = 'de';
ALTER TABLE runningdinner.deletedrunningdinner ALTER COLUMN languageCode SET NOT NULL;