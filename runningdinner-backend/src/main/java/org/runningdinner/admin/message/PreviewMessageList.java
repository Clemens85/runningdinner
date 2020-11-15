package org.runningdinner.admin.message;

import java.util.ArrayList;
import java.util.List;

public class PreviewMessageList {

	private String subject;

	private List<PreviewMessage> previewMessageList = new ArrayList<>();

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public List<PreviewMessage> getPreviewMessageList() {
		return previewMessageList;
	}

	public void setPreviewMessageList(List<PreviewMessage> previewMessageList) {
		this.previewMessageList = previewMessageList;
	}

	public void addPreviewMessage(PreviewMessage messagePreview) {
		previewMessageList.add(messagePreview);
	}


	public static PreviewMessageList createPreviewMessageList(List<PreviewMessage> previewMessages) {
		PreviewMessageList result = new PreviewMessageList();
		for (PreviewMessage previewMessage : previewMessages) {
			result.addPreviewMessage(previewMessage);
		}
		return result;
	}
	
	@Override
	public String toString() {
		return subject + ": " + previewMessageList.toString();
	}

}
