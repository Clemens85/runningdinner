package org.runningdinner.core.converter.impl;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFDataFormatter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.Gender;
import org.runningdinner.core.converter.ConversionException;
import org.runningdinner.core.converter.ConversionException.CONVERSION_ERROR;
import org.runningdinner.core.converter.FileConverter;
import org.runningdinner.core.converter.config.AbstractColumnConfig;
import org.runningdinner.core.converter.config.AddressColumnConfig;
import org.runningdinner.core.converter.config.GenderColumnConfig;
import org.runningdinner.core.converter.config.NameColumnConfig;
import org.runningdinner.core.converter.config.NumberOfSeatsColumnConfig;
import org.runningdinner.core.converter.config.ParsingConfiguration;
import org.runningdinner.core.converter.config.SequenceColumnConfig;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Optional;

/**
 * Abstract class for parsing excel files which contains the main logic.<br>
 * This class is independent of XSSF or HSSF excel file types.
 * 
 * @author Clemens Stich
 * 
 */
public class AbstractExcelConverterHighLevel {

	protected ParsingConfiguration parsingConfiguration;

	private static Logger LOGGER = LoggerFactory.getLogger(AbstractExcelConverterHighLevel.class);

	public AbstractExcelConverterHighLevel(ParsingConfiguration parsingConfiguration) {
		this.parsingConfiguration = parsingConfiguration;
	}

	public List<List<String>> readRows(Sheet sheet, int maxRows) {

		List<List<String>> result = new ArrayList<>();

		for (int rowIndex = sheet.getFirstRowNum(); rowIndex < sheet.getLastRowNum(); rowIndex++) {
			Row row = sheet.getRow(rowIndex);

			if (row == null) {
				continue;
			}

			List<String> columns = getColumns(row);
			result.add(columns);

			if (result.size() >= maxRows) {
				break;
			}
		}

		return result;
	}

	private List<String> getColumns(Row row) {
		List<String> columns = new ArrayList<>();
		short firstCellNum = row.getFirstCellNum();
		short lastCellNum = row.getLastCellNum();
		for (int colIndex = firstCellNum; colIndex < lastCellNum; colIndex++) {
			String cellValue = getCellValueAsString(row, colIndex);
			columns.add(cellValue);
		}
		return columns;
	}

	public Optional<List<String>> readSingleRow(final Sheet sheet, int rowIndex) {

		Row row = sheet.getRow(rowIndex);
		if (row == null) {
			return Optional.absent();
		}

		List<String> columns = getColumns(row);
		return Optional.of(columns);
	}

	/**
	 * Parses each excel row and assigns each participant an ascending participant-number.
	 * 
	 * @param sheet
	 * @return
	 * @throws ConversionException
	 */
	public List<Participant> parseParticipants(Sheet sheet) throws ConversionException {

		int firstRowNum = sheet.getFirstRowNum();
		int startRow = firstRowNum + parsingConfiguration.getStartRow(); // We consider only real rows (no whitespace rows)

		Set<Participant> tmpResult = new LinkedHashSet<Participant>();

		int cnt = 1;
		for (int rowIndex = startRow; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
			Row row = sheet.getRow(rowIndex);

			LOGGER.debug("Parsing row number {}", cnt);

			if (row == null) {
				continue;
			}

			int participantNr = cnt++;

			ParticipantName participantName = getName(row);

			participantNr = getSequenceNumberIfAvailable(row, participantNr);

			int numSeats = getNumberOfSeats(row);

			ParticipantAddress address = getAddress(row);

			Gender gender = getGender(row);

			Participant participant = new Participant(participantNr);
			participant.setNumSeats(numSeats);
			participant.setName(participantName);
			participant.setAddress(address);

			participant.setEmail(getColumnString(row, parsingConfiguration.getEmailColumnConfig()));
			participant.setMobileNumber(getColumnString(row, parsingConfiguration.getMobileNumberColumnConfig()));
			participant.setGender(gender);

			if (!tmpResult.add(participant)) {
				handleDuplicateError(participant, row);
			}

			LOGGER.debug("Participant {} has been parsed", participant);
		}

		if (tmpResult.size() > FileConverter.MAX_PARTICIPANTS) {
			// Not quite clever to first parse all particiapants and then throw exception, but actually this should never happen
			throw new ConversionException().setClientErrorInformation(CONVERSION_ERROR.TOO_MUCH_PARTICIPANTS);
		}

		return new ArrayList<Participant>(tmpResult);
	}


	public void writeParticipants(Sheet sheet, List<Participant> participants) {

		createHeaderRow(sheet);

		int rowIndex = 1;
		for (Participant p : participants) {
			Row row = sheet.createRow(rowIndex++);
			int cellIndex = 0;
			LOGGER.debug("Writing row number {}", rowIndex);

			writeNumberToCell(row, cellIndex++, p.getParticipantNumber());
			writeStringToCell(row, cellIndex++, p.getName().getFullnameFirstnameFirst());
			writeStringToCell(row, cellIndex++, p.getEmail());
			writeStringToCell(row, cellIndex++, formatGenderString(p.getGender()));
			writeNumberToCell(row, cellIndex++, p.getAge() <= 0 ? -1 : p.getAge());
			String address = p.getAddress().toString();
			if (StringUtils.isNotEmpty(p.getAddress().getRemarks())) {
				address += " (" + p.getAddress().getRemarks() + ")";
			}
			writeStringToCell(row, cellIndex++, StringUtils.trim(address));
			writeNumberToCell(row, cellIndex++, p.getNumSeats());
			writeStringToCell(row, cellIndex++, p.getMobileNumber());
			writeStringToCell(row, cellIndex++, p.getNotes());
			String mealSpecifics = p.getMealSpecifics().toCommaSeparatedString();
			if (StringUtils.isNotEmpty(p.getMealSpecifics().getNote())) {
				mealSpecifics += " (" + p.getMealSpecifics().getNote() + ")";
			}
			writeStringToCell(row, cellIndex, StringUtils.trim(mealSpecifics));
		}
	}

	private String formatGenderString(Gender gender) {
		String result = "Unbekannt";
		if (gender == Gender.FEMALE) {
			result = "Weiblich";
		} else if (gender == Gender.MALE) {
			result = "Männlich";
		}
		return result;
	}

	private void createHeaderRow(Sheet sheet) {

		Row row = sheet.createRow(0);
		int cellIndex = 0;
		writeStringToCell(row, cellIndex++, "Nr");
		writeStringToCell(row, cellIndex++, "Name");
		writeStringToCell(row, cellIndex++, "Email-Adresse");
		writeStringToCell(row, cellIndex++, "Geschlecht");
		writeStringToCell(row, cellIndex++, "Alter");
		writeStringToCell(row, cellIndex++, "Adresse");
		writeStringToCell(row, cellIndex++, "Anzahl Plätze");
		writeStringToCell(row, cellIndex++, "Handy-Nr");
		writeStringToCell(row, cellIndex++, "Sonstige Anmerkungen");
		writeStringToCell(row, cellIndex, "Essenswünsche");
	}

	private void writeNumberToCell(Row row, int cellIndex, int number) {
		Cell cell = row.createCell(cellIndex);
		if (number >= 0) {
			cell.setCellValue(number);
		} else {
			writeStringToCell(row, cellIndex, StringUtils.EMPTY);
		}
	}

	private void writeStringToCell(Row row, int cellIndex, String s) {
		Cell cell = row.createCell(cellIndex);
		cell.setCellValue(s);
	}


	/**
	 * Reads out the value that is represented by the passed column configuration or returns an empty string if the passed column
	 * configuration shall not be considered.
	 * 
	 * @param row Current row of excel sheet
	 * @param columnConfig
	 * @return
	 */
	private String getColumnString(final Row row, final AbstractColumnConfig columnConfig) {
		if (columnConfig.isAvailable()) {
			return getCellValueAsString(row, columnConfig.getColumnIndex());
		}
		return StringUtils.EMPTY;
	}

	/**
	 * Reads out the participant name as it is configured in the NameColumnConfig
	 * 
	 * @param row Current row of excel sheet
	 * @return
	 * @throws ConversionException
	 */
	private ParticipantName getName(Row row) throws ConversionException {
		try {
			NameColumnConfig nameColumnConfig = parsingConfiguration.getNameColumnConfig();
			int firstnameColumn = nameColumnConfig.getFirstnameColumn();
			int lastnameColumn = nameColumnConfig.getLastnameColumn();

			if (nameColumnConfig.isComposite()) {
				String fullname = getCellValueAsString(row, firstnameColumn);
				return ParticipantName.newName().withCompleteNameString(fullname);
			}
			else {
				String firstname = getCellValueAsString(row, firstnameColumn);
				String lastname = getCellValueAsString(row, lastnameColumn);
				return ParticipantName.newName().withFirstname(firstname).andLastname(lastname);
			}
		}
		catch (IllegalArgumentException ex) {
			throw toConversionException(row, CONVERSION_ERROR.NAME, ex);
		}
	}

	private void handleDuplicateError(final Participant participant, final Row row) throws ConversionException {
		LOGGER.error("Detected duplicate participant {} in row-number {}", participant, row.getRowNum());
		throw new ConversionException().setClientErrorInformation(row.getRowNum(), parsingConfiguration.getStartRow(),
				CONVERSION_ERROR.PARTICIPANT_NR);
	}

	/**
	 * Reads out the participant address as it is configured in the AddressColumnConfig
	 * 
	 * @param row Current row of excel sheet
	 * @return
	 * @throws ConversionException
	 */
	private ParticipantAddress getAddress(Row row) throws ConversionException {
		try {
			AddressColumnConfig addressColumnConfig = parsingConfiguration.getAddressColumnConfig();

			if (addressColumnConfig.isSingleColumnConfig()) {
				String street = getCellValueAsString(row, addressColumnConfig.getStreetColumn());
				String streetNr = getCellValueAsString(row, addressColumnConfig.getStreetNrColumn());
				String zipStr = getCellValueAsString(row, addressColumnConfig.getZipColumn());

				ParticipantAddress result = new ParticipantAddress(street, streetNr, zipStr);

				if (addressColumnConfig.getCityColumn() != AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX) {
					String city = getCellValueAsString(row, addressColumnConfig.getCityColumn());
					result.setCityName(city);
				}

				return result;
			}
			else if (addressColumnConfig.isCompositeConfig()) {
				String compositeAddressStr = getCellValueAsString(row, addressColumnConfig.getStreetColumn());
				return ParticipantAddress.parseFromString(compositeAddressStr);
			}
			else {
				ParticipantAddress result = new ParticipantAddress();

				if (addressColumnConfig.isStreetAndStreetNrCompositeConfig()) {
					String streetWithNumber = getCellValueAsString(row, addressColumnConfig.getStreetColumn());
					result.setStreetAndNr(streetWithNumber);
				}
				if (addressColumnConfig.isZipAndCityCompositeConfig()) {
					String zipWithCity = getCellValueAsString(row, addressColumnConfig.getZipColumn());
					result.setZipAndCity(zipWithCity);
				}
				else {
					String zipStr = getCellValueAsString(row, addressColumnConfig.getZipColumn());
					String city = getCellValueAsString(row, addressColumnConfig.getCityColumn());
					result.setCityName(city);
					result.setZip(zipStr);
				}

				return result;
			}

		}
		catch (IllegalArgumentException ex) {
			throw toConversionException(row, CONVERSION_ERROR.ADDRESS, ex);
		}
	}

	/**
	 * Reads out the participant's number of seats (important for hosting capabilities) as it is configured in the NumberOfSeatsColumnConfig
	 * 
	 * @param row Current row of excel sheet
	 * @return The number of seats for this participant. If this information is not available it is returned a negative number. Furthermore
	 *         if the information about number of seats is represented by a boolen (can host or cannot host) it is returned
	 *         Integer.MAX_VALUE which is certainly sufficient for every scenario
	 * @throws ConversionException
	 */
	private int getNumberOfSeats(final Row row) throws ConversionException {

		try {
			NumberOfSeatsColumnConfig numSeatsColumnConfig = parsingConfiguration.getNumSeatsColumnConfig();
			int numSeatsColumnIndex = numSeatsColumnConfig.getColumnIndex();

			if (numSeatsColumnConfig.isAvailable()) {
				String numSeatsStr = getCellValueAsString(row, numSeatsColumnIndex);

				if (numSeatsColumnConfig.isNumericDeclaration()) {
					return CoreUtil.convertToNumber(numSeatsStr, Participant.UNDEFINED_SEATS);
				}
				else {
					FuzzyBoolean fuzzyBool = CoreUtil.convertToBoolean(numSeatsStr, FuzzyBoolean.UNKNOWN);
					if (FuzzyBoolean.TRUE == fuzzyBool) {
						// Slight "workaround", but nobody can have so many seats, so it is assured that he can be a host
						return Integer.MAX_VALUE;
					}
					else if (FuzzyBoolean.FALSE == fuzzyBool) {
						return 0; // With no seats it is not possible to be a host
					}
					// else: numSeats == UNDEFINED
				}
			}

			return Participant.UNDEFINED_SEATS;
		}
		catch (IllegalArgumentException ex) {
			throw toConversionException(row, CONVERSION_ERROR.NUMBER_OF_SEATS, ex);
		}
	}

	private Gender getGender(final Row row) {
		GenderColumnConfig genderColumnConfig = parsingConfiguration.getGenderColumnConfig();
		String rowValue = getColumnString(row, genderColumnConfig);

		Gender result = Gender.UNDEFINED;
		if (!StringUtils.isEmpty(rowValue)) {
			rowValue = rowValue.trim();
			if (StringUtils.equalsIgnoreCase(rowValue, "m")) {
				result = Gender.MALE;
			}
			else if (StringUtils.equalsIgnoreCase(rowValue, "f") || StringUtils.equalsIgnoreCase(rowValue, "w")) {
				result = Gender.FEMALE;
			}
		}

		return result;
	}

	/**
	 * It is possible to specify a separate sequence number column, which is used for assigning participantNumbers to participants.<br>
	 * If such a sequence-number column is configured this column is used for generating the participant number. Otherwise the passed
	 * pre-generated participant-number will be used
	 * 
	 * @param row Current row of excel sheet
	 * @param participantNr The generated participant number according to the order in excel. This is used as a result if no sequence column
	 *            configuration exists
	 * @return
	 * @throws ConversionException
	 */
	private int getSequenceNumberIfAvailable(final Row row, final int participantNr) {
		int result = participantNr;

		SequenceColumnConfig sequenceColumn = parsingConfiguration.getSequenceColumnConfig();
		if (sequenceColumn.isAvailable()) {
			int sequenceNr = CoreUtil.convertToNumber(getCellValueAsString(row, sequenceColumn.getColumnIndex()), -1);
			if (sequenceNr >= 0) {
				result = sequenceNr;
			}
		}

		return result;
	}

	public ParsingConfiguration getParsingConfiguration() {
		return parsingConfiguration;
	}

	/**
	 * Helper method for dealing with different column types from Excel.<br>
	 * It returns for each column type a string, so that the caller is responsible for handling different datatypes
	 * 
	 * @param row
	 * @param cellNumber
	 * @return
	 */
	protected String getCellValueAsString(final Row row, final int cellNumber) {
		Cell cell = row.getCell(cellNumber);

		String result = null;
		if (cell != null) {
			if (cell.getCellType() == Cell.CELL_TYPE_STRING) {
				result = cell.getRichStringCellValue().getString();
				result = result.trim();
			}
			if (cell.getCellType() == Cell.CELL_TYPE_NUMERIC) {
				if (DateUtil.isCellDateFormatted(cell)) {

					// if (HSSFDateUtil.isCellDateFormatted(cell)) {
					// TODO: XSSF <-> HSSF, but seems to work for both
					HSSFDataFormatter formater = new HSSFDataFormatter();
					result = formater.formatCellValue(cell);
				}
				else {
					Double doub = new Double(cell.getNumericCellValue());
					result = String.valueOf(doub.longValue());
				}
			}
			if (cell.getCellType() == Cell.CELL_TYPE_BOOLEAN) {
				if (cell.getBooleanCellValue()) {
					result = "true";
				}
				else {
					result = "false";
				}
			}
		}
		return result;
	}

	private ConversionException toConversionException(Row row, CONVERSION_ERROR conversionError, IllegalArgumentException ex) {

		int startRowNumber = parsingConfiguration.getStartRow();
		int absoluteRowNumber = row.getRowNum();

		LOGGER.error("Conversion error ({}) while trying to parse row number {}", conversionError, (absoluteRowNumber + 1));

		return new ConversionException(ex).setClientErrorInformation(absoluteRowNumber, startRowNumber, conversionError);
	}
}
