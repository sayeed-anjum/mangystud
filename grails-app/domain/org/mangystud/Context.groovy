package org.mangystud

class Context {

    static constraints = {
		name(size:1..25,blank:false)
    }
	static belongsTo = [realm:Realm]
	
	String name;
}
