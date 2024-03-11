package org.runningdinner.dataimport;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.Gender;
import org.runningdinner.participant.ParticipantName;
import org.runningdinner.participant.rest.ParticipantTO;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

public final class ParticipantFromCsvImporter {

  private static final String SEPARATOR = ";";
  
  private final String adminId;
  private int currentParticipantNr;
  private final String applicationUrl;

  private final RestTemplate restTemplate = new RestTemplate();
  
  public ParticipantFromCsvImporter(String applicationUrl, String adminId, int participantNrOffset) {
    this.applicationUrl = applicationUrl;
    this.adminId = adminId;
    this.currentParticipantNr = participantNrOffset;
  }

  public static ParticipantFromCsvImporter newInstance(String applicationUrl, String adminId, int participantNrOffset) {
    return new ParticipantFromCsvImporter(applicationUrl, adminId, participantNrOffset);
  }
  
  public void addRandomParticipantsToDinnerFromCsv(String filePath) {
    
    List<String> csvLines = readLines(filePath, 1);
    System.out.println("Parsed " + csvLines.size() + " csv lines for being imported");
    
//    csvLines = csvLines.subList(currentParticipantNr, csvLines.size());
    
    for (String csvLine : csvLines) {
      int participantNr = this.currentParticipantNr + 1;
      ParticipantTO p = parseParticipant(csvLine, participantNr);
      System.out.println("Trying to import " + p);
      addParticipantToDinner(p);
      sleep(250);
      this.currentParticipantNr++;
    }
  }

  private void sleep(long millis) {
    try {
      Thread.sleep(millis);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  private ParticipantTO addParticipantToDinner(ParticipantTO p) {
    
    String endpoint = getCreateParticipantEndpoint();
    ResponseEntity<ParticipantTO> response = restTemplate.postForEntity(endpoint, p, ParticipantTO.class, Collections.emptyMap());
    return response.getBody();
  }
  
  private String getCreateParticipantEndpoint() {
    return applicationUrl + "/rest/participantservice/v1/runningdinner/" + adminId + "/participant";
  }

  private ParticipantTO parseParticipant(String csvLine, int participantNr) {

    String[] items = StringUtils.split(csvLine, SEPARATOR);
    Assert.isTrue(items.length >= 4, csvLine + " should contain 5 items, but contained " + items.length);
    
    String numSeatsStr = items[0];
    String street = items[1];
    String streetNr = items[2];
    String zip = items[3];
    String cityName = "Mainz";
    if (items.length > 4) {
     cityName = items[4];
    }

    int numSeats;
    try {
      numSeats = Integer.parseInt(numSeatsStr);
    } catch (NumberFormatException e) {
      throw new RuntimeException("Could not parse " + numSeatsStr + " in csvline " + csvLine, e);
    }
    
    ParticipantName participantName = newParticipantName(participantNr);
    
    ParticipantTO result = new ParticipantTO();
    result.setAge(-1);
    result.setCityName(cityName);
    result.setEmail(participantName.getFirstnamePart() + "@" + participantName.getLastname() + ".de");
    result.setFirstnamePart(participantName.getFirstnamePart());
    result.setLastname(participantName.getLastname());
    result.setGender(Gender.UNDEFINED);
    result.setNumSeats(numSeats);
    result.setStreet(street);
    result.setStreetNr(streetNr);
    result.setZip(zip);
    return result;
  }
  
  private static ParticipantName newParticipantName(int participantNr) {
    return ParticipantName.newName().withFirstname("Max" + participantNr).andLastname("Mustermann" + participantNr);
  }

  private static List<String> readLines(String filePath, int startWithLineIndex) {
    
    try {
      List<String> lines = FileUtils.readLines(new File(filePath), StandardCharsets.UTF_8);
      if (startWithLineIndex > 0 && lines.size() >= startWithLineIndex) {
        return lines.subList(startWithLineIndex, lines.size());
      }
      return lines;
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
  
//  public static void main(String[] args) {
//    ParticipantFromCsvImporter.newInstance("https://dev.runyourdinner.eu", "__ADMINID__", __OFFSET__)
//      .addRandomParticipantsToDinnerFromCsv("/home/stichc/Projects/runningdinner/__FILE__");
//  }
}
