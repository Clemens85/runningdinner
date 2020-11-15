ALTER TABLE runningdinner.runningdinner ADD COLUMN registrationDeactivated boolean;
UPDATE runningdinner.runningdinner SET registrationDeactivated = false;
ALTER TABLE runningdinner.runningdinner ALTER COLUMN registrationDeactivated SET NOT NULL;