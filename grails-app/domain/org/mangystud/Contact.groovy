package org.mangystud

class Contact {

    static constraints = {
		name(size:1..100, blank:false)
		email(email:true, nullable:true)
		notes(nullable:true)
		linkedUser(nullable:true)
    }
	
	static belongsTo = [realm:Realm]
	
	static transients = [ 'title' ]

	String name;
	String email;
	String notes;
	
	Person linkedUser;
	
	String getTitle = {return name;}
	def setTitle = {t -> name = title; }
}
