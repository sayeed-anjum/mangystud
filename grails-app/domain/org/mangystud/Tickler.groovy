package org.mangystud

class Tickler extends Tiddler {

	static constraints = {
		project(nullable:true)
		area(nullable:true)
		contact(nullable:true)
	}

	boolean done 
	boolean star 

	Date date
	Period period = Period.OneTime
	Area area
	Project project
	Contact contact
}
