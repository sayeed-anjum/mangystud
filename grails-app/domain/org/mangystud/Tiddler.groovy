package org.mangystud


class Tiddler {

    static constraints = {
		title(size:3..100, blank: false, unique:true)
		notes(nullable:true)
		realm(nullable:false)
		owner(nullable:false)
    }
	
	static hasMany = [ contexts : Context ]
	
	Realm realm
	String title
	String notes
	Date lastUpdated
	Date dateCreated
	User owner
}
