package org.mangystud

class Project extends Action {

    static constraints = {
    }
	
	static hasMany = [ actions : Action ]
}
