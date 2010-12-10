package org.mangystud

public enum State {
	NEXT('next'),
	WAITING('wait'),
	FUTURE('future');
	
	final String id;
	
	State(String id) { this.id = id }
}
