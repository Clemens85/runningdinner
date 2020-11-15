create table DeletedRunningDinner (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    city varchar(255),
    date date not null,
    email varchar(255) not null,
    registrationType varchar(32) not null,
    title varchar(255) not null,
    zip varchar(16) not null,
	runningDinnerType varchar(64) not null,
    primary key (id)
);

GRANT ALL ON ALL TABLES IN SCHEMA ${runningdinner-schema-name} to ${runningdinner-user-name};