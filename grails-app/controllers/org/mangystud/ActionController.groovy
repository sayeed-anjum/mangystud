package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

class ActionController {
	def NO_CONTEXT = "(No Context)"
	
	def groupActionsByStateAndContext = {actions ->
		def resultByState = actions.groupBy { it.state }
		
		def resultByContext = new TreeMap();
		resultByState.entrySet().each {
			def stateContextMap = new TreeMap();
			it.value.each {action ->
				def actionContext = action.contexts
				if (actionContext.size() == 0) {
					stateContextMap.get(NO_CONTEXT, []) << action
				} else {
					actionContext.each {context ->
						stateContextMap.get(context.name, []) << action
					}
				}
			}
			resultByContext[it.key] = stateContextMap
		}
		
		return resultByContext;
	}
	
	
	def add = {
		def type = params.type
		def title = params.title
		def realm = Realm.findByActive(true)
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		if (realm == null) {
			render {error: "No active realm found!"} as JSON
			return;
		}
		if (type == "Action") {
			Action action = new Action(title:title, realm:realm, owner:user)
			try {
				if (action.save(failOnError: true)) {
					def model = [action: action, realm: realm];
					render model as JSON
				}
			} catch (Exception e) {
				render {error: "Error when saving."} as JSON
			}
		}
	}
	
	def view = {
		def actionId = params.int("actionId")
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		def dependsOn = null
		if (action.dependsOn) { 
			dependsOn = Action.findByOwnerAndId(user, action.dependsOn.id)
		}
		
		def model = [action: action, dependsOn: dependsOn]
		
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

	def realmChange = {
		def actionId = params.int("id")
		def realmId = params.int("realm")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findById(realmId);
		
		if (realm == null || realm.user != user) {
			String message = "Not a valid realm id: " + realmId;
			return message as JSON
		}
		
		def action = Action.findByOwnerAndId(user, actionId)
		
		action.realm = realm
		action.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}

	def areaUpdate = {
		def oid = params.int("id")
		def areaId = params.int("area")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def area = areaId == 0? null : Area.findById(areaId);
		
		Action action = Action.findByOwnerAndId(user, oid)
		
		action.area = area
		action.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}

	def contactUpdate = {
		def oid = params.int("id")
		def contactId = params.int("contact")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def contact = contactId == 0? null : Contact.findById(contactId);
		
		Action action = Action.findByOwnerAndId(user, oid)
		
		action.contact = contact
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
		
		if (dependsOnId != null) {
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

	def remove = {
		def actionId = params.int("actionId")
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		action.delete()
		
		def model = [success: true]
		render model as JSON
	}
	
	
	def dashboard = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def result2 = []
		def doneActions = []
		if (realms.size() > 0) {
			result2 = getActionsByStateAndRealms(user, [State.Next, State.Future, State.WaitingFor], realms)
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
			result2 = getActionsByStateAndRealms(user, [State.Next, State.WaitingFor], realms)
		}
		
		def model = [state: result2]
		
		render model as JSON
	}

	def nextActions = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)

		def result2 = []
		if (realms.size() > 0) {
			result2 = getActionsByStateAndRealms(user, [State.Next], realms)
		}
		
		def model = [state: result2]
		render model as JSON
	}

	def search = {
		def actionId = params.int("actionId")
		def term = params.term;
		
		def action = Action.findById(actionId);
		def actions = Action.findAllByTitleLike("%${term}%");
		actions.remove(action)
		
		def result = actions.collect {
			if (!hasTransitiveDependency(it, action)) {
				return [value: it.id, label: it.title]
			} 
			return 
		}
		result.removeAll{ it ==  null}
		
		render result as JSON
	}
	
	def getActionsByStateAndRealms = {user, states, realms ->
		def c = Action.createCriteria()
		def result = c.list {
			eq('done', false)
			eq('owner', user)
			'in'('state', states)
			'in'('realm', realms)
		}
		return groupActionsByStateAndContext(result)
	}
	
	def getDoneActions = {user, realms ->
		def c = Action.createCriteria()
		c = Action.createCriteria()
		return c.list {
			eq('done', true)
			eq('owner', user)
			'in'('realm', realms)
		}
	}
	
	def hasTransitiveDependency = {action1, action2->
		def result = false;
		println "Checking transitive dependency for ${action1.title} and ${action2.title}"
		if (action1.dependsOn != null) {
			if (action1.dependsOn.id == action2.id) result = true; 
			else if (hasTransitiveDependency(action1.dependsOn, action2)) result = true;
		}
		println "result is ${result}"
		return result; 
	}
	
	def toggleStar = {
		def actionId = params.int("id")
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		def model = [success: false]
		if (action) {
			println action.star;
			action.star = !(action.star);
			println action.star;
			action.save(failOnError: true)
			model.success = true;
		}
		render model as JSON
	}
}
