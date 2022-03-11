package org.runningdinner.core.converter.impl;

import com.google.common.base.Optional;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.runningdinner.core.converter.ConversionException;
import org.runningdinner.core.converter.FileConverter;
import org.runningdinner.core.converter.config.ParsingConfiguration;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Participant;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

/**
 * Entry point for parsing "new" XLSX excel files.<br>
 * 
 * TODO: XLSX parsing takes huge amount of memory when using the highlevel XSSF API.<br>
 * If this is an issue, it has to be changed to low-level event-driven parsing
 * 
 * @author Clemens Stich
 * 
 */
public class XssfConverter extends AbstractExcelConverterHighLevel implements FileConverter {

	public XssfConverter(ParsingConfiguration parsingConfiguration) {
		super(parsingConfiguration);
	}

	@Override
	public List<Participant> parseParticipants(final InputStream inputStream) throws IOException, ConversionException {
		XSSFSheet sheet = openSheet(inputStream);
		return parseParticipants(sheet);
	}

	@Override
	public void writeParticipants(List<Participant> participants, OutputStream outputStream) throws IOException {
		XSSFSheet sheet = createNewSheet();
		writeParticipants(sheet, participants);
		XSSFWorkbook workbook = sheet.getWorkbook();
		workbook.write(outputStream);
	}

	@Override
	public List<List<String>> readRows(InputStream inputStream, int maxRows) throws IOException {
		XSSFSheet sheet = openSheet(inputStream);
		return readRows(sheet, maxRows);
	}
	
	@Override
	public Optional<List<String>> readSingleRow(InputStream inputStream, int rowIndex) throws IOException {
		XSSFSheet sheet = openSheet(inputStream);
		return readSingleRow(sheet, rowIndex);
	}

	private XSSFSheet openSheet(InputStream inputStream) throws IOException {
		CoreUtil.assertNotNull(inputStream, "Passed InputStream must not be null!");
		XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
		XSSFSheet sheet = workbook.getSheetAt(0);
		return sheet;
	}

	private XSSFSheet createNewSheet() {
		XSSFWorkbook workbook = new XSSFWorkbook();
		XSSFSheet sheet = workbook.createSheet("Teilnehmer"); // TODO: i18n
		return sheet;
	}

}
