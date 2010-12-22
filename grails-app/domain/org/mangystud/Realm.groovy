package org.mangystud

class Realm {

    static constraints = {
		name(size:2..25,blank:false)
		user(nullable:false)
    }
	
	String name;
	boolean active = true;
	List contexts;
	List areas;
	List contacts;
	User user;
	
	static hasMany = [contexts: Context, areas : Area, contacts : Contact] 
}
