package org.runningdinner.dinnerroute.optimization.data;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

public class DinnerRouteOptimizationRequest {

	private String adminId;

	private String optimizationId;

	private List<MealReference> meals;

	private List<TeamReference> dinnerRoutes;

	private double[][] distanceMatrix;

	private Map<Integer, LinkedHashSet<Integer>> clusterSizes;

	public DinnerRouteOptimizationRequest(String adminId,
																				String optimizationId,
																				List<MealReference> meals,
																				List<TeamReference> dinnerRoutes,
																				double[][] distanceMatrix,
																				Map<Integer, LinkedHashSet<Integer>> clusterSizes) {
		this.adminId = adminId;
		this.optimizationId = optimizationId;
		this.meals = meals;
		this.dinnerRoutes = dinnerRoutes;
		this.distanceMatrix = distanceMatrix;
		this.clusterSizes = clusterSizes;
	}

	protected DinnerRouteOptimizationRequest() {
		// NOP
	}

	public String getAdminId() {
		return adminId;
	}

	public void setAdminId(String adminId) {
		this.adminId = adminId;
	}

	public String getOptimizationId() {
		return optimizationId;
	}

	public void setOptimizationId(String optimizationId) {
		this.optimizationId = optimizationId;
	}

	public List<TeamReference> getDinnerRoutes() {
		return dinnerRoutes;
	}

	public void setDinnerRoutes(List<TeamReference> dinnerRoutes) {
		this.dinnerRoutes = dinnerRoutes;
	}

	public double[][] getDistanceMatrix() {
		return distanceMatrix;
	}

	public void setDistanceMatrix(double[][] distanceMatrix) {
		this.distanceMatrix = distanceMatrix;
	}

	public List<MealReference> getMeals() {
		return meals;
	}
	public Map<Integer, LinkedHashSet<Integer>> getClusterSizes() {
		return clusterSizes;
	}
}
