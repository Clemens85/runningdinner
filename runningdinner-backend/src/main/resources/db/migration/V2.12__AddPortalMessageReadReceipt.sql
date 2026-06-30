create table ${runningdinner-schema-name}.PortalMessageReadReceipt (
    id               uuid        not null,
    objectId        uuid        not null,
    lockVersion     bigint      not null,
    createdAt       TIMESTAMP WITHOUT TIME ZONE not null,
    modifiedAt      TIMESTAMP WITHOUT TIME ZONE not null,
    participantId   uuid        not null,
    messageTaskId  uuid        not null,
    readAt          TIMESTAMP WITHOUT TIME ZONE not null,
    primary key (id),
    unique (objectId),
    unique (participantId, messageTaskId)
);

GRANT ALL ON ALL TABLES IN SCHEMA ${runningdinner-schema-name} to ${runningdinner-user-name};
