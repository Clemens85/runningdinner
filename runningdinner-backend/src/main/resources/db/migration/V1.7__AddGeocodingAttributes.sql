ALTER TABLE runningdinner.participant ADD COLUMN lat varchar(64);
ALTER TABLE runningdinner.participant ADD COLUMN lng varchar(64);
ALTER TABLE runningdinner.participant ADD COLUMN formattedAddress varchar(512);
ALTER TABLE runningdinner.participant ADD COLUMN resultType varchar(32);

DROP TABLE runningdinner.DbGeocoderResult;