package org.runningdinner.geocoder.http;

import org.runningdinner.core.BaseAddress;
import org.runningdinner.geocoder.GeocodeEntityType;
import org.runningdinner.geocoder.base.GeocodeRequestBaseBody;

public class HttpGeocodeRequestLine extends GeocodeRequestBaseBody {
	
	private String entityId;
	
	private GeocodeEntityType entityType;

	public HttpGeocodeRequestLine() {

	}

	public HttpGeocodeRequestLine(BaseAddress baseAddress, String entityId, GeocodeEntityType entityType) {
		super(baseAddress);
		this.entityId = entityId;
		this.entityType = entityType;
	}

	public HttpGeocodeRequestLine(String street, String streetNr, String cityName, String zip, String entityId, GeocodeEntityType entityType) {
		super(street, streetNr, cityName, zip);
		this.entityId = entityId;
		this.entityType = entityType;
	}

	public String getEntityId() {
		return entityId;
	}

	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}

	public GeocodeEntityType getEntityType() {
		return entityType;
	}

	public void setEntityType(GeocodeEntityType entityType) {
		this.entityType = entityType;
	}
	

}
