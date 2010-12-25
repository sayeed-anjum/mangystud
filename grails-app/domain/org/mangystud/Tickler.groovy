package org.mangystud

import java.util.Date;

import javax.persistence.Transient;

class Tickler extends Tiddler {
	static transients = ["p"]
	
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
