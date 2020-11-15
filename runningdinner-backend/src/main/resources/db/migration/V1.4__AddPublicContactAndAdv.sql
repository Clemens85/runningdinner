ALTER TABLE runningdinner.runningdinner ADD COLUMN publicContactName varchar(255);
ALTER TABLE runningdinner.runningdinner ADD COLUMN publicContactEmail varchar(255);
ALTER TABLE runningdinner.runningdinner ADD COLUMN publicContactMobileNumber varchar(255);

create table runningdinner.Contract (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    advAcknowledged boolean not null,
    city varchar(255),
    email varchar(255) not null,
    fullname varchar(255) not null,
    ip varchar(255),
    newsletterEnabled boolean not null,
    newsletterEnabledChangeDateTime timestamp,
    parentDeletedRunningDinnerId uuid references runningdinner.DeletedRunningDinner,
    parentRunningDinnerId uuid references runningdinner.RunningDinner,
    streetWithNr varchar(255) not null,
    zip varchar(16) not null,
    primary key (id)
);

alter table runningdinner.Contract 
	    add constraint UK_brcfap7vhoa937r07uhupejgg unique (objectId);
	    
GRANT ALL ON ALL TABLES IN SCHEMA ${runningdinner-schema-name} to ${runningdinner-user-name};