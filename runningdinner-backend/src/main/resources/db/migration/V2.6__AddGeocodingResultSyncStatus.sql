ALTER TABLE runningdinner.participant ADD COLUMN geocodingResultSyncStatus text;
UPDATE runningdinner.participant SET geocodingResultSyncStatus = 'UNSYNCHRONIZED';
UPDATE runningdinner.participant SET geocodingResultSyncStatus = 'SYNCHRONIZED' WHERE lat > -1 AND lng > -1;