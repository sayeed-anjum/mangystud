package org.mangystud

import java.util.Date;

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

import aajkaaj.InboxMessage;



class TicklerController {
	def realmService
	def ticklerService
	
	def add = {
		Tickler tickler = new Tickler(params)

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = realmService.getActiveRealm(user)

		tickler.owner = user;		
		tickler.realm = realm;
		
		def tomorrow = new Date()+1
		tickler.overdue = tickler.date.before(tomorrow)
		
		def model = [success: false]
		try {
			if (tickler.save(failOnError: true)) {
				model = [tickler: tickler, realm: realm, success: true];
			}
		} catch (Exception e) {
			model.message = e.message;
		}

		render model as JSON
	}
	
	def dashboard = {
		def mode = params.int("mode");
		mode = mode ?: 7;
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def overdueTicklers = []
		def upcomingTicklers = []
		def doneTicklers = []
		if (realms.size() > 0) {
			overdueTicklers = mode & 4? ticklerService.getTicklersByStateAndRealms(user, true, realms) : []
			upcomingTicklers = mode & 2? ticklerService.getTicklersByStateAndRealms(user, false, realms) : []
			doneTicklers = mode & 1? ticklerService.getDoneTicklers(user, realms) : []
		}
		
		def model = [overdue: overdueTicklers, upcoming: upcomingTicklers, done: doneTicklers]
		
		render model as JSON
	}
	
	def updateDate = {
		def ticklerId = params.int("ticklerId")
		def date = new Date().parse("yyyy-MM-dd", params.date)

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def tickler = Tickler.findByOwnerAndId(user, ticklerId)
		
		def model = [success: false]
		if (tickler) {
			tickler.date = date
			def tomorrow = new Date() + 1
			tomorrow.clearTime()
			tickler.overdue = tickler.date.before(tomorrow)
			tickler.save(failOnError: true);
			model.success = true;
		}

		render model as JSON
	}

	def incrementPeriod = {
		def ticklerId = params.int("id")
		def period = params.period

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
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

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		Tickler tickler = Tickler.findByOwnerAndId(user, ticklerId)
		
		def model = [success: false]
		if (tickler) {
			tickler.period = Period.valueOf(period);
			model.success = true;
		}

		render model as JSON
	}

	def view = {
		def ticklerId = params.int("ticklerId")
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		Tickler tickler = Tickler.findByOwnerAndId(user, ticklerId)

		def project = null
		if (tickler?.project) {
			project = Project.findByOwnerAndId(user, tickler.project.id)
		}

		def model = [tickler: tickler, project: project]
		
		render model as JSON
	}
	
	def activeCount = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def result = Tickler.executeQuery('select count(*) as tcount from Tickler where owner = ? and done = false and overdue = true', [user])
		def model = ["count": result]
		
		result = Tickler.executeQuery('select count(*) as tcount from InboxMessage where owner = ? and processed = false', [user])
		model.inboxCount = result
		
		render model as JSON
	}

	def makeAction = {
		def ticklerId = params.int("id")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def model = [success: true]
		model.action = ticklerService.makeAction(ticklerId, user)
		render model as JSON
	}
}
