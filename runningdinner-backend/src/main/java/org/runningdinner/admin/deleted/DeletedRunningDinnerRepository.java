package org.runningdinner.admin.deleted;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DeletedRunningDinnerRepository extends JpaRepository<DeletedRunningDinner, UUID> {

}
