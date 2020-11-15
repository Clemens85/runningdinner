package org.runningdinner.admin;

import java.util.UUID;

import org.runningdinner.core.MealClass;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealRepository extends JpaRepository<MealClass, UUID> {

}
