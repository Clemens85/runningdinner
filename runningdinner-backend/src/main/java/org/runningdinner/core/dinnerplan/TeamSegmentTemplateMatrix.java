package org.runningdinner.core.dinnerplan;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.runningdinner.core.MealClass;
import org.runningdinner.core.util.RandomNumberGenerator;

public class TeamSegmentTemplateMatrix {

	private Collection<MealClass> meals;

	private RandomNumberGenerator randomNumberGenerator;
		
	private static List<int[][][]> matrix9List = new ArrayList<int[][][]>();
	private static List<int[][][]> matrix12List = new ArrayList<int[][][]>();
	private static List<int[][][]> matrix15List = new ArrayList<int[][][]>();
	
	private static List<int[][][]> matrix4List = new ArrayList<int[][][]>();
	private static List<int[][][]> matrix6List = new ArrayList<int[][][]>();
	
	static {
		
		int[][][] matrix9_1= new int[][][] {
			{ 
				{ 1, 4, 7 }, // 1 is hoster for 4 and 7 
				{ 2, 5, 8 }, // 2 is hoster for 5 and 8
				{ 3, 6, 9 }  // 3 is hoster for 6 and 9
				// This complete block represents all hosters for one meal, e.g. APPETIZER
			}, 
			{ 
				{ 4, 2, 9 },  // 4 is hoster for 2 and 9
				{ 5, 3, 7 },  // ...
				{ 6, 1, 8 } 
			}, 
			{ 
				{ 7, 2, 6 }, 
				{ 8, 3, 4 }, 
				{ 9, 1, 5 } 
			}
		};
		int[][][] matrix9_2= new int[][][] {
			{ 
				{ 1, 4, 5 },
				{ 2, 6, 8 },
				{ 3, 7, 9 }
			}, 
			{ 
				{ 4, 2, 9 },  
				{ 5, 7, 8 },
				{ 6, 1, 3 } 
			}, 
			{ 
				{ 7, 1, 2 }, 
				{ 8, 3, 4 }, 
				{ 9, 5, 6 } 
			}
		};
		
		
		
		int[][][] matrix12_1 = new int[][][] {
			{ 
				{ 1, 5, 9 }, 
				{ 2, 6, 10 }, 
				{ 3, 7, 11 },
				{ 4, 8, 12 }
			}, 
			{ 
				{ 5, 10, 11 },
				{ 6, 9, 12 },
				{ 7, 1, 4 },
				{ 8, 2, 3 }
			}, 
			{ 
				{ 9, 2, 7 }, 
				{ 10, 1, 8 }, 
				{ 11, 4, 6 },
				{ 12, 3, 5 }
			}
		};		
		
		int[][][] matrix12_2 = new int[][][] {
			{ 
				{ 1, 5, 9}, 
				{ 2, 6, 10 }, 
				{ 3, 7, 11 },
				{ 4, 8, 12 }
			}, 
			{ 
				{ 5, 2, 3 },
				{ 6, 4, 9 },
				{ 7, 1, 12 },
				{ 8, 10, 11 }
			}, 
			{ 
				{ 9, 7, 8 }, 
				{ 10, 3, 1 }, 
				{ 11, 4, 2 },
				{ 12, 5, 6 }
			}	
		};
		
		
		int[][][] matrix15 = new int[][][] {
			{ 
				{ 1, 5, 9 }, 
				{ 2, 6, 10 }, 
				{ 3, 7, 11 },
				{ 4, 14, 12 },
				{ 13, 8, 15 }
			}, 
			{ 
				{ 5, 2, 13 },
				{ 6, 4, 15 },
				{ 7, 1, 12 },
				{ 8, 10, 11 },
				{ 14, 3, 9 } 
			}, 
			{ 
				{ 9, 7, 8 }, 
				{ 10, 3, 13 }, 
				{ 11, 4, 2 },
				{ 12, 5, 6 },
				{ 15, 14, 1 }
			}
		};
		
		int[][][] matrix4 = new int[][][] {
			{ 
				{ 1, 3 }, 
				{ 2, 4 }
			}, 
			{ 
				{ 3, 2 }, 
				{ 4, 1 }
			}
		};		
		
		int[][][] matrix6 = new int[][][] {
			{ 
				{ 1, 3 }, 
				{ 2, 6 },
				{ 5, 4 }
			}, 
			{ 
				{ 3, 2 }, 
				{ 4, 1 },
				{ 6, 5 }
			}
		};	
		
		
		matrix9List.add(matrix9_1);
		matrix9List.add(matrix9_2);
		matrix12List.add(matrix12_1);
		matrix12List.add(matrix12_2);
		matrix15List.add(matrix15);
		
		matrix4List.add(matrix4);
		matrix6List.add(matrix6);
	}

	public TeamSegmentTemplateMatrix(Collection<MealClass> meals) {
		this.meals = meals;
		this.randomNumberGenerator = new RandomNumberGenerator();
	}

	public int[][][] getTemplateMatrix(int teamSegmentSize) {
		if (teamSegmentSize % meals.size() != 0 && teamSegmentSize < meals.size() * meals.size()) {
			throw new IllegalArgumentException("Passeds team segment size must be multiple of " + meals.size() + " and must be at least "
					+ (meals.size() * meals.size()));
		}

		// Currently we support following team segment sizes:
		// 9, 12, 15 (for 3 meals)
		// 4, 6 (for 2 meals)

		switch (teamSegmentSize) {
			case 9:
				return build9Matrix();
			case 12:
				return build12Matrix();
			case 15:
				return build15Matrix();
			case 4:
				return build4Matrix();
			case 6:
				return build6Matrix();
			default:
				throw new IllegalArgumentException("teamSegmentSize must be one of the following values: 9, 12, 15, 4, 6");
		}
	}

	protected int[][][] build9Matrix() {
		int index = getRandomIndex(matrix9List.size());
		return matrix9List.get(index);
	}
	
	protected int[][][] build12Matrix() {
		int index = getRandomIndex(matrix12List.size());
		return matrix12List.get(index);
	}
	
	protected int[][][] build15Matrix() {	
		int index = getRandomIndex(matrix15List.size());
		return matrix15List.get(index);
	}
	
	protected int[][][] build4Matrix() {
		int index = getRandomIndex(matrix4List.size());
		return matrix4List.get(index);
	}
	
	protected int[][][] build6Matrix() {
		int index = getRandomIndex(matrix6List.size());
		return matrix6List.get(index);
	}
	
	protected int getRandomIndex(int listSize) {
		if (listSize <= 1) {
			return 0;
		}
		return randomNumberGenerator.randomNumber(0, listSize-1);
	}

}
