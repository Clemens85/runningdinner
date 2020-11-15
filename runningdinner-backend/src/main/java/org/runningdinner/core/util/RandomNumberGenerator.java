package org.runningdinner.core.util;

import java.util.Random;

public class RandomNumberGenerator {

	private Random rand = new Random();

	public int randomNumber(int min, int max) {
		int randomNum = rand.nextInt((max - min) + 1) + min;
		return randomNum;
	}

}
