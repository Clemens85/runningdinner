package org.runningdinner.wizard.upload;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.runningdinner.common.rest.SelectOptionTO;

public class ColumnMappingTO implements Serializable {

	private static final long serialVersionUID = 1L;

	public static final String NONE = "none";

	public static final String SEQUENCE_NR = "sequenceNr";
	public static final String MOBILE = "mobile";
	public static final String EMAIL = "email";
	public static final String CAN_HOST = "canHost";
	public static final String NUMBER_OF_SEATS = "numberOfSeats";
	public static final String COMPLETE_ADDRESS = "completeAddress";
	public static final String CITY = "city";
	public static final String ZIP = "zip";
	public static final String GENDER = "gender";
	public static final String AGE = "age";
	public static final String STREET_NR = "streetNr";
	public static final String STREET = "street";
	public static final String ZIP_WITH_CITY = "zipWithCity";
	public static final String STREET_WITH_NR = "streetWithNr";
	public static final String LASTNAME = "lastname";
	public static final String FIRSTNAME = "firstname";
	public static final String FULLNAME = "fullname";

	private int columnIndex;

	private SelectOptionTO mappingSelection;

	public int getColumnIndex() {
		return columnIndex;
	}

	public void setColumnIndex(int columnIndex) {
		this.columnIndex = columnIndex;
	}

	public SelectOptionTO getMappingSelection() {
		return mappingSelection;
	}

	public void setMappingSelection(SelectOptionTO mappingValue) {
		this.mappingSelection = mappingValue;
	}

	public static List<SelectOptionTO> getAllMappingOptions() {
		// TODO: Read out message bundles
		List<SelectOptionTO> result = new ArrayList<>();
		result.add(new SelectOptionTO(NONE, "Keine Auswahl"));
		result.add(new SelectOptionTO(FULLNAME, "Kompletter Name"));
		result.add(new SelectOptionTO(FIRSTNAME, "Vorname"));
		result.add(new SelectOptionTO(LASTNAME, "Nachname"));
		result.add(new SelectOptionTO(STREET_WITH_NR, "Strasse + Hausnummer"));
		result.add(new SelectOptionTO(ZIP_WITH_CITY, "PLZ + Stadt"));
		result.add(new SelectOptionTO(STREET, "Strasse"));
		result.add(new SelectOptionTO(STREET_NR, "Hausnummer"));
		result.add(new SelectOptionTO(ZIP, "PLZ"));
		result.add(new SelectOptionTO(CITY, "Stadt"));
		result.add(new SelectOptionTO(COMPLETE_ADDRESS, "Komplette Adresse"));
		result.add(new SelectOptionTO(NUMBER_OF_SEATS, "Anzahl Plaetze (Zahl)"));
		result.add(new SelectOptionTO(CAN_HOST, "Genuegend Anzahl Plaetze vorhanden"));
		result.add(new SelectOptionTO(GENDER, "Geschlecht"));
		result.add(new SelectOptionTO(AGE, "Alter"));
		result.add(new SelectOptionTO(EMAIL, "Email"));
		result.add(new SelectOptionTO(MOBILE, "Handy-Nummer"));
		result.add(new SelectOptionTO(SEQUENCE_NR, "Nummerierung (Reihenfolge)"));
		return result;
	}

}
