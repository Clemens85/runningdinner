package org.runningdinner.geocoder;

import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.SafeHtml;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Embeddable
public class GeocodingResult {

	private double lat = -1;

	private double lng = -1;

	@Enumerated(EnumType.STRING)
	private GeocodingResultType resultType;

	@Length(max = 512)
	@SafeHtml
	private String formattedAddress;

	public GeocodingResult() {
		// Default ctor
	}

	/**
	 * Copy ctor
	 * @param src
	 */
	public GeocodingResult(GeocodingResult src) {
		this.lat = src.lat;
		this.lng = src.lng;
		this.formattedAddress = src.formattedAddress;
		this.resultType = src.resultType;
	}

	public double getLat() {
		return lat;
	}

	public void setLat(double lat) {
		this.lat = lat;
	}

	public double getLng() {
		return lng;
	}

	public void setLng(double lng) {
		this.lng = lng;
	}

	public GeocodingResultType getResultType() {

		return resultType;
	}

	public void setResultType(GeocodingResultType resultType) {

		this.resultType = resultType;
	}

	public String getFormattedAddress() {
		return formattedAddress;
	}

	public void setFormattedAddress(String formattedAddress) {
		this.formattedAddress = formattedAddress;
	}

	@Override
	public String toString() {
		return "(" + lat + ", " + lng + ", " + resultType + ")";
	}

	public enum GeocodingResultType {
		EXACT,
		NOT_EXACT,
		NONE
	}
}
