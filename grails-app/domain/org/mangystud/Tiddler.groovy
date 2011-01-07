package org.mangystud

import java.util.Date;

import javax.persistence.Transient;

import org.apache.catalina.deploy.ContextService;


class Tiddler {
	static searchable = {
        root true
        owner component: [prefix:'user_']
    }
	
    static constraints = {
		realm(nullable:false)
		title(size:3..100, blank: false, markup:true)
		notes(maxSize:2000,nullable:true, markup:true)
		owner(nullable:false)
		project(nullable:true)
		dependsOn(nullable:true)
		area(nullable:true)
		contact(nullable:true)
		date(nullable:true)
    }

	static hasMany = [ contexts : Context ]
	static mappedBy = [ actions : Tiddler ]

	State state = State.Next

	boolean done
	boolean star

	boolean overdue = false 
	Date date
	Period period = Period.Once
	ProjectStatus projectStatus = ProjectStatus.Someday
	
	Area area
	Contact contact

	Tiddler dependsOn
	Tiddler project
	
	Realm realm
	String title
	String notes
	Person owner

	Date lastUpdated
	Date dateCreated
}
