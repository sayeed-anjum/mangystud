package org.mangystud

class Context {

    static constraints = {
		name(size:2..25,blank:false)
		realm(nullable:false)
    }
	
	Realm realm;
	String name;
	
}
