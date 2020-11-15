package org.runningdinner.core.converter;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.converter.config.ParsingConfiguration;
import org.runningdinner.core.converter.impl.HssfConverter;
import org.runningdinner.core.converter.impl.XssfConverter;

/**
 * Factory for instantiating concrete implementations for parsing different file-types with participants.
 * 
 * @author Clemens Stich
 * 
 */
public final class ConverterFactory {

	private static final String XLS = "xls";
	private static final String XLSX = "xlsx";
	private static final String XLSM = "xlsm";
	private static final String CSV = "csv"; // Currently not supported

	/**
	 * Low level file type information which is used for instantiating a concrete converter class
	 */
	public enum INPUT_FILE_TYPE {
		HSSF, XSSF, CSV, UNKNOWN
	}
	
	private ConverterFactory() {
	  
	  // NOP
	}

	/**
	 * Instantiates a new concrete converter implementation which is used for parsing a file with participants.<br>
	 * Currently there exist only support for Excel files.
	 * 
	 * @param parsingConfiguration The configuration that is passed to the concrete FileConverter
	 * @param fileType Identifier for instantiating the concrete converter class
	 * @return
	 */
	public static FileConverter newFileConverter(final ParsingConfiguration parsingConfiguration, final INPUT_FILE_TYPE fileType) {
		
		if (INPUT_FILE_TYPE.HSSF == fileType) {
			return new HssfConverter(parsingConfiguration);
		}
		else if (INPUT_FILE_TYPE.XSSF == fileType) {
			return new XssfConverter(parsingConfiguration);
		}

		throw new IllegalArgumentException("Unsupported input file type " + fileType);
	}

	public static RowConverter newRowConverter(final INPUT_FILE_TYPE fileType) {
		
		return newFileConverter(null, fileType);
	}

	/**
	 * Tries to detect the file type based on the passed identifier.<br>
	 * The identifier can either be a file-suffix (like e.g. "xlsx"), a filename or a mime-type like e.g. ("application/vnd.ms-excel").<br>
	 * 
	 * @param identifier
	 * @return The recognized file type or INPUT_FILE_TYPE.UNKNOWN if recognition failed.
	 */
	public static INPUT_FILE_TYPE determineFileType(final String identifier) {

		if (StringUtils.isNotEmpty(identifier) && identifier.contains("/")) {
			if ("application/vnd.ms-excel".equalsIgnoreCase(identifier) || "application/xls".equalsIgnoreCase(identifier)) {
				return INPUT_FILE_TYPE.HSSF;
			}
			else if ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equalsIgnoreCase(identifier)
					|| "application/vnd.openxmlformats-officedocument.spreadsheetml.template".equalsIgnoreCase(identifier)) {
				return INPUT_FILE_TYPE.XSSF;
			}
		}

		if (XLS.equalsIgnoreCase(identifier)) {
			return INPUT_FILE_TYPE.HSSF;
		}
		else if (XLSM.equalsIgnoreCase(identifier) || XLSX.equalsIgnoreCase(identifier)) {
			return INPUT_FILE_TYPE.XSSF;
		}

		int lastIndexOfSuffixSeparator = identifier.lastIndexOf('.');
		if (lastIndexOfSuffixSeparator != -1 && lastIndexOfSuffixSeparator + 1 < identifier.length()) {
			String fileExtension = identifier.substring(lastIndexOfSuffixSeparator + 1);
			return determineFileType(fileExtension);
		}

		return INPUT_FILE_TYPE.UNKNOWN;
	}

}
