package org.runningdinner.core;


import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

public final class ZipRestrictionCalculator {

	public static class ZipRestrictionsCalculationResult {
		private final List<String> zipRestrictions;
		private final List<String> invalidZips;

		public ZipRestrictionsCalculationResult() {
			this.zipRestrictions = new ArrayList<>();
			this.invalidZips = new ArrayList<>();
		}

		public ZipRestrictionsCalculationResult(List<String> zipRestrictions, List<String> invalidZips) {
			this.zipRestrictions = new ArrayList<>(zipRestrictions);
			this.invalidZips = new ArrayList<>(invalidZips);
		}

		public List<String> getZipRestrictions() {
			return zipRestrictions;
		}

		public List<String> getInvalidZips() {
			return invalidZips;
		}
	}


	private ZipRestrictionCalculator() {
		// NOP
	}


	public static ZipRestrictionsCalculationResult calculateResultingZipRestrictions(String zipRestrictionsStr) {

		if (StringUtils.isEmpty(zipRestrictionsStr)) {
			return new ZipRestrictionsCalculationResult();
		}

		List<String> zipRestrictions = new ArrayList<>();
		List<String> invalidZips = new ArrayList<>();

		String[] zipEntries = zipRestrictionsStr.split(",");
		for (String zipEntry : zipEntries) {
			String singleZipEntry = zipEntry.trim();
			if (StringUtils.isEmpty(singleZipEntry)) {
				continue;
			}
			if (singleZipEntry.contains("-")) {
				String[] zips = singleZipEntry.split("-");
				if (zips.length != 2) {
					invalidZips.add(singleZipEntry);
					continue;
				}
				String startZip = zips[0].trim();
				String endZip = zips[1].trim();
				if (StringUtils.isEmpty(startZip) || StringUtils.isEmpty(endZip)) {
					invalidZips.add(singleZipEntry);
					continue;
				}
				List<String> expandedZips = expandZipRange(startZip, endZip);
				if (expandedZips.isEmpty()) {
					invalidZips.add(singleZipEntry);
				} else {
					zipRestrictions.addAll(expandedZips);
				}
			} else {
				zipRestrictions.add(singleZipEntry);
			}
		}

		// Filter out duplicates
		zipRestrictions = new ArrayList<>(new HashSet<>(zipRestrictions));
		zipRestrictions.sort(String::compareTo);

		return new ZipRestrictionsCalculationResult(zipRestrictions, invalidZips);
	}

	public static boolean isZipCodeAllowed(String incomingZipCode, List<String> zipRestrictions) {

		if (CollectionUtils.isEmpty(zipRestrictions) || StringUtils.isEmpty(incomingZipCode)) {
			return true;
		}

		String zipCode = StringUtils.lowerCase(incomingZipCode);
		zipCode = StringUtils.trim(zipCode);

		for (String restriction : zipRestrictions) {
			if (restriction.equals(zipCode)) {
				return true;
			}
		}
		return false;
	}

	private static List<String> expandZipRange(String startZipStr, String endZipStr) {
		List<String> expandedZips = new ArrayList<>();

		Integer startZip = parseIntSafe(startZipStr);
		Integer endZip = parseIntSafe(endZipStr);
		if (startZip == null || endZip == null) {
			return expandedZips;
		}

		for (int i = startZip; i <= endZip; i++) {
			expandedZips.add(String.valueOf(i));
		}

		return expandedZips;
	}

	private static Integer parseIntSafe(String input) {
		if (StringUtils.isEmpty(input)) {
			return null;
		}
		try {
			return Integer.parseInt(input);
		} catch (NumberFormatException e) {
			return null;
		}
	}


}
