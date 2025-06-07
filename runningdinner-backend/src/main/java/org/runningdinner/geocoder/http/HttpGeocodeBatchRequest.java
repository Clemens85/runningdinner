package org.runningdinner.geocoder.http;

import java.util.ArrayList;
import java.util.List;

public class HttpGeocodeBatchRequest {

	private String adminId;
	
	private List<HttpGeocodeRequestLine> requests = new ArrayList<>();

	public HttpGeocodeBatchRequest(String adminId, List<HttpGeocodeRequestLine> requests) {
		this.adminId = adminId;
		this.requests = requests;
	}

	public String getAdminId() {
		return adminId;
	}

	public List<HttpGeocodeRequestLine> getRequests() {
		return requests;
	}
	
	
}
