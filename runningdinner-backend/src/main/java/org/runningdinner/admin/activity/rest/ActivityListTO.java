package org.runningdinner.admin.activity.rest;

import java.util.ArrayList;
import java.util.List;

import org.runningdinner.admin.activity.Activity;

public class ActivityListTO {

  private List<Activity> activities = new ArrayList<>();

  private int page = 0;

  private boolean hasMore = false;

  public ActivityListTO() {
  }

  public ActivityListTO(List<Activity> activities) {
    this.activities = activities;
  }

  public ActivityListTO(List<Activity> activities, int page, boolean hasNext) {
    this(activities);
    this.page = page;
    this.hasMore = hasNext;
  }

  public List<Activity> getActivities() {
    return activities;
  }

  public void setActivities(List<Activity> activities) {
    this.activities = activities;
  }

  public int getPage() {
    return page;
  }

  public void setPage(int page) {
    this.page = page;
  }

  public boolean isHasMore() {
    return hasMore;
  }

  public void setHasMore(boolean hasMore) {
    this.hasMore = hasMore;
  }

  @Override
  public String toString() {
    return "activities=" + activities;
  }

}