package org.runningdinner.core;

public enum RegistrationType {
	PUBLIC, 
	
	OPEN, 
	
	CLOSED;
	
	public boolean isClosed() {
	  
	  return this == CLOSED;
	}
	
	public boolean isChangedFromClosedToPublicOrOpen(RegistrationType other) {
	  
	  return isClosed() && !other.isClosed(); 
	}
	
	public boolean isChangedFromPublicOrOpenToClosed(RegistrationType other) {
	  
	  return !isClosed() && other.isClosed();
	}
	
	public boolean isOneChangedBetweenPublicAndOpen(RegistrationType other) {
	  
	  return !isClosed() && !other.isClosed() && this != other;
	}
}
