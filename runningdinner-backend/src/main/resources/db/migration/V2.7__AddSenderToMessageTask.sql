ALTER TABLE runningdinner.MessageTask ADD COLUMN sender TEXT;
UPDATE runningdinner.MessageTask SET sender = 'SENDGRID_API';
ALTER TABLE runningdinner.MessageTask ALTER COLUMN sender SET NOT NULL;

CREATE TABLE runningdinner.MessageSenderHistory (
    id UUID PRIMARY KEY,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId UUID not null,
    sender TEXT NOT NULL,
    sendingDate TIMESTAMP WITHOUT TIME ZONE not null,
    amount INTEGER NOT NULL
);
GRANT ALL ON ALL TABLES IN SCHEMA ${runningdinner-schema-name} to ${runningdinner-user-name};