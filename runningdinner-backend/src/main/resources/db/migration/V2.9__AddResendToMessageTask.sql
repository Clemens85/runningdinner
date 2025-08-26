ALTER TABLE runningdinner.MessageTask ADD COLUMN originalSender TEXT;

ALTER TABLE runningdinner.MessageTask ADD COLUMN resendCount integer;
UPDATE runningdinner.MessageTask SET resendCount = 0;
ALTER TABLE runningdinner.MessageTask ALTER COLUMN resendCount SET NOT NULL;