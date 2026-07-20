package org.runningdinner.portal;

import com.google.common.base.MoreObjects;

import java.util.List;

public class PortalMyEventsResponseTO {

  private List<PortalEventEntryTO> events;

  public PortalMyEventsResponseTO() {
  }

  public PortalMyEventsResponseTO(List<PortalEventEntryTO> events) {
    this.events = events;
  }

  public List<PortalEventEntryTO> getEvents() {
    return events;
  }

  public void setEvents(List<PortalEventEntryTO> events) {
    this.events = events;
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
            .add("events", events)
            .toString();
  }
}
