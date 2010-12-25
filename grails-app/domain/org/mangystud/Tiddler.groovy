package org.mangystud

import java.util.Date;

import javax.persistence.Transient;

import org.apache.catalina.deploy.ContextService;


class Tiddler {

    static constraints = {
		realm(nullable:false)
		title(size:3..100, blank: false, unique:true)
		notes(nullable:true)
		owner(nullable:false)
		project(nullable:true)
		dependsOn(nullable:true)
		area(nullable:true)
		contact(nullable:true)
		date(nullable: true)
    }

	static hasMany = [ contexts : Context ]
	static mappedBy = [ actions : Tiddler ]
	
	State state = State.Next
	Period period = Period.Once

	boolean done
	boolean star
	boolean overdue = false 
	Date date

	Area area
	Tiddler dependsOn
	Tiddler project
	Contact contact
	
	Realm realm
	String title
	String notes
	Person owner

	Date lastUpdated
	Date dateCreated
	
	def addContext = {context ->
		if (!contexts.contains(context)) contexts << context
	}

	def removeContext = {context ->
		contexts.remove(context)
	}

	@Transient
	public String getP() { 
		switch (period) {
			case Period.Daily: return 'd'
			case Period.Weekly: return 'w'
			case Period.Monthly: return 'm'
			case Period.Yearly: return 'y'
			default: return 'o'
		} 
	}

	public void setP(String x) {}
	
	def roll = {period ->
		GregorianCalendar d = new GregorianCalendar()
		if (date) d.setTime(date)
		if (period == '+d') d.add(Calendar.DATE, 1)
		if (period == '+w') d.add(Calendar.WEEK_OF_YEAR, 1)
		if (period == '+m') d.add(Calendar.MONTH, 1)
		if (period == '+y') d.add(Calendar.YEAR, 1)
		date = d.getTime()
	}
}
