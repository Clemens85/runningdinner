package org.runningdinner.dinnerroute.distance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.util.NumberUtil;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Participant;
import org.runningdinner.test.util.PrivateFieldAccessor;

public class DistanceCalculatorTest {

  private final Participant loerracherStr20 = newHost("1",  47.9795719, 7.8176925);
  private final Participant johannVonWeerth9 = newHost("2",  47.9853803, 7.838599999999999);
  private final Participant schwarzwaldStr193 = newHost("3",    47.9882431, 7.893103099999998);
  private final Participant eisenbahnStr45 = newHost("4",   47.9976566, 7.8441844);
  private final Participant breikeweg24 = newHost("5",    48.0212035, 7.728134799999999);
  private final Participant sundgauAllee31 = newHost("6",    48.0088781, 7.813856299999999);
//  private final GeocodedAddressEntity altstadt = newHost("7",   47.9978377, 7.8529263);
  private final Participant eisenbahnStr49 = newHost("8",   47.9975292, 7.843814999999999);
  private final Participant jesuitenSchloss1 = newHost("9",    47.9668465, 7.817486199999999);

  @Test
  public void calculateDistances() {

    double d1 = DistanceCalculator.calculateDistanceVincentyInMeters(johannVonWeerth9, loerracherStr20);

    double d2 = DistanceCalculator.calculateDistanceVincentyInMeters(breikeweg24, schwarzwaldStr193);

    assertThat(d1).isLessThan(d2);

    double d3 = DistanceCalculator.calculateDistanceVincentyInMeters(johannVonWeerth9, schwarzwaldStr193);

    assertThat(d1).isLessThan(d3);
    assertThat(d3).isLessThan(d2);

    double d4 = DistanceCalculator.calculateDistanceVincentyInMeters(sundgauAllee31, jesuitenSchloss1);
    assertThat(d1).isLessThan(d4);
    assertThat(d3).isLessThan(d4);
    assertThat(d4).isLessThan(d2);
  }

  @Test
  public void calculateDistanceSameCoordinates() {
    double d = DistanceCalculator.calculateDistanceVincentyInMeters(sundgauAllee31, sundgauAllee31);
    assertThat(d).isZero();
  }

  @Test
  public void calculateDistanceNeighbourCoordinates() {
    double d = DistanceCalculator.calculateDistanceVincentyInMeters(eisenbahnStr49, eisenbahnStr45);
    assertThat(d).isCloseTo(30.99, within(0.01));
  }

  @Test
  public void distanceEntryEquality() {

    String srcId = "src";
    String destId = "dest";

    DistanceEntry a = new DistanceEntry(srcId, destId);
    DistanceEntry b = new DistanceEntry(srcId, destId);
    assertThat(a.equals(b)).isTrue();
    assertThat(a.hashCode()).isEqualTo(b.hashCode());

    b = new DistanceEntry(destId, srcId);
    assertThat(a.equals(b)).isTrue();
    assertThat(b.equals(a)).isTrue();

    assertThat(a.hashCode()).isEqualTo(b.hashCode());
  }


  @Test
  public void calculateDistanceMatrix() {
    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(List.of(loerracherStr20, johannVonWeerth9, schwarzwaldStr193, jesuitenSchloss1), true);
    assertThat(distanceMatrix.getEntries()).hasSize(6);

    Double distance = distanceMatrix.getEntries().get(new DistanceEntry(johannVonWeerth9.getId().toString(), loerracherStr20.getId().toString()));
    assertThat(distance).isBetween(1000d, 3000d);
    assertThat(distanceMatrix.getEntries().get(new DistanceEntry(loerracherStr20.getId().toString(), johannVonWeerth9.getId().toString()))).isEqualTo(distance);

    assertThat(distanceMatrix.getEntries().get(new DistanceEntry(loerracherStr20.getId().toString(), loerracherStr20.getId().toString()))).isNull();

    distance = distanceMatrix.getEntries().get(new DistanceEntry(johannVonWeerth9.getId().toString(), schwarzwaldStr193.getId().toString()));
    assertThat(distance).isBetween(4000d, 5000d);

    distance = distanceMatrix.getEntries().get(new DistanceEntry(loerracherStr20.getId().toString(), schwarzwaldStr193.getId().toString()));
    assertThat(distance).isBetween(5000d, 7000d);
  }

  static Participant newHost(String nr, double lat, double lng) {
  	Participant participant = ParticipantGenerator.generateParticipant(NumberUtil.parseIntSafe(nr));
  	PrivateFieldAccessor.setField(participant, "id", UUID.randomUUID());
  	GeocodingResult result = participant.getGeocodingResult();
    result.setLat(lat);
    result.setLng(lng);
    return participant;
  }
}
