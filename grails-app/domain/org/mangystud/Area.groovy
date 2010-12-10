package org.mangystud

class Area {

    static constraints = {
		name(size:3..30, blank:false, unique:true)
    }
	
	String name;
}
