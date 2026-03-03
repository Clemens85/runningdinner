package org.runningdinner.portal;

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
}
