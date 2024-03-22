package org.runningdinner.core.converter;

import com.google.common.collect.Collections2;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.runningdinner.core.*;
import org.runningdinner.core.converter.ConversionException.CONVERSION_ERROR;
import org.runningdinner.core.converter.ConverterFactory.INPUT_FILE_TYPE;
import org.runningdinner.core.converter.config.EmailColumnConfig;
import org.runningdinner.core.converter.config.GenderColumnConfig;
import org.runningdinner.core.converter.config.MobileNumberColumnConfig;
import org.runningdinner.core.converter.config.ParsingConfiguration;
import org.runningdinner.core.test.helper.GenderPredicate;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;
import org.runningdinner.participant.Team;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class ConverterTest {

	public static final String STANDARD_XLS_FILE = "/excelimport/standard.xls";
	public static final String EMPTY_XLS_FILE = "/excelimport/empty.xls";
	public static final String INVALID_XLSX_FILE = "/excelimport/invalid.xlsx";

	public static final String STANDARD_GENDER_XLS_FILE = "/excelimport/standard_gender.xls";

	private InputStream inputStream;

	@Test
	public void testFileTypeRecognition() throws IOException, ConversionException {
		INPUT_FILE_TYPE fileType = ConverterFactory.determineFileType(STANDARD_XLS_FILE);
		assertEquals(INPUT_FILE_TYPE.HSSF, fileType);

		fileType = ConverterFactory.determineFileType("foo");
		assertEquals(INPUT_FILE_TYPE.UNKNOWN, fileType);

		fileType = ConverterFactory.determineFileType(".xlsx");
		assertEquals(INPUT_FILE_TYPE.XSSF, fileType);
	}

	@Test
	public void testConfigurations() {
		ParsingConfiguration parsingConfiguration = ParsingConfiguration.newDefaultConfiguration();

    assertFalse(parsingConfiguration.getSequenceColumnConfig().isAvailable());

    assertTrue(parsingConfiguration.getNameColumnConfig().isAvailable());
    assertTrue(parsingConfiguration.getNameColumnConfig().isComposite());
		assertEquals(0, parsingConfiguration.getNameColumnConfig().getFirstnameColumn());
		assertEquals(0, parsingConfiguration.getNameColumnConfig().getLastnameColumn());

    assertTrue(parsingConfiguration.getNumSeatsColumnConfig().isAvailable());
    assertTrue(parsingConfiguration.getNumSeatsColumnConfig().isNumericDeclaration());
		assertEquals(3, parsingConfiguration.getNumSeatsColumnConfig().getColumnIndex());

    assertTrue(parsingConfiguration.getAddressColumnConfig().isStreetAndStreetNrCompositeConfig());
    assertTrue(parsingConfiguration.getAddressColumnConfig().isZipAndCityCompositeConfig());
    assertFalse(parsingConfiguration.getAddressColumnConfig().isCompositeConfig());
    assertFalse(parsingConfiguration.getAddressColumnConfig().isSingleColumnConfig());
		assertEquals(1, parsingConfiguration.getAddressColumnConfig().getStreetColumn());
		assertEquals(1, parsingConfiguration.getAddressColumnConfig().getStreetNrColumn());
		assertEquals(2, parsingConfiguration.getAddressColumnConfig().getZipColumn());
		assertEquals(2, parsingConfiguration.getAddressColumnConfig().getCityColumn());
	}

	@Test
	public void testNameParsing() {
		ParticipantName participantName = ParticipantName.newName().withFirstname("Clemens").andLastname("Stich");
		assertEquals("Clemens", participantName.getFirstnamePart());
		assertEquals("Stich", participantName.getLastname());
		assertEquals("Clemens Stich", participantName.getFullnameFirstnameFirst());

		participantName = ParticipantName.newName().withCompleteNameString("Clemens Stich");
		assertEquals("Clemens", participantName.getFirstnamePart());
		assertEquals("Stich", participantName.getLastname());

		participantName = ParticipantName.newName().withCompleteNameString("Firstname Middlename Lastname");
		assertEquals("Firstname Middlename", participantName.getFirstnamePart());
		assertEquals("Lastname", participantName.getLastname());

		try {
			participantName = ParticipantName.newName().withCompleteNameString("Invalid");
			fail("Expected IllegalARgumentException to be thrown!");
		}
		catch (IllegalArgumentException e) {
			assertTrue(true);
		}
	}

	@Test
	public void testAddressParsing() {
		String addressStr = "Musterstrasse 1\r\n12345 Musterstadt";
		ParticipantAddress address = ParticipantAddress.parseFromString(addressStr);
		assertEquals("Musterstadt", address.getCityName());
		assertEquals("12345", address.getZip());
		assertEquals("Musterstrasse", address.getStreet());

		address = new ParticipantAddress();
		address.setStreetAndNr("Musterstraße 8a");
		assertEquals("Musterstraße", address.getStreet());
		assertEquals("8a", address.getStreetNr());
		address.setStreetAndNr("Im Acker 8a");
		assertEquals("Im Acker", address.getStreet());
		assertEquals("8a", address.getStreetNr());

		address.setZipAndCity("79100 TwoWord City");
		assertEquals("79100", address.getZip());
		assertEquals("TwoWord City", address.getCityName());

		try {
			address.setStreetAndNr("onlystreet");
			fail("Expected IllegalArgumentException to be thrown");
		}
		catch (IllegalArgumentException ex) {
			assertTrue(true);
		}
	}

	@Test
	public void testEmptyXls() throws IOException, ConversionException {
		inputStream = getClass().getResourceAsStream(EMPTY_XLS_FILE);
		FileConverter excelConverter = ConverterFactory.newFileConverter(ParsingConfiguration.newDefaultConfiguration(), INPUT_FILE_TYPE.HSSF);
		List<Participant> participants = excelConverter.parseParticipants(inputStream);
		assertEquals(0, participants.size());
	}

	@Test
	public void testInvalidXlsx() throws IOException {

		inputStream = getClass().getResourceAsStream(INVALID_XLSX_FILE);

		ParsingConfiguration parsingConfiguration = ParsingConfiguration.newDefaultConfiguration();
		parsingConfiguration.setStartRow(0);

		FileConverter excelConverter = ConverterFactory.newFileConverter(parsingConfiguration, INPUT_FILE_TYPE.XSSF);

		try {
			excelConverter.parseParticipants(inputStream);
			fail("Expected ConversionException to be thrown!");
		}
		catch (ConversionException e) {
			e.printStackTrace();
			assertEquals(CONVERSION_ERROR.NAME, e.getConversionError());
			assertEquals(1, e.getAbsoluteRowIndex());
		}
	}

	@Test
	public void testGenderXls() throws IOException, ConversionException {

		INPUT_FILE_TYPE fileType = ConverterFactory.determineFileType(STANDARD_GENDER_XLS_FILE);

		ParsingConfiguration parsingConfiguration = ParsingConfiguration.newDefaultConfiguration();
		GenderColumnConfig genderColumnConfig = GenderColumnConfig.createGenderColumn(4);
		parsingConfiguration.setEmailColumnConfig(EmailColumnConfig.noEmailColumn());
		parsingConfiguration.setMobileNumberColumnConfig(MobileNumberColumnConfig.noMobileNumberColumn());
		parsingConfiguration.setGenderColumnConfig(genderColumnConfig);

		inputStream = getClass().getResourceAsStream(STANDARD_GENDER_XLS_FILE);
		FileConverter excelConverter = ConverterFactory.newFileConverter(parsingConfiguration, fileType);
		List<Participant> participants = excelConverter.parseParticipants(inputStream);

		assertEquals(2, Collections2.filter(participants, GenderPredicate.FEMALE_GENDER_PREDICATE).size());
		assertEquals(2, Collections2.filter(participants, GenderPredicate.MALE_GENDER_PREDICATE).size());
		assertEquals(1, Collections2.filter(participants, new GenderPredicate(Gender.UNDEFINED)).size());
	}

	@Test
	public void testIntegrationParsingAndCalculation() throws NoPossibleRunningDinnerException, IOException, ConversionException {
		String file = "/excelimport/18_participants.xls";
		INPUT_FILE_TYPE fileType = ConverterFactory.determineFileType(file);
		FileConverter converter = ConverterFactory.newFileConverter(ParsingConfiguration.newDefaultConfiguration(), fileType);
		List<Participant> participants = converter.parseParticipants(getClass().getResourceAsStream(file));

		RunningDinnerCalculator calculator = new RunningDinnerCalculator();
		RunningDinnerConfig config = RunningDinnerConfig.newConfigurer().build();
		GeneratedTeamsResult generatedTeams = calculator.generateTeams(config, participants, Collections.emptyList(), Collections::shuffle);
		calculator.assignRandomMealClasses(generatedTeams, config.getMealClasses(), Collections.emptyList());

		calculator.generateDinnerExecutionPlan(generatedTeams, config);

		List<Team> teams = generatedTeams.getRegularTeams();
		for (Team team : teams) {
			Set<Team> hostTeams = team.getHostTeams();
			Set<Team> guestTeams = team.getGuestTeams();

			assertEquals(2, hostTeams.size(), team + " has invalid size of host references");
			assertEquals(2, guestTeams.size(), team + " has invalid size of guest references");
			RunningDinnerCalculatorTest.assertDisjunctTeams(hostTeams, guestTeams, team);
		}

	}

	@AfterEach
	public void tearDown() {
		CoreUtil.closeStream(inputStream);
	}
}
