package org.runningdinner.dataimport;

import java.util.List;

import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
public class ParticipantJsonExportImportRestController {
	
	private final ParticipantJsonExportImportService participantJsonExportImportService;
	
	public ParticipantJsonExportImportRestController(ParticipantJsonExportImportService participantJsonExportImportService) {
		this.participantJsonExportImportService = participantJsonExportImportService;
	}

	@GetMapping("/rest/export/v1/runningdinner/{adminId}/participants")
	public ParticipantInputDataListTO exportParticipants(@PathVariable String adminId) {
		
		List<ParticipantInputDataTO> result = participantJsonExportImportService.exportAsJsonList(adminId);
		return new ParticipantInputDataListTO(result);
	}
	
	@PostMapping("/rest/import/v1/runningdinner/{adminId}/participants")
	public ParticipantInputDataListTO importParticipants(@PathVariable String adminId, @RequestBody @Valid ParticipantInputDataListTO importList) {
		List<ParticipantInputDataTO> failedImports = participantJsonExportImportService.importFromJsonList(adminId, importList.participants());
		return new ParticipantInputDataListTO(failedImports);
	}
}
