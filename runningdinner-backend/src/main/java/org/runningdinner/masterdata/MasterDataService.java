
package org.runningdinner.masterdata;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.runningdinner.common.rest.SelectOptionTO;
import org.runningdinner.core.Gender;
import org.runningdinner.core.GenderAspect;
import org.runningdinner.core.RegistrationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

@Service
public class MasterDataService {

  @Autowired
  private MessageSource messages;

  public List<SelectOptionTO> findGenders(Locale locale) {

    List<SelectOptionTO> result = new ArrayList<SelectOptionTO>(3);
    result.add(SelectOptionTO.newGenderOption(Gender.UNDEFINED, messages.getMessage("gender.unknown", null, locale)));
    result.add(SelectOptionTO.newGenderOption(Gender.MALE, messages.getMessage("gender.male", null, locale)));
    result.add(SelectOptionTO.newGenderOption(Gender.FEMALE, messages.getMessage("gender.female", null, locale)));
    return result;
  }

  public List<SelectOptionTO> findRegistrationTypes(Locale locale) {

    List<SelectOptionTO> result = new ArrayList<SelectOptionTO>(3);
    result.add(newSelectOption(RegistrationType.PUBLIC, locale));
    result.add(newSelectOption(RegistrationType.OPEN, locale));
    result.add(newSelectOption(RegistrationType.CLOSED, locale));
    return result;
  }

  public List<SelectOptionTO> findGenderAspects(Locale locale) {

    List<SelectOptionTO> result = new ArrayList<SelectOptionTO>(3);
    result.add(SelectOptionTO.newGenderAspectOption(GenderAspect.IGNORE_GENDER, messages.getMessage("select.gender.random", null, locale)));
    result.add(SelectOptionTO.newGenderAspectOption(GenderAspect.FORCE_GENDER_MIX, messages.getMessage("select.gender.mix", null, locale)));
    result.add(SelectOptionTO.newGenderAspectOption(GenderAspect.FORCE_SAME_GENDER, messages.getMessage("select.gender.same", null, locale)));
    return result;
  }
  
  private SelectOptionTO newSelectOption(RegistrationType registrationType, Locale locale) {

    String label = messages.getMessage("label.registrationtype." + registrationType.name().toLowerCase(), null, locale);
    String description = messages.getMessage("description.registrationtype." + registrationType.name().toLowerCase(), null, locale);
    return SelectOptionTO.newRegistrationTypeOption(registrationType, label, description);
  }

}
