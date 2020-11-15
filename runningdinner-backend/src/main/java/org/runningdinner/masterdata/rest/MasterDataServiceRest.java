package org.runningdinner.masterdata.rest;

import java.util.List;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;

import org.runningdinner.common.rest.SelectOptionTO;
import org.runningdinner.masterdata.MasterDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/masterdataservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class MasterDataServiceRest {
  
	@Autowired
	private MasterDataService masterDataService;
	
	@RequestMapping(value = "/genders", method = RequestMethod.GET)
	public List<SelectOptionTO> findGenders(Locale locale) {

		return masterDataService.findGenders(locale);
	}
	
	@RequestMapping(value = "/registrationtypes", method = RequestMethod.GET)
	public List<SelectOptionTO> findRegistrationTypes(Locale locale, HttpServletRequest request) {

		return masterDataService.findRegistrationTypes(locale);
	}
	
	@RequestMapping(value = "/genderaspects", method = RequestMethod.GET)
	public List<SelectOptionTO> findGenderAspects(Locale locale) {

		return masterDataService.findGenderAspects(locale);
	}
	
}
