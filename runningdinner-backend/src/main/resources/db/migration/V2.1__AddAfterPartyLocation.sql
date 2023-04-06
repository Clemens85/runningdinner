ALTER TABLE runningdinner.runningdinner
	
	ADD COLUMN afterPartyLocationAddressName text,
	ADD COLUMN afterPartyLocationCityName text,
	ADD COLUMN afterPartyLocationRemarks text,
	ADD COLUMN afterPartyLocationStreet text,
	ADD COLUMN afterPartyLocationStreetNr text,
	ADD COLUMN afterPartyLocationZip text,

	ADD COLUMN afterPartyLocationLat varchar(64),
	ADD COLUMN afterPartyLocationLng varchar(64),
	ADD COLUMN afterPartyLocationFormattedAddress varchar(512),
	ADD COLUMN afterPartyLocationResultType varchar(32),
	
	ADD COLUMN time TIMESTAMP WITHOUT TIME ZONE;
