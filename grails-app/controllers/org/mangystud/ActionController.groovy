package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

class ActionController {
	def realmService
	def actionService
	
	def add = {
		def title = params.title
		def stateId  = params.state
		def contextId = params.context
		def contactName = params.contact
		def projectId = params.int("project")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = realmService.getActiveRealm(user)
		
		if (realm == null) {
			render {error: "No active realm found!"} as JSON
			return;
		}

		Action action = new Action(title:title, realm:realm, owner:user)
		try {
			State state = stateId? State.valueOf(stateId) : null;
			if (state) action.state = state;
			Action context = actionService.getContext(user, contextId)
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
			if (action.save(failOnError: true, flush:true)) {
				def model = [action: action, realm: realm];
				render model as JSON
			}
		} catch (Exception e) {
			render {error: "Error when saving."} as JSON
		}
	}
	
	def view = {
		def actionId = params.int("actionId")

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		def dependsOn = null
		if (action?.dependsOn) { 
			dependsOn = Action.findByOwnerAndId(user, action.dependsOn.id)
		}
		def project = null
		if (action?.project) {
			project = Project.findByOwnerAndId(user, action.project.id)
		}

		def model = [action: action, dependsOn: dependsOn, project: project]
		
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
		action.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}
	
	def status = {
		def actionId = params.int("actionId")
		def status = params.status

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		action.state = State.find { it.id == status }	
		action.save(failOnError: true)
		
		def model = [success: true]
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
	
		action.save(failOnError: true)
		
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
			doneActions = getDoneActions(user, realms)
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

	def search = {
		def actionId = params.int("actionId")
		def term = params.term;
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def result = actionService.search(actionId, term, user)		
		
		render result as JSON
	}
	
	def getDoneActions = {user, realms ->
		def c = Action.createCriteria()
		return c.list {
			eq('done', true)
			eq('owner', user)
			'in'('realm', realms)
		}
	}
	
	def makeTickler = {
		def actionId = params.int("id")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def model = [success: true];
		model.tickler = actionService.makeTickler(actionId, user);
		render model as JSON

	}
}
