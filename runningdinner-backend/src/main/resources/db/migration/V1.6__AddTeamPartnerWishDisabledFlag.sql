ALTER TABLE runningdinner.runningdinner ADD COLUMN teamPartnerWishDisabled boolean;
UPDATE runningdinner.runningdinner SET teamPartnerWishDisabled = FALSE;
ALTER TABLE runningdinner.runningdinner ALTER COLUMN teamPartnerWishDisabled SET NOT NULL;