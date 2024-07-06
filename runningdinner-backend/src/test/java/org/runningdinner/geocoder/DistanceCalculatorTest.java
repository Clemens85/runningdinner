package org.runningdinner.geocoder;

import org.junit.jupiter.api.Test;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.geocoder.distance.DistanceCalculator;
import org.runningdinner.geocoder.distance.DistanceEntry;
import org.runningdinner.geocoder.distance.DistanceMatrix;
import org.runningdinner.participant.Participant;
import org.runningdinner.test.util.PrivateFieldAccessor;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

public class DistanceCalculatorTest {

  private final Participant loerracherStr20 = newHost(UUID.randomUUID(),  47.9795719, 7.8176925);
  private final Participant johannVonWeerth9 = newHost(UUID.randomUUID(),  47.9853803, 7.838599999999999);
  private final Participant schwarzwaldStr193 = newHost(UUID.randomUUID(),  47.9882431, 7.893103099999998);
  private final Participant eisenbahnStr45 = newHost(UUID.randomUUID(),  47.9976566, 7.8441844);
  private final Participant breikeweg24 = newHost(UUID.randomUUID(),  48.0212035, 7.728134799999999);
  private final Participant sundgauAllee31 = newHost(UUID.randomUUID(),  48.0088781, 7.813856299999999);
  private final Participant altstadt = newHost(UUID.randomUUID(),  47.9978377, 7.8529263);
  private final Participant eisenbahnStr49 = newHost(UUID.randomUUID(),  47.9975292, 7.843814999999999);
  private final Participant jesuitenSchloss1 = newHost(UUID.randomUUID(),  47.9668465, 7.817486199999999);

  @Test
  public void calculateDistances() {

    double d1 = DistanceCalculator.calculateDistanceVincenty(johannVonWeerth9, loerracherStr20);

    double d2 = DistanceCalculator.calculateDistanceVincenty(breikeweg24, schwarzwaldStr193);

    assertThat(d1).isLessThan(d2);

    double d3 = DistanceCalculator.calculateDistanceVincenty(johannVonWeerth9, schwarzwaldStr193);

    assertThat(d1).isLessThan(d3);
    assertThat(d3).isLessThan(d2);

    double d4 = DistanceCalculator.calculateDistanceVincenty(sundgauAllee31, jesuitenSchloss1);
    assertThat(d1).isLessThan(d4);
    assertThat(d3).isLessThan(d4);
    assertThat(d4).isLessThan(d2);
  }

  @Test
  public void calculateDistanceSameCoordinates() {
    double d = DistanceCalculator.calculateDistanceVincenty(sundgauAllee31, sundgauAllee31);
    assertThat(d).isZero();
  }

  @Test
  public void calculateDistanceNeighbourCoordinates() {
    double d = DistanceCalculator.calculateDistanceVincenty(eisenbahnStr49, eisenbahnStr45);
    assertThat(d).isCloseTo(0.0, within(0.037));
  }


  @Test
  public void calculateDistanceMatrix() {
    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(List.of(loerracherStr20, johannVonWeerth9, schwarzwaldStr193, jesuitenSchloss1));
    assertThat(distanceMatrix.getEntries()).hasSize(16);

    Double distance = distanceMatrix.getEntries().get(new DistanceEntry(johannVonWeerth9.getId(), loerracherStr20.getId()));
    assertThat(distance).isBetween(1d, 3d);
    assertThat(distanceMatrix.getEntries().get(new DistanceEntry(loerracherStr20.getId(), johannVonWeerth9.getId()))).isEqualTo(distance);

    assertThat(distanceMatrix.getEntries().get(new DistanceEntry(loerracherStr20.getId(), loerracherStr20.getId()))).isZero();

    distance = distanceMatrix.getEntries().get(new DistanceEntry(johannVonWeerth9.getId(), schwarzwaldStr193.getId()));
    assertThat(distance).isBetween(4d, 5d);

    distance = distanceMatrix.getEntries().get(new DistanceEntry(loerracherStr20.getId(), schwarzwaldStr193.getId()));
    assertThat(distance).isBetween(5d, 7d);
  }

  static Participant newHost(UUID id, double lat, double lng) {
    Participant participant = ParticipantGenerator.generateParticipant(1);
    PrivateFieldAccessor.setField(participant, "id", id);
    participant.setGeocodingResult(newGeocodingResult(lat, lng));
    return participant;
  }

  static GeocodingResult newGeocodingResult(double lat, double lng) {
    GeocodingResult result = new GeocodingResult();
    result.setLat(lat);
    result.setLng(lng);
    return result;
  }
}
