package org.mangystud

class Action extends Tiddler {
	static constraints = {
		project(nullable:true)
		dependsOn(nullable:true)
		area(nullable:true)
		contact(nullable:true)
	}

	State state = State.NEXT
	boolean done 
	boolean star 
	Area area
	Action dependsOn
	Project project
	User contact
}
