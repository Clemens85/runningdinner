package org.runningdinner.admin.activity.rest;

import java.util.ArrayList;
import java.util.List;

import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.Checklist;

public class DashboardAdminActivitiesTO {

  private List<Activity> activities = new ArrayList<>();

  private Checklist checkList;

  public DashboardAdminActivitiesTO() {
  }

  public DashboardAdminActivitiesTO(List<Activity> activities) {
    this.activities = activities;
  }

  public List<Activity> getActivities() {
    return activities;
  }

  public void setActivities(List<Activity> activities) {
    this.activities = activities;
  }

  public Checklist getCheckList() {
    return checkList;
  }

  public void setCheckList(Checklist checkList) {
    this.checkList = checkList;
  }

  @Override
  public String toString() {
    return "activities=" + activities + ", checkList=" + checkList;
  }


}