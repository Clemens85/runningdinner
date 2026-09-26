ALTER TABLE runningdinner.participant ADD COLUMN homeAccessible boolean;
ALTER TABLE runningdinner.participant ADD COLUMN requiresAccessibleHome boolean;

UPDATE runningdinner.participant SET homeAccessible = false;
UPDATE runningdinner.participant SET requiresAccessibleHome = false;

ALTER TABLE runningdinner.participant ALTER COLUMN homeAccessible SET NOT NULL;
ALTER TABLE runningdinner.participant ALTER COLUMN requiresAccessibleHome SET NOT NULL;
