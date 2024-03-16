package org.runningdinner.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.runningdinner.common.service.impl.DefaultIdGenerator;

public class TestDefaultUuidGenerator {

	DefaultIdGenerator generator = new DefaultIdGenerator();

	@Test
	public void testValidUuids() {
		String newUuid = generator.generateAdminId();
		assertEquals(true, generator.isAdminIdValid(newUuid));

		newUuid = generator.generateAdminId();
		assertEquals(true, generator.isAdminIdValid(newUuid));
	}

	@Test
	public void testInvalidUuids() {
		assertEquals(false, generator.isAdminIdValid(""));
		assertEquals(false, generator.isAdminIdValid(null));
		assertEquals(
				false,
				generator.isAdminIdValid("Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor s"));
		assertEquals(false, generator.isAdminIdValid("ZZ19bd7b+f54d-4268-a29c-3bd3ed99103e"));
	}
}
