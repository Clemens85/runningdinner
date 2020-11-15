package org.runningdinner.core.converter.config;

import org.runningdinner.core.util.CoreUtil;

/**
 * A ParsingConfiguration is used for parsing arbitrary participant files.<br>
 * It contains several column configurations which identify which information is mapped into which column (and/or which information is
 * available and which not).
 * 
 * @author Clemens Stich
 * 
 */
public class ParsingConfiguration {

	private int startRow = 1;

	private SequenceColumnConfig sequenceColumnConfig;
	private NameColumnConfig nameColumnConfig;
	private AddressColumnConfig addressColumnConfig;
	private NumberOfSeatsColumnConfig numSeatsColumnConfig;

	private EmailColumnConfig emailColumnConfig;
	private MobileNumberColumnConfig mobileNumberColumnConfig;

	private AgeColumnConfig ageColumnConfig;
	private GenderColumnConfig genderColumnConfig;

	public ParsingConfiguration(NameColumnConfig nameColumnConfig, AddressColumnConfig addressColumnConfig,
			NumberOfSeatsColumnConfig numSeatsColumnConfig) {

		CoreUtil.assertNotNull(nameColumnConfig, "NameColumnConfig must not be null!");
		CoreUtil.assertNotNull(addressColumnConfig, "AddressColumnConfig must not be null!");

		this.nameColumnConfig = nameColumnConfig;
		this.addressColumnConfig = addressColumnConfig;
		this.numSeatsColumnConfig = numSeatsColumnConfig;
	}

	public ParsingConfiguration(NameColumnConfig nameColumnConfig, AddressColumnConfig addressColumnConfig) {
		this(nameColumnConfig, addressColumnConfig, NumberOfSeatsColumnConfig.noNumberOfSeatsColumn());
	}

	/**
	 * Returns the zero-index based row number from which to start parsing.
	 * 
	 * @return
	 */
	public int getStartRow() {
		return startRow;
	}

	public void setStartRow(int startRow) {
		this.startRow = startRow;
	}

	public NameColumnConfig getNameColumnConfig() {
		return nameColumnConfig;
	}

	public AddressColumnConfig getAddressColumnConfig() {
		return addressColumnConfig;
	}

	public NumberOfSeatsColumnConfig getNumSeatsColumnConfig() {
		if (numSeatsColumnConfig == null) {
			return NumberOfSeatsColumnConfig.noNumberOfSeatsColumn();
		}
		return numSeatsColumnConfig;
	}

	public EmailColumnConfig getEmailColumnConfig() {
		if (emailColumnConfig == null) {
			return EmailColumnConfig.noEmailColumn();
		}
		return emailColumnConfig;
	}

	public void setEmailColumnConfig(EmailColumnConfig emailColumnConfig) {
		this.emailColumnConfig = emailColumnConfig;
	}

	public MobileNumberColumnConfig getMobileNumberColumnConfig() {
		if (mobileNumberColumnConfig == null) {
			return MobileNumberColumnConfig.noMobileNumberColumn();
		}
		return mobileNumberColumnConfig;
	}

	public void setMobileNumberColumnConfig(MobileNumberColumnConfig mobileNumberColumnConfig) {
		this.mobileNumberColumnConfig = mobileNumberColumnConfig;
	}

	public AgeColumnConfig getAgeColumnConfig() {
		if (ageColumnConfig == null) {
			return AgeColumnConfig.noAgeColumn();
		}
		return ageColumnConfig;
	}

	public void setAgeColumnConfig(AgeColumnConfig ageColumnConfig) {
		this.ageColumnConfig = ageColumnConfig;
	}

	public GenderColumnConfig getGenderColumnConfig() {
		if (genderColumnConfig == null) {
			return GenderColumnConfig.noGenderColumn();
		}
		return genderColumnConfig;
	}

	public void setGenderColumnConfig(GenderColumnConfig genderColumnConfig) {
		this.genderColumnConfig = genderColumnConfig;
	}

	public SequenceColumnConfig getSequenceColumnConfig() {
		if (sequenceColumnConfig == null) {
			return SequenceColumnConfig.noSequenceColumn();
		}
		return sequenceColumnConfig;
	}

	public void setSequenceColumnConfig(SequenceColumnConfig sequenceColumnConfig) {
		this.sequenceColumnConfig = sequenceColumnConfig;
	}

	/**
	 * Constructs a default ParsingConfiguration which contains the most used (and of course also mandatory) configurations.
	 * 
	 * @return
	 */
	public static ParsingConfiguration newDefaultConfiguration() {
		NameColumnConfig nameColumnConfig = NameColumnConfig.createForOneColumn(0);
		AddressColumnConfig addressColumnConfig = AddressColumnConfig.newBuilder().withStreetAndStreetNrColumn(1).buildWithZipAndCityColumn(
				2);
		NumberOfSeatsColumnConfig numberSeatsColumnConfig = NumberOfSeatsColumnConfig.newNumericSeatsColumnConfig(3);

		ParsingConfiguration config = new ParsingConfiguration(nameColumnConfig, addressColumnConfig, numberSeatsColumnConfig);
		config.setEmailColumnConfig(EmailColumnConfig.createEmailColumnConfig(4));
		config.setMobileNumberColumnConfig(MobileNumberColumnConfig.createMobileNumberColumnConfig(5));

		config.setStartRow(1);

		return config;
	}
}
