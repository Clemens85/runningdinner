ALTER TABLE runningdinner.MessageTask ADD COLUMN sender TEXT;

UPDATE runningdinner.MessageTask SET sender = 'SENDGRID_API';

ALTER TABLE runningdinner.MessageTask ALTER COLUMN sender SET NOT NULL;