create table runningdinner.PaymentOptions (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(255) not null,
   	pricePerRegistration numeric(19, 2) not null,
   	brandName varchar(127) not null,
   	agbLink text,
    runningDinnerId uuid references runningdinner.RunningDinner,
    primary key (id)
);
alter table runningdinner.PaymentOptions add constraint PaymentOptionsObjectIdUnique unique (objectId);
	    
create table runningdinner.RegistrationOrder (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(255) not null,
    runningDinnerId uuid references runningdinner.RunningDinner,
    participantId uuid,
    registrationDataJsonStr text,
	paypalOrderId text,
	paypalOrderStatus text,
	approveLinkHref text not null,
	approveLinkRel text not null,
	approveLinkMethod text not null,
	selfLinkHref text,
	selfLinkRel text,
	selfLinkMethod text,
	updateLinkHref text,
	updateLinkRel text,
	updateLinkMethod text,
	payerEmail text,
 	payerFullname text,
  	payerId text,
    primary key (id)
);
alter table runningdinner.RegistrationOrder add constraint OrderObjectIdUnique unique (objectId);    

GRANT ALL ON ALL TABLES IN SCHEMA ${runningdinner-schema-name} to ${runningdinner-user-name};