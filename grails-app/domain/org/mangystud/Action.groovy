package org.mangystud

class Action extends Tiddler {
	static constraints = {
		project(nullable:true)
		dependsOn(nullable:true)
		area(nullable:true)
		contact(nullable:true)
	}

	static hasMany = [ contexts : Context ]
	
	State state = State.Next
	boolean done 
	boolean star 
	Area area
	Action dependsOn
	Project project
	Contact contact

	def addContext = {context ->
		if (!contexts.contains(context)) contexts << context
	}

	def removeContext = {context ->
		contexts.remove(context)
	}
}
