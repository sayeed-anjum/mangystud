package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 
import org.compass.core.engine.SearchEngineQueryParseException;
import org.owasp.esapi.ESAPI 
import org.owasp.esapi.Validator 

class ActionController {
	def realmService
	def actionService
	def tiddlerService
	
	def add = {
		def title = params.title
		def stateId  = params.state
		def contextId = params.context
		def contactName = params.contact
		def projectId = params.int("project")
		
		Validator instance = ESAPI.validator();
		title = instance.getValidSafeHTML("title", title, 100, false)
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = realmService.getActiveRealm(user)
		
		def model = [success: false]
		if (realm == null) {
			model.message = "There are no active realms for the user!";
			render model as JSON
			return;
		}
		
		try {
			Action action = new Action(title:title, realm:realm, owner:user)
			State state = State.valueOf(stateId?:'Next');
			if (state) action.state = state;
			def context = actionService.getContext(user, contextId)
			if (context) {
				action.contexts = [context];
				if (context.realm.active) {
					action.realm = context.realm;
				}
			}
			def contact = actionService.getContact(user, contactName)
			if (contact) {
				action.contact = contact;
			}
			if (projectId) {
				action.project = Project.findByIdAndOwner(projectId, user);
			}
			
			if (action.validate()) {
				action.save(failOnError: true, flush:true) 
				model = [action: action, realm: realm, success: true];
			} else {
				model.message = "The input validation failed!"
			}
		} catch (Exception e) {
			model.message = e.message;
			log.error "exception when adding new action", e 
		}
		render model as JSON
	}
	
	def view = {
		def tid = params.int("id")
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def model = tiddlerService.tiddlerViewModel(user, tid)
		render model as JSON
	}
	
	def show = {
		def tid = params.int("id")
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def model = tiddlerService.tiddlerViewModel(user, tid)
		render model as JSON
	}
	
	def complete = {
		def actionId = params.int("actionId")
		def done = params.boolean("done")

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		def dependents = Action.findByOwnerAndDependsOn(user, action);
		dependents.each {
			it.state = done? State.Next : State.Future
			it.save(failOnError: true)
		}
		
		action.done = done;
		action.save(failOnError: true, flush: true)
		
		def model = [success: true]
		render model as JSON
	}
	
	def status = {
		def actionId = params.int("actionId")
		def status = params.status

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		def model = [success: false]
		if (action) {
			action.state = State.find { it.id == status }	
			action.save(failOnError: true, flush: true)
			model.success = true
		}
		render model as JSON
	}

	def updateContext = {
		def actionId = params.int("actionId")
		def contextId = params.int("context")
		def checked = params.boolean("checked")

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)

		def context = Context.get(contextId)
		if (context != null) {
			if (checked) action.addContext(context)
			else action.removeContext(context)
		}	
	
		action.save(failOnError: true, flush: true)
		
		def model = [success: true]
		render model as JSON
	}

	def dependsOnUpdate = {
		def actionId = params.int("actionId")
		def dependsOnId = params.int("dependsOn")

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)

		def dependsOn = Action.findByOwnerAndId(user, dependsOnId)
		
		if (dependsOn) {
			action.dependsOn = dependsOn
			action.state = State.Future
			action.save(failOnError: true)
		}	
	
		
		def model = [success: true]
		render model as JSON
	}
	
	def deleteDependency = {
		def actionId = params.int("actionId")

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		action.dependsOn = null
		action.save(failOnError: true)

		def model = [success: true]
		render model as JSON
	}

	def dashboard = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def result2 = []
		def doneActions = []
		if (realms.size() > 0) {
			result2 = actionService.getActionsByStateAndRealms(user, [State.Next, State.Future, State.WaitingFor], realms)
			doneActions = actionService.getDoneActions(user, realms)
		}
		
		def model = [state: result2, done: doneActions]
		
		render model as JSON
	}

	def next_waiting = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def result2 = []
		if (realms.size() > 0) {
			result2 = actionService.getActionsByStateAndRealms(user, [State.Next, State.WaitingFor], realms)
		}
		
		def model = [state: result2]
		
		render model as JSON
	}

	def nextActions = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)

		def result2 = []
		if (realms.size() > 0) {
			result2 = actionService.getActionsByStateAndRealms(user, [State.Next], realms)
		}
		
		def model = [state: result2]
		render model as JSON
	}

	def doneByDateActions = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)

		def result2 = []
		if (realms.size() > 0) {
			result2 = actionService.getActionsByDoneAndRealms(user, realms)
		}
		
		def model = [dateMap: result2]
		render model as JSON
	}

	def search = {
		def actionId = params.int("actionId")
		def term = params.term;
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def result = actionService.search(actionId, term, user)		
		
		render result as JSON
	}
	
	def csearch = {
		if (!params.term?.trim()) {
			return [:]
		}
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def results = [] 
		try {
			results = tiddlerService.csearch(user, term) 
		} catch (SearchEngineQueryParseException ex) {
			log.error "search error", ex
		}

		render results as JSON
	}
}
