package org.mangystud

class Context {

    static constraints = {
		name(size:2..25,blank:false)
    }
	static belongsTo = [realm:Realm]
	
	String name;
}
