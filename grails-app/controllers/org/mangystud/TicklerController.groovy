package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

import com.ibm.icu.util.Calendar;
import com.ibm.icu.util.GregorianCalendar;

class TicklerController {

	def add = {
		Tickler tickler = new Tickler(params)

		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByActive(true)

		tickler.owner = user;		
		tickler.realm = realm;
		
		def tomorrow = new Date()+1
		tickler.overdue = tickler.date.before(tomorrow)
		
		try {
			if (tickler.save(failOnError: true)) {
				def model = [tickler: tickler, realm: realm];
				render model as JSON
			}
		} catch (Exception e) {
			render {error: "Error when saving."} as JSON
		}
	}
	
	def dashboard = {
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def overdueTicklers = []
		def upcomingTicklers = []
		def doneTicklers = []
		if (realms.size() > 0) {
			overdueTicklers = getTicklersByStateAndRealms(user, true, realms)
			upcomingTicklers = getTicklersByStateAndRealms(user, false, realms)
			doneTicklers = getDoneTicklers(user, realms)
		}
		
		def model = [overdue: overdueTicklers, upcoming: upcomingTicklers, done: doneTicklers]
		
		render model as JSON
	}
	
	def getTicklersByStateAndRealms = {user, state, realms ->
		def c = Tickler.createCriteria()
		return c.list {
			eq('done', false)
			eq('owner', user)
			eq('overdue', state)
			'in'('realm', realms)
		}
	}

	def getDoneTicklers = {user, realms ->
		def c = Tickler.createCriteria()
		return c.list {
			eq('done', true)
			eq('owner', user)
			'in'('realm', realms)
		}
	}

	def remove = {
		def ticklerId = params.int("ticklerId")
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def tickler = Tickler.findByOwnerAndId(user, ticklerId)
		
		def model = [success: false]
		if (tickler) {
			tickler.delete()
			model.success = true;
		}
		render model as JSON
	}

	def updateDate = {
		def ticklerId = params.int("ticklerId")
		def date = new Date().parse("yyyy-MM-dd", params.date)

		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def tickler = Tickler.findByOwnerAndId(user, ticklerId)
		
		def model = [success: false]
		if (tickler) {
			tickler.date = date
			def tomorrow = new Date()+1
			tickler.overdue = tickler.date.before(tomorrow)
			model.success = true;
		}

		render model as JSON
	}

	def incrementPeriod = {
		def ticklerId = params.int("id")
		def period = params.period

		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		Tickler tickler = Tickler.findByOwnerAndId(user, ticklerId)
		
		def model = [success: false]
		if (tickler) {
			tickler.roll(period)
			def tomorrow = new Date()+1
			tickler.overdue = tomorrow.after(tickler.date)
			model.success = true;
		}

		render model as JSON
	}

	def updatePeriodicity = {
		def ticklerId = params.int("id")
		def period = params.period

		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		Tickler tickler = Tickler.findByOwnerAndId(user, ticklerId)
		
		def model = [success: false]
		if (tickler) {
			tickler.period = Period.valueOf(period);
			model.success = true;
		}

		render model as JSON
	}

	def complete = {
		def ticklerId = params.int("ticklerId")
		def done = params.boolean("done")
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		Tickler tickler = Tickler.findByOwnerAndId(user, ticklerId)
		
		def model = [success: false]
		if (tickler) {
			tickler.done = done;
			tickler.save(failOnError: true)
			model.success = true;
		}
		
		render model as JSON
	}
	
	def view = {
		def ticklerId = params.int("ticklerId")
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		Tickler tickler = Tickler.findByOwnerAndId(user, ticklerId)
		
		def model = [tickler: tickler]
		
		render model as JSON
	}
	
	def realmChange = {
		def ticklerId = params.int("id")
		def realmId = params.int("realm")
		
		User user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		Realm realm = Realm.findById(realmId);
		
		if (realm == null || realm.user != user) {
			String message = "Not a valid realm id: " + realmId;
			return message as JSON
		}
		
		Tickler tickler = Tickler.findByOwnerAndId(user, ticklerId)
		
		tickler.realm = realm
		tickler.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}

	def areaUpdate = {
		def oid = params.int("id")
		def areaId = params.int("area")
		
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def area = areaId == 0? null : Area.findById(areaId);
		
		Tickler tickler = Tickler.findByOwnerAndId(user, oid)
		
		tickler.area = area
		tickler.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}

	def contactUpdate = {
		def oid = params.int("id")
		def contactId = params.int("contact")
		
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def contact = contactId == 0? null : Contact.findById(contactId);
		
		Tickler tickler = Tickler.findByOwnerAndId(user, oid)
		
		tickler.contact = contact
		tickler.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}
	
}
