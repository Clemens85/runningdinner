package org.runningdinner.wizard.upload;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class FileUploadRowTO implements Serializable {

	private static final long serialVersionUID = 1L;

	private int rowNumber;

	private List<String> columns;

	public int getRowNumber() {
		return rowNumber;
	}

	public void setRowNumber(int rowNumber) {
		this.rowNumber = rowNumber;
	}

	public List<String> getColumns() {
		return columns;
	}

	public void setColumns(List<String> columns) {
		this.columns = columns;
	}

	@Override
	public String toString() {
		return "rowNumber=" + rowNumber + ", columns=" + columns;
	}

	public static Collection<FileUploadRowTO> convertFromList(List<List<String>> rows) {
		List<FileUploadRowTO> result = new ArrayList<>();
		int cnt = 1;
		for (List<String> rowItems : rows) {
			result.add(convertFromRow(rowItems, cnt++));
		}
		return result;
	}

	public static FileUploadRowTO convertFromRow(List<String> rowItems, int rowNumber) {
		FileUploadRowTO result = new FileUploadRowTO();
		result.setColumns(rowItems);
		result.setRowNumber(rowNumber);
		return result;
	}
}
