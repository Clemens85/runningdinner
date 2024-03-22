package org.runningdinner.masterdata.rest;

import org.runningdinner.common.rest.SelectOptionTO;
import org.runningdinner.masterdata.MasterDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping(value = "/rest/masterdataservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class MasterDataServiceRest {
  
	@Autowired
	private MasterDataService masterDataService;
	
	@GetMapping("/genders")
	public List<SelectOptionTO> findGenders(Locale locale) {

		return masterDataService.findGenders(locale);
	}
	
	@GetMapping("/registrationtypes")
	public List<SelectOptionTO> findRegistrationTypes(Locale locale) {

		return masterDataService.findRegistrationTypes(locale);
	}
	
	@GetMapping("/genderaspects")
	public List<SelectOptionTO> findGenderAspects(Locale locale) {

		return masterDataService.findGenderAspects(locale);
	}
	
}
