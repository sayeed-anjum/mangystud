package org.mangystud

class Area {

    static constraints = {
		name(size:1..30, blank:false)
    }
	
	static belongsTo = [realm:Realm]

	String name;
}
