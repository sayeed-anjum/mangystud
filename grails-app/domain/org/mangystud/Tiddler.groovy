package org.mangystud

import org.apache.catalina.deploy.ContextService;


class Tiddler {

    static constraints = {
		realm(nullable:false)
		title(size:3..100, blank: false, unique:true)
		notes(nullable:true)
		owner(nullable:false)
    }
	
	Realm realm
	String title
	String notes
	Person owner

	Date lastUpdated
	Date dateCreated
}
