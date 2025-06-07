/*
 * Run this in DB before updating the columns...
 * SELECT * FROM runningdinner.participant WHERE lat !~ '^-?\d+(\.\d+)?$' OR lng !~ '^-?\d+(\.\d+)?$';
 * SELECT * FROM runningdinner.runningdinner WHERE lat !~ '^-?\d+(\.\d+)?$' OR lng !~ '^-?\d+(\.\d+)?$';
 */

ALTER TABLE runningdinner.participant
  ALTER COLUMN lat TYPE double precision USING lat::double precision,
  ALTER COLUMN lng TYPE double precision USING lng::double precision;

ALTER TABLE runningdinner.runningdinner
  ALTER COLUMN afterPartyLocationLat TYPE double precision USING afterPartyLocationLat::double precision,
  ALTER COLUMN afterPartyLocationLng TYPE double precision USING afterPartyLocationLng::double precision;

ALTER TABLE runningdinner.participant ADD COLUMN geocodingResultSyncStatus text;
UPDATE runningdinner.participant SET geocodingResultSyncStatus = 'UNSYNCHRONIZED';
UPDATE runningdinner.participant SET geocodingResultSyncStatus = 'SYNCHRONIZED' WHERE lat > -1 AND lng > -1;

ALTER TABLE runningdinner.runningdinner ADD COLUMN afterPartyLocationSyncStatus text;
UPDATE runningdinner.runningdinner SET afterPartyLocationSyncStatus = 'UNSYNCHRONIZED';
UPDATE runningdinner.runningdinner SET afterPartyLocationSyncStatus = 'SYNCHRONIZED' WHERE afterPartyLocationLat > -1 AND afterPartyLocationLng > -1;