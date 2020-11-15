package org.runningdinner.core.converter;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import com.google.common.base.Optional;

public interface RowConverter {

	List<List<String>> readRows(final InputStream inputStream, int maxRows) throws IOException;
	
	Optional<List<String>> readSingleRow(final InputStream inputStream, int rowIndex) throws IOException;
}
