create table ${runningdinner-schema-name}.PortalToken (
    id                          uuid         not null,
    createdAt                   TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion                 int8         not null,
    modifiedAt                  TIMESTAMP WITHOUT TIME ZONE not null,
    objectId                    uuid         not null,
    email                       text         not null,
    token                       text         not null,
    primary key (id)
);

alter table ${runningdinner-schema-name}.PortalToken add constraint portal_token_objectId_unique unique (objectId);
alter table ${runningdinner-schema-name}.PortalToken add constraint portal_token_email_unique unique (email);
alter table ${runningdinner-schema-name}.PortalToken add constraint portal_token_token_unique unique (token);

create table ${runningdinner-schema-name}.PortalMessageReadReceipt (
    id            uuid   not null,
    objectId      uuid   not null,
    lockVersion   bigint not null,
    createdAt     TIMESTAMP WITHOUT TIME ZONE not null,
    modifiedAt    TIMESTAMP WITHOUT TIME ZONE not null,
    participantId uuid   not null,
    messageTaskId uuid   not null,
    readAt        TIMESTAMP WITHOUT TIME ZONE not null,
    primary key (id),
    unique (objectId),
    unique (participantId, messageTaskId)
);

GRANT ALL ON ALL TABLES IN SCHEMA ${runningdinner-schema-name} to ${runningdinner-user-name};
