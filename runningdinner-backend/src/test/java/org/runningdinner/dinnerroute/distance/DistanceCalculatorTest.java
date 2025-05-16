package org.runningdinner.dinnerroute.distance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.util.List;

import org.junit.jupiter.api.Test;

public class DistanceCalculatorTest {

  private final GeocodedAddressEntity loerracherStr20 = newHost("1",  47.9795719, 7.8176925);
  private final GeocodedAddressEntity johannVonWeerth9 = newHost("2",  47.9853803, 7.838599999999999);
  private final GeocodedAddressEntity schwarzwaldStr193 = newHost("3",    47.9882431, 7.893103099999998);
  private final GeocodedAddressEntity eisenbahnStr45 = newHost("4",   47.9976566, 7.8441844);
  private final GeocodedAddressEntity breikeweg24 = newHost("5",    48.0212035, 7.728134799999999);
  private final GeocodedAddressEntity sundgauAllee31 = newHost("6",    48.0088781, 7.813856299999999);
//  private final GeocodedAddressEntity altstadt = newHost("7",   47.9978377, 7.8529263);
  private final GeocodedAddressEntity eisenbahnStr49 = newHost("8",   47.9975292, 7.843814999999999);
  private final GeocodedAddressEntity jesuitenSchloss1 = newHost("9",    47.9668465, 7.817486199999999);

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
    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(List.of(loerracherStr20, johannVonWeerth9, schwarzwaldStr193, jesuitenSchloss1));
    assertThat(distanceMatrix.getEntries()).hasSize(6);

    Double distance = distanceMatrix.getEntries().get(new DistanceEntry(johannVonWeerth9.getId(), loerracherStr20.getId()));
    assertThat(distance).isBetween(1000d, 3000d);
    assertThat(distanceMatrix.getEntries().get(new DistanceEntry(loerracherStr20.getId(), johannVonWeerth9.getId()))).isEqualTo(distance);

    assertThat(distanceMatrix.getEntries().get(new DistanceEntry(loerracherStr20.getId(), loerracherStr20.getId()))).isNull();

    distance = distanceMatrix.getEntries().get(new DistanceEntry(johannVonWeerth9.getId(), schwarzwaldStr193.getId()));
    assertThat(distance).isBetween(4000d, 5000d);

    distance = distanceMatrix.getEntries().get(new DistanceEntry(loerracherStr20.getId(), schwarzwaldStr193.getId()));
    assertThat(distance).isBetween(5000d, 7000d);
  }

  static GeocodedAddressEntity newHost(String id, double lat, double lng) {
    GeocodedAddressEntity result = new GeocodedAddressEntity();
    result.setId(id);
    result.setIdType(GeocodedAddressEntityIdType.TEAM_NR);
    result.setLat(lat);
    result.setLng(lng);
    return result;
//    Participant participant = ParticipantGenerator.generateParticipant(1);
//    PrivateFieldAccessor.setField(participant, "id", id);
//    participant.setGeocodingResult(newGeocodingResult(lat, lng));
//    return participant;
  }

//  static GeocodingResult newGeocodingResult(double lat, double lng) {
//    GeocodingResult result = new GeocodingResult();
//    result.setLat(lat);
//    result.setLng(lng);
//    return result;
//  }
}
