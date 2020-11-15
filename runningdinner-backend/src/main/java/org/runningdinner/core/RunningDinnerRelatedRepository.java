package org.runningdinner.core;

import java.util.List;
import java.util.UUID;

import javax.persistence.EntityNotFoundException;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface RunningDinnerRelatedRepository<T extends RunningDinnerRelatedEntity> extends JpaRepository<T, UUID> {

  Long countByAdminId(String adminId);
  
  List<T> findByAdminId(String adminId);
  
  T findByIdAndAdminId(UUID entityId, String adminId);
  
  void deleteByAdminId(String adminId);
  
  default T findByIdMandatory(UUID id) {
    
    return findById(id).orElseThrow(() -> new EntityNotFoundException("Could not find entity by id " + id));
  }
}
