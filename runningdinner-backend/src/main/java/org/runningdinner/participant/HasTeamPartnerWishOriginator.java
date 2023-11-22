package org.runningdinner.participant;

import org.runningdinner.core.Identifiable;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

public interface HasTeamPartnerWishOriginator extends Identifiable  {

  UUID getTeamPartnerWishOriginatorId();

  default boolean isTeamPartnerWishProvided() {
    return getTeamPartnerWishOriginatorId() != null;
  }

  default boolean isTeamPartnerWishRegistratonRoot() {
    return getTeamPartnerWishOriginatorId() != null && getId() != null && Objects.equals(getTeamPartnerWishOriginatorId(), getId());
  }

  default boolean isTeamPartnerWishRegistrationChildOf(HasTeamPartnerWishOriginator other) {
    return Objects.equals(other.getTeamPartnerWishOriginatorId(), this.getId()) ||
           Objects.equals(this.getTeamPartnerWishOriginatorId(), other.getId());
  }

  static<T extends HasTeamPartnerWishOriginator> List<T> filterChildPartners(List<T> list) {
    return list
            .stream()
            .filter(r -> r.isTeamPartnerWishProvided() && !r.isTeamPartnerWishRegistratonRoot())
            .collect(Collectors.toList());
  }
  static<T extends HasTeamPartnerWishOriginator> List<T> filterRootPartners(List<T> list) {
    return list
            .stream()
            .filter(r -> r.isTeamPartnerWishRegistratonRoot())
            .collect(Collectors.toList());
  }

}
