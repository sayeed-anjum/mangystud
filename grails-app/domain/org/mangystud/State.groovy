package org.mangystud

public enum State {
	Next('Next'),
	WaitingFor('WaitingFor'),
	Future('Future');
	
	final String id;
	
	State(String id) { this.id = id }
}
