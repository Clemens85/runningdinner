ALTER TABLE runningdinner.Feedback
    ADD COLUMN threadId uuid,
    ADD COLUMN resolved text;

alter table runningdinner.Feedback add constraint FeedbackThreadIdUnique unique (threadId);

create table runningdinner.FeedbackConversation (
    id uuid not null,
    createdAt TIMESTAMP WITHOUT TIME ZONE not null,
    lockVersion int8 not null,
    modifiedAt TIMESTAMP WITHOUT TIME ZONE not null,
    objectId uuid not null,
    message text,
	role text,
	threadId uuid not null,
    primary key (id)
);
alter table runningdinner.FeedbackConversation add constraint FeedbackConversationObjectIdUnique unique (objectId);

GRANT ALL ON ALL TABLES IN SCHEMA ${runningdinner-schema-name} to ${runningdinner-user-name};
