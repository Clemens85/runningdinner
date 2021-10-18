package org.runningdinner.core.converter.impl;

import com.google.common.base.Optional;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
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
 * Entry point for parsing "old" XLS excel files
 * 
 * @author Clemens Stich
 * 
 */
public class HssfConverter extends AbstractExcelConverterHighLevel implements FileConverter {

	public HssfConverter(ParsingConfiguration parsingConfiguration) {
		super(parsingConfiguration);
	}

	@Override
	public List<Participant> parseParticipants(InputStream inputStream) throws IOException, ConversionException {
		HSSFSheet sheet = openSheet(inputStream);
		return parseParticipants(sheet);
	}

	@Override
	public void writeParticipants(List<Participant> participants, OutputStream outputStream) {
		throw new UnsupportedOperationException("currently not implemented");
	}

	@Override
	public List<List<String>> readRows(InputStream inputStream, int maxRows) throws IOException {
		HSSFSheet sheet = openSheet(inputStream);
		return readRows(sheet, maxRows);
	}
	
	@Override
	public Optional<List<String>> readSingleRow(InputStream inputStream, int rowIndex) throws IOException {
		HSSFSheet sheet = openSheet(inputStream);
		return readSingleRow(sheet, rowIndex);
	}

	private HSSFSheet openSheet(InputStream inputStream) throws IOException {
		CoreUtil.assertNotNull(inputStream, "Passed InputStream must not be null!");
		POIFSFileSystem poiFileSystem = new POIFSFileSystem(inputStream);
		HSSFWorkbook workbook = new HSSFWorkbook(poiFileSystem);
		HSSFSheet sheet = workbook.getSheetAt(0);
		return sheet;
	}

}
