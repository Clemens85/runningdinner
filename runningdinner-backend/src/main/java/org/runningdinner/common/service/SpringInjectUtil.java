package org.runningdinner.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;


@Service
public class SpringInjectUtil {

	@Autowired
	private ApplicationContext applicationContext;

	public <T> T get(Class<T> clazz) {
		T result = applicationContext.getBean(clazz);
		return result;
	}
}
