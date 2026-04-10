package org.runningdinner.admin.message.proposal;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.LogSanitizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class MessageProposalService {

  private static final Logger LOGGER = LoggerFactory.getLogger(MessageProposalService.class);

  static final String MESSAGES_GENERATED_PREFIX = "generated/message";

  private final ProposalRepository proposalRepository;

  private final RunningDinnerService runningDinnerService;

  public MessageProposalService(ProposalRepository proposalRepository, RunningDinnerService runningDinnerService) {
    this.proposalRepository = proposalRepository;
		this.runningDinnerService = runningDinnerService;
	}

  public Optional<MessageProposalTO> findMessageProposal(@ValidateAdminId  String adminId, MessageType messageType) {
    if (!canFetchMessageProposal(adminId)) {
      return Optional.empty();
    }
    String storagePath = MESSAGES_GENERATED_PREFIX + "/" + messageType.name() + "/" + adminId + ".md";
    return proposalRepository.findProposalByStoragePath(storagePath)
        .flatMap(example -> parseProposalContent(example.textContent()));
  }

  private boolean canFetchMessageProposal(String adminId) {
    try {
      RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
      return ProposalExampleService.isRunningDinnerRelevant(runningDinner);
    } catch (Exception e) {
      LOGGER.warn("Failed to fetch running dinner for adminId: {}", LogSanitizer.sanitize(adminId), e);
      return false;
    }
  }

  private Optional<MessageProposalTO> parseProposalContent(String content) {
    try {
      Map<String, String> sections = parseSections(content);

      String subject = removeFromMap(sections, "SUBJECT");
      String messageTemplate = removeFromMap(sections, "MESSAGE TEMPLATE");

      if (subject == null || messageTemplate == null) {
        LOGGER.warn("Proposal content is missing required sections SUBJECT or MESSAGE TEMPLATE");
        return Optional.empty();
      }

      return Optional.of(new MessageProposalTO(subject, messageTemplate, sections));
    } catch (Exception e) {
      LOGGER.warn("Failed to parse proposal content", e);
      return Optional.empty();
    }
  }

  private static Map<String, String> parseSections(String content) {
    Map<String, String> sections = new LinkedHashMap<>();
    String currentSection = null;
    StringBuilder currentContent = new StringBuilder();

    for (String line : content.split("\\R")) {
      if (line.startsWith("## ")) {
        if (currentSection != null) {
          sections.put(currentSection, currentContent.toString().strip());
        }
        currentSection = line.substring(3).strip().toUpperCase();
        currentContent = new StringBuilder();
      } else {
        if (currentSection != null) {
          if (!currentContent.isEmpty()) {
            currentContent.append("\n");
          }
          currentContent.append(line);
        }
      }
    }
    if (currentSection != null) {
      sections.put(currentSection, currentContent.toString().strip());
    }
    return sections;
  }

  private static String removeFromMap(Map<String, String> sections, String key) {
    return sections.remove(key);
  }
}
