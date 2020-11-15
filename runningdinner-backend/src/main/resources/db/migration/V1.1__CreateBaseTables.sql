-- noinspection SqlNoDataSourceInspectionForFile

create table Activity (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(255) not null,
    runningDinnerId uuid not null,
    activityDate timestamp not null,
    activityHeadline varchar(255),
    activityMessage varchar(2048),
    activityType varchar(64) not null,
    originator varchar(256),
    relatedEntityId uuid,
    relatedEntityType varchar(255),
    primary key (id)
);
 
    
create table DbGeocoderResult (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    cityName varchar(255),
    exact boolean not null,
    formattedAddressString varchar(255),
    lastAccess timestamp,
    lat float8 not null,
    lng float8 not null,
    normalizedAddressString varchar(255),
    street varchar(255),
    streetNr varchar(255),
    zip varchar(255) not null,
    primary key (id)
);
 
    
create table GuestTeamMapping (
    guestTeamId uuid not null,
    parentTeamId uuid not null,
    primary key (guestTeamId, parentTeamId)
);
 
    
create table HostTeamMapping (
    hostTeamId uuid not null,
    parentTeamId uuid not null,
    primary key (hostTeamId, parentTeamId)
);
 
    
create table MealClass (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    label varchar(255) not null,
    time TIMESTAMP WITHOUT TIME ZONE not null,
    dinnerId uuid,
    primary key (id)
);


create table MessageJob (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(255) not null,
    runningDinnerId uuid not null,
    jobExecutionId int8,
    messageType varchar(255) not null,
    numberOfMessageTasks int4 not null,
    sendingFailed varchar(255),
    sendingStatus varchar(255) not null,
    primary key (id)
);
 
    
create table MessageTask (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(255) not null,
    runningDinnerId uuid not null,
    content varchar(2048) not null,
    replyTo varchar(255) not null,
    subject varchar(255) not null,
    parentJobId uuid not null,
    recipientEmail varchar(255) not null,
    sendingEndTime TIMESTAMP WITHOUT TIME ZONE,
    delieveryFailed boolean not null,
    delieveryFailedDate timestamp,
    failureMessage varchar(512),
    failureType varchar(255),
    sendingStartTime TIMESTAMP WITHOUT TIME ZONE,
    sendingStatus varchar(255) not null,
    primary key (id)
);


create table Participant (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(255) not null,
    runningDinnerId uuid not null,
    addressName varchar(255),
    cityName varchar(255),
    remarks varchar(255),
    street varchar(255),
    streetNr varchar(255),
    zip varchar(255) not null,
    age int4 not null,
    email varchar(255),
    gender varchar(16),
    host boolean not null,
    gluten boolean not null,
    lactose boolean not null,
    mealspecificsnote varchar(255),
    vegan boolean not null,
    vegetarian boolean not null,
    mobileNumber varchar(255),
    firstnamePart varchar(255),
    lastname varchar(255),
    notes varchar(512),
    numSeats int4 not null,
    participantNumber int4 not null,
    teamId uuid,
    teamPartnerWish varchar(255),
    activationDate timestamp,
    activatedBy varchar(255),
    primary key (id)
);


create table RunningDinner (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(48) not null,
    city varchar(255),
    considerShortestPaths boolean not null,
    forceEqualDistributedCapacityTeams boolean not null,
    genderAspects varchar(32) not null,
    teamSize int4 not null,
    date date not null,
    email varchar(255) not null,
    endOfRegistrationDate date,
    publicDescription varchar(2048),
    publicId varchar(48),
    publicTitle varchar(256),
    registrationType varchar(32) not null,
    selfAdministrationId uuid not null,
    title varchar(255) not null,
    zip varchar(16) not null,
    cancellationDate TIMESTAMP WITHOUT TIME ZONE,
    acknowledgedDate TIMESTAMP WITHOUT TIME ZONE,
	runningDinnerType varchar(64) not null,
    primary key (id)
);


create table RunningDinnerPreference (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(255) not null,
    runningDinnerId uuid not null,
    preferenceName varchar(255) not null,
    preferenceValue varchar(4096) not null,
    primary key (id)
);
 
    
create table Team (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(255) not null,
    runningDinnerId uuid not null,
    status varchar(32),
    teamNumber int4 not null,
    mealClassId uuid not null,
    primary key (id)
);

create table MailSynchronizationState (
  id uuid not null,
  createdAt TIMESTAMP WITHOUT TIME ZONE not null,
  lockVersion int8 not null,
  modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
  objectId uuid not null,
  additionalInformation varchar(512),
  synchronizationDate timestamp not null,
  synchronizationResult varchar(255) not null,
  primary key (id)
);

create table Feedback (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    adminId varchar(255),
    message varchar(2048) not null,
    pageName varchar(255),
    senderEmail varchar(255) not null,
    senderIp varchar(255),
    deliverystate varchar(64) not null,
    primary key (id)
);

CREATE TABLE runningdinner.shedlock(
  name VARCHAR(64),
  lock_until TIMESTAMP(3) NULL,
  locked_at TIMESTAMP(3) NULL,
  locked_by  VARCHAR(255),
  PRIMARY KEY (name)
);


alter table Activity
    add constraint UK_ilqjux52p7yvt879yg5yn3lk1 unique (objectId);


alter table DbGeocoderResult
    add constraint dbGeocoderResultUniqueConstraint unique (lat, lng, normalizedAddressString);


alter table DbGeocoderResult
    add constraint UK_51bd01qhgic4nrrhdkas8n7nu unique (objectId);


alter table MealClass
    add constraint UK_sxpxksvd421penj600pfaa78 unique (objectId);


alter table MessageJob
    add constraint UK_ic47iurmgi7yjttpan001a7rx unique (objectId);


alter table MessageTask
    add constraint UK_1eaikxdsdewh1t27ba1qdwbdi unique (objectId);

    
alter table Participant
    add constraint UK_aa0ske64mrrqkqkwo0e3wcauu unique (objectId);


alter table RunningDinner
    add constraint UK_7o3u6iq8bau6m7hhg1fhxnec unique (objectId);


alter table RunningDinner
    add constraint UK_krs9rf03gf0gtnmr1q8oph3nk unique (adminId);


alter table RunningDinnerPreference
    add constraint UK_iptog05mmk2k9nmrhqcqbyryg unique (objectId);


alter table Team
    add constraint UK_3supf11sceaw3ooo2ewrycaxi unique (objectId);

alter table runningdinner.Feedback 
    add constraint UK_egay2i7t9p902w3a4la2uk9ln unique (objectId);
    
alter table Activity
    add constraint FKjqqua4xm1que705vcpeany7an
    foreign key (runningDinnerId)
    references RunningDinner;


alter table GuestTeamMapping
    add constraint FKc93tr423vtorg88754mnab5sg
    foreign key (parentTeamId)
    references Team;


alter table GuestTeamMapping
    add constraint FK6kbm6ksy3ggwmyosvcj83b3q9
    foreign key (guestTeamId)
    references Team;


alter table HostTeamMapping
    add constraint FKrvmri0w8jj6im3ww9gkaxx6ly
    foreign key (parentTeamId)
    references Team;


alter table HostTeamMapping
    add constraint FKbv9nxhl7xsmv8tmpyovkrvtdp
    foreign key (hostTeamId)
    references Team;


alter table MealClass
    add constraint FKixu3b2a1hpko91j6ud68xrjnw
    foreign key (dinnerId)
    references RunningDinner;


alter table MessageJob
    add constraint FKd6ck344uanldbxi6don4bbgsq
    foreign key (runningDinnerId)
    references RunningDinner;


alter table MessageTask
    add constraint FKgwrqydwsck0gwwsnp2m9r9k2p
    foreign key (runningDinnerId)
    references RunningDinner;


alter table MessageTask
    add constraint FK4gx63dxqh6098foxdf7av60eh
    foreign key (parentJobId)
    references MessageJob;


alter table Participant
    add constraint FKj35pmh4hptbpuhiomskkaxah2
    foreign key (runningDinnerId)
    references RunningDinner;


alter table Participant
    add constraint FKejwf9q5leyf2o38are84hm4fq
    foreign key (teamId)
    references Team;


alter table RunningDinnerPreference
    add constraint FKkk42po9l1i2hkayr1hvyqcbho
    foreign key (runningDinnerId)
    references RunningDinner;


alter table Team
    add constraint FK5qsjat2lot8uiltv3ep1mamy2
    foreign key (runningDinnerId)
    references RunningDinner;


alter table Team
    add constraint FKd9dayfdx5k8i9uh3lavjtha4u
    foreign key (mealClassId)
    references MealClass;

alter table MailSynchronizationState add constraint UK_rg0pluo9rm7u1curd6k8151cy unique (objectId);

GRANT ALL ON ALL TABLES IN SCHEMA ${runningdinner-schema-name} to ${runningdinner-user-name};
    

