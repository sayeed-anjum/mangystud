package org.mangystud


class Realm {

    static constraints = {
		name(size:2..25,blank:false)
    }
	
	String name;
}
