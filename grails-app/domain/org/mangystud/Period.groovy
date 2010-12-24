package org.mangystud

public enum Period {
	Daily('d'),
	Once('o'),
	Weekly('w'),
	Monthly('m'),
	Yearly('y');
	
	final String id;
	
	Period(String id) { this.id = id; }
}
