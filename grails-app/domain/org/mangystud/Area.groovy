package org.mangystud

class Area {

    static constraints = {
		name(size:1..30, blank:false, unique:true)
    }
	
	static belongsTo = [realm:Realm]

	String name;
}
