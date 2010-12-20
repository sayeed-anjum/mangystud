package org.mangystud

import org.apache.catalina.deploy.ContextService;


class Tiddler {

    static constraints = {
		realm(nullable:false)
		title(size:3..100, blank: false, unique:true)
		notes(nullable:true)
		owner(nullable:false)
    }
	
	static hasMany = [ contexts : Context ]
	
	Realm realm
	String title
	String notes
	User owner

	Date lastUpdated
	Date dateCreated
	
	def addContext = {context ->
		if (!contexts.contains(context)) contexts << context
	}

	def removeContext = {context ->
		contexts.remove(context)
	}
}
