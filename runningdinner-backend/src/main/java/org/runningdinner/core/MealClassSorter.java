package org.runningdinner.core;

import java.util.Comparator;

public class MealClassSorter implements Comparator<MealClass> {

	@Override
	public int compare(MealClass mc1, MealClass mc2) {
		if (mc1.getTime() != null && mc2.getTime() != null) {
			return mc1.getTime().compareTo(mc2.getTime());
		}
		return 0;
	}

}