package org.mangystud

class Tickler extends Tiddler {

	static constraints = {
		project(nullable:true)
		area(nullable:true)
		contact(nullable:true)
	}

	boolean done 
	boolean star
	boolean overdue = false 

	Date date
	Period period = Period.Once
	Area area
	Project project
	Contact contact
}
