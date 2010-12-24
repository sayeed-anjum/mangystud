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
	
	public String getP() { 
		switch (period) {
			case Period.Once: return 'o'
			case Period.Daily: return 'd'
			case Period.Weekly: return 'w'
			case Period.Monthly: return 'm'
			case Period.Yearly: return 'y'
		} 
	}
	public void setP(String x) {}
	
	def roll = {period ->
		GregorianCalendar d = new GregorianCalendar()
		d.setTime(date)
		if (period == '+d') d.add(Calendar.DATE, 1)
		if (period == '+w') d.add(Calendar.WEEK_OF_YEAR, 1)
		if (period == '+m') d.add(Calendar.MONTH, 1)
		if (period == '+y') d.add(Calendar.YEAR, 1)
		date = d.getTime()
	}
}
