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
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		
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
		def actionId = params.actionId
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		def model = [action: action]
		render model as JSON
	}
	
	def complete = {
		def actionId = params.actionId
		def done = (params.done == "true")
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		action.done = done;
		action.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}
	
	def status = {
		def actionId = params.actionId
		def status = params.status
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		action.state = State.find { it.id == status }	
		action.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}
	
	def remove = {
		def actionId = params.actionId
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def action = Action.findByOwnerAndId(user, actionId)
		
		action.delete()
		
		def model = [success: true]
		render model as JSON
	}
	
	
	def dashboard = {
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def result2 = getActionsByStateAndRealms(user, [State.Next, State.Future, State.WaitingFor], realms)
		def doneActions = getDoneActions(user, realms)
		
		def model = [state: result2, done: doneActions]
		
		render model as JSON
	}

	def next_waiting = {
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def result2 = getActionsByStateAndRealms(user, [State.Next, State.WaitingFor], realms)
		
		def model = [state: result2]
		
		render model as JSON
	}

	def nextActions = {
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def result2 = getActionsByStateAndRealms(user, [State.Next], realms)
		
		def model = [state: result2]
		
		render model as JSON
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

}
