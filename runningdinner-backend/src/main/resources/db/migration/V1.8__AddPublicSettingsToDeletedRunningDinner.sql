ALTER TABLE runningdinner.DeletedRunningDinner ADD COLUMN publicContactName varchar(255);
ALTER TABLE runningdinner.DeletedRunningDinner ADD COLUMN publicContactEmail varchar(255);
ALTER TABLE runningdinner.DeletedRunningDinner ADD COLUMN publicContactMobileNumber varchar(255);
ALTER TABLE runningdinner.DeletedRunningDinner ADD COLUMN endOfRegistrationDate date;
ALTER TABLE runningdinner.DeletedRunningDinner ADD COLUMN publicDescription varchar(2048);
ALTER TABLE runningdinner.DeletedRunningDinner ADD COLUMN publicId varchar(48);
ALTER TABLE runningdinner.DeletedRunningDinner ADD COLUMN publicTitle varchar(256);
ALTER TABLE runningdinner.DeletedRunningDinner ADD COLUMN registrationDeactivated boolean;