ALTER TABLE runningdinner.runningdinner
	
	ADD COLUMN afterPartyLocationAddressName varchar(255),
	ADD COLUMN afterPartyLocationCityName varchar(255),
	ADD COLUMN afterPartyLocationRemarks varchar(255),
	ADD COLUMN afterPartyLocationStreet varchar(255),
	ADD COLUMN afterPartyLocationStreetNr varchar(255),
	ADD COLUMN afterPartyLocationZip varchar(255),

	ADD COLUMN afterPartyLocationLat varchar(64),
	ADD COLUMN afterPartyLocationLng varchar(64),
	ADD COLUMN afterPartyLocationFormattedAddress varchar(512),
	ADD COLUMN afterPartyLocationResultType varchar(32),
	
	ADD COLUMN time TIMESTAMP WITHOUT TIME ZONE;
