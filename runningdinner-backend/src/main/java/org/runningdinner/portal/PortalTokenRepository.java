package org.runningdinner.portal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PortalTokenRepository extends JpaRepository<PortalToken, UUID> {

  Optional<PortalToken> findByEmail(String email);

  Optional<PortalToken> findByToken(String token);
}
