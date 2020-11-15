package org.runningdinner.wizard.upload;

import java.util.List;

public class FileUploadTO {

	private String fileId;

	private List<FileUploadRowTO> previewRows;

	public String getFileId() {
		return fileId;
	}

	public void setFileId(String fileId) {
		this.fileId = fileId;
	}

	public List<FileUploadRowTO> getPreviewRows() {
		return previewRows;
	}

	public void setPreviewRows(List<FileUploadRowTO> previewRows) {
		this.previewRows = previewRows;
	}

	@Override
	public String toString() {
		return "fileId=" + fileId + ", previewRows=" + previewRows;
	}

}
