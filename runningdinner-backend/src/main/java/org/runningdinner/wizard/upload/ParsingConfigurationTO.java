
package org.runningdinner.wizard.upload;

import java.io.Serializable;
import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.converter.config.AddressColumnConfig;
import org.runningdinner.core.converter.config.AddressColumnConfig.SingleAddressColumnConfigBuilder;
import org.runningdinner.core.converter.config.AgeColumnConfig;
import org.runningdinner.core.converter.config.EmailColumnConfig;
import org.runningdinner.core.converter.config.GenderColumnConfig;
import org.runningdinner.core.converter.config.MobileNumberColumnConfig;
import org.runningdinner.core.converter.config.NameColumnConfig;
import org.runningdinner.core.converter.config.NumberOfSeatsColumnConfig;
import org.runningdinner.core.converter.config.ParsingConfiguration;
import org.runningdinner.core.util.CoreUtil;

import com.google.common.base.Optional;

public class ParsingConfigurationTO implements Serializable {

  private static final long serialVersionUID = 1L;

  @NotNull(message = "error.required.upload.firstrow")
  private int firstRow;

  @NotEmpty(message = "error.required.upload.columnmappings")
  private List<ColumnMappingTO> columnMappings;

  public int getFirstRow() {

    return firstRow;
  }

  public void setFirstRow(int firstRow) {

    this.firstRow = firstRow;
  }

  public List<ColumnMappingTO> getColumnMappings() {

    return columnMappings;
  }

  public void setColumnMappings(List<ColumnMappingTO> columnMappings) {

    this.columnMappings = columnMappings;
  }

  public ParsingConfiguration toParsingConfiguration() {

    Optional<NameColumnConfig> nameColumnConfig = getNameColumnConfig();
    Optional<AddressColumnConfig> addressColumnConfig = getAddressColumnConfig();

    IssueList issues = new IssueList();

    if (!nameColumnConfig.isPresent()) {
      issues.addIssue(new Issue("error_file_upload_missing_name_column_config", IssueType.VALIDATION));
    }
    if (!addressColumnConfig.isPresent()) {
      issues.addIssue(new Issue("error_file_upload_missing_address_column_config", IssueType.VALIDATION));
    }

    if (!CoreUtil.isEmpty(issues.getIssues())) {
      throw new ValidationException(issues);
    }

    NumberOfSeatsColumnConfig numberOfSeatsConfig = getNumberOfSeatsColumnConfig();

    ParsingConfiguration result = new ParsingConfiguration(nameColumnConfig.get(), addressColumnConfig.get(), numberOfSeatsConfig);
    result.setEmailColumnConfig(getEmailColumnConfig());
    result.setAgeColumnConfig(getAgeColumnConfig());
    result.setGenderColumnConfig(getGenderColumnConfig());
    result.setMobileNumberColumnConfig(getMobileNumberColumnConfig());
    return result;
  }

  private Optional<NameColumnConfig> getNameColumnConfig() {

    Optional<Integer> columnIndex = getColumnIndex(ColumnMappingTO.FULLNAME);
    if (columnIndex.isPresent()) {
      return Optional.of(NameColumnConfig.createForOneColumn(columnIndex.get()));
    }

    Optional<Integer> columnIndexFirstname = getColumnIndex(ColumnMappingTO.FIRSTNAME);
    Optional<Integer> columnIndexLastname = getColumnIndex(ColumnMappingTO.LASTNAME);
    if (columnIndexFirstname.isPresent() && columnIndexLastname.isPresent()) {
      return Optional.of(NameColumnConfig.createForTwoColumns(columnIndexFirstname.get(), columnIndexLastname.get()));
    }

    return Optional.absent();
  }

  private Optional<AddressColumnConfig> getAddressColumnConfig() {

    Optional<Integer> columnIndex = getColumnIndex(ColumnMappingTO.COMPLETE_ADDRESS);
    if (columnIndex.isPresent()) {
      return Optional.of(AddressColumnConfig.newBuilder().withCompositeColumn(columnIndex.get()).build());
    }

    Optional<Integer> columnIndexStreetWithNr = getColumnIndex(ColumnMappingTO.STREET_WITH_NR);
    Optional<Integer> columnIndexZipWithCity = getColumnIndex(ColumnMappingTO.ZIP_WITH_CITY);
    Optional<Integer> columnIndexStreet = getColumnIndex(ColumnMappingTO.STREET);
    Optional<Integer> columnIndexStreetNr = getColumnIndex(ColumnMappingTO.STREET_NR);
    Optional<Integer> columnIndexZip = getColumnIndex(ColumnMappingTO.ZIP);
    Optional<Integer> columnIndexCity = getColumnIndex(ColumnMappingTO.CITY);

    if (columnIndexStreetWithNr.isPresent()) {
      if (columnIndexZipWithCity.isPresent()) {
        return Optional.of(AddressColumnConfig.newBuilder().withStreetAndStreetNrColumn(columnIndexStreetWithNr.get()).buildWithZipAndCityColumn(
          columnIndexZipWithCity.get()));
      } else {
        if (columnIndexZip.isPresent()) {
          SingleAddressColumnConfigBuilder addressBuilder = AddressColumnConfig.newBuilder().withStreetAndStreetNrColumn(
            columnIndexStreetWithNr.get()).withZipColumn(columnIndexZip.get());
          if (columnIndexCity.isPresent()) {
            addressBuilder = addressBuilder.andCity(columnIndexCity.get());
          }
          return Optional.of(addressBuilder.build());
        }
      }
    } else if (columnIndexZipWithCity.isPresent()) {
      // Check only single street items due to we got the composite check already above:
      if (columnIndexStreet.isPresent() && columnIndexStreetNr.isPresent()) {
        return Optional.of(AddressColumnConfig.newBuilder().withStreet(columnIndexStreet.get()).andStreetNrColumn(
          columnIndexStreetWithNr.get()).andZip(columnIndexZipWithCity.get()).andCity(columnIndexZipWithCity.get()).build());
      }
    } else {
      if (columnIndexStreet.isPresent() && columnIndexStreetNr.isPresent() && columnIndexZip.isPresent()) {
        SingleAddressColumnConfigBuilder addressBuilder = AddressColumnConfig.newBuilder().withStreet(columnIndexStreet.get()).andStreetNrColumn(
          columnIndexStreetNr.get()).andZip(columnIndexZip.get());
        if (columnIndexCity.isPresent()) {
          addressBuilder = addressBuilder.andCity(columnIndexCity.get());
        }
        return Optional.of(addressBuilder.build());
      }
    }

    return Optional.absent();
  }

  private EmailColumnConfig getEmailColumnConfig() {

    Optional<Integer> columnIndex = getColumnIndex(ColumnMappingTO.EMAIL);
    if (columnIndex.isPresent()) {
      return EmailColumnConfig.createEmailColumnConfig(columnIndex.get());
    }
    return EmailColumnConfig.noEmailColumn();
  }

  private AgeColumnConfig getAgeColumnConfig() {

    Optional<Integer> columnIndex = getColumnIndex(ColumnMappingTO.AGE);
    if (columnIndex.isPresent()) {
      return AgeColumnConfig.createAgeColumn(columnIndex.get());
    }
    return AgeColumnConfig.noAgeColumn();
  }

  private MobileNumberColumnConfig getMobileNumberColumnConfig() {

    Optional<Integer> columnIndex = getColumnIndex(ColumnMappingTO.MOBILE);
    if (columnIndex.isPresent()) {
      return MobileNumberColumnConfig.createMobileNumberColumnConfig(columnIndex.get());
    }
    return MobileNumberColumnConfig.noMobileNumberColumn();
  }

  private GenderColumnConfig getGenderColumnConfig() {

    Optional<Integer> columnIndex = getColumnIndex(ColumnMappingTO.GENDER);
    if (columnIndex.isPresent()) {
      return GenderColumnConfig.createGenderColumn(columnIndex.get());
    }
    return GenderColumnConfig.noGenderColumn();
  }

  private NumberOfSeatsColumnConfig getNumberOfSeatsColumnConfig() {

    Optional<Integer> columnIndex = getColumnIndex(ColumnMappingTO.NUMBER_OF_SEATS);
    if (columnIndex.isPresent()) {
      return NumberOfSeatsColumnConfig.newNumericSeatsColumnConfig(columnIndex.get());
    }
    return NumberOfSeatsColumnConfig.noNumberOfSeatsColumn();
  }

  private Optional<Integer> getColumnIndex(String mappingValueToFind) {

    for (ColumnMappingTO columnMapping : columnMappings) {
      String mappingValue = columnMapping.getMappingSelection() != null ? columnMapping.getMappingSelection().getValue() : StringUtils.EMPTY;
      if (StringUtils.equals(mappingValue, mappingValueToFind)) {
        return Optional.of(columnMapping.getColumnIndex());
      }
    }
    return Optional.absent();
  }

}
