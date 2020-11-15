package org.runningdinner.core.converter.config;

import java.util.HashSet;
import java.util.Set;

public class AddressColumnConfig {

	private int streetColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;
	private int streetNrColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;
	private int zipColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;
	private int cityColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;

	protected AddressColumnConfig(int streetColumn, int streetNrColumn, int zipColumn, int cityColumn) {
		this.streetColumn = streetColumn;
		this.streetNrColumn = streetNrColumn;
		this.zipColumn = zipColumn;
		this.cityColumn = cityColumn;
	}

	public int getStreetColumn() {
		return streetColumn;
	}

	public int getStreetNrColumn() {
		return streetNrColumn;
	}

	public int getZipColumn() {
		return zipColumn;
	}

	public int getCityColumn() {
		return cityColumn;
	}

	public boolean isSingleColumnConfig() {
		Set<Integer> tmp = new HashSet<Integer>(4);
		tmp.add(streetColumn);
		tmp.add(streetNrColumn);
		tmp.add(zipColumn);
		tmp.add(cityColumn);
		return tmp.size() == 4;
	}

	public boolean isCompositeConfig() {
		// Use transitivity
		boolean result = streetColumn == streetNrColumn && streetNrColumn == zipColumn && zipColumn == cityColumn;
		return result;
	}

	public boolean isStreetAndStreetNrCompositeConfig() {
		return streetColumn == streetNrColumn;
	}

	public boolean isZipAndCityCompositeConfig() {
		return zipColumn == cityColumn;
	}

	public static AddressColumnConfigBuilder newBuilder() {
		return new AddressColumnConfigBuilder();
	}

	public static class AddressColumnConfigBuilder {

		int compositeColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;

		public AddressColumnConfigBuilder withCompositeColumn(int compositeColumn) {
			this.compositeColumn = compositeColumn;
			return this;
		}

		public CompositeAddressColumnConfigBuilder withStreetAndStreetNrColumn(int streetAndStreetNrColumn) {
			return new CompositeAddressColumnConfigBuilder(streetAndStreetNrColumn);
		}

		public SingleAddressColumnConfigBuilder withStreet(int singleStreetColumn) {
			return new SingleAddressColumnConfigBuilder(singleStreetColumn);
		}

		public AddressColumnConfig build() {
			return new AddressColumnConfig(compositeColumn, compositeColumn, compositeColumn, compositeColumn);
		}
	}

	public static class SingleAddressColumnConfigBuilder {

		private int streetColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;
		private int streetNrColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;
		private int zipColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;
		private int cityColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;

		public SingleAddressColumnConfigBuilder(int streetColumn) {
			this.streetColumn = streetColumn;
		}

		public SingleAddressColumnConfigBuilder andStreetNrColumn(final int streetNrColumn) {
			this.streetNrColumn = streetNrColumn;
			return this;
		}

		public SingleAddressColumnConfigBuilder andZip(final int zipColumn) {
			this.zipColumn = zipColumn;
			return this;
		}

		public SingleAddressColumnConfigBuilder andCity(final int cityColumn) {
			this.cityColumn = cityColumn;
			return this;
		}

		public AddressColumnConfig build() {
			return new AddressColumnConfig(streetColumn, streetNrColumn, zipColumn, cityColumn);
		}
	}

	public static class CompositeAddressColumnConfigBuilder {

		private int streetAndStreetNrColumn = AbstractColumnConfig.UNAVAILABLE_COLUMN_INDEX;

		protected CompositeAddressColumnConfigBuilder(int streetAndStreetNrColumn) {
			this.streetAndStreetNrColumn = streetAndStreetNrColumn;
		}

		public SingleAddressColumnConfigBuilder withZipColumn(final int zipColumn) {
			SingleAddressColumnConfigBuilder result = new SingleAddressColumnConfigBuilder(streetAndStreetNrColumn);
			result.streetNrColumn = streetAndStreetNrColumn;
			return result.andZip(zipColumn);
		}

		public AddressColumnConfig buildWithZipAndCityColumn(int zipAndCityColumn) {
			return new AddressColumnConfig(streetAndStreetNrColumn, streetAndStreetNrColumn, zipAndCityColumn, zipAndCityColumn);
		}
	}
}
