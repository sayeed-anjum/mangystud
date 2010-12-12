package org.mangystud

import java.util.TreeMap;

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

class TiddlerController {
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
		
		if (user == null) {
			render {error: "No current user!"} as JSON
			return;
		}
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
	
	def actionDashboard = {
		def realms = Realm.findAllByActive(true)
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())

		if (user == null) {
			render {error: "No current user!"} as JSON
			return;
		}
		if (realms.size() == 0) {
			render {error: "No active realm found!"} as JSON
			return;
		}
		
		def result = Action.findAllByOwnerAndRealmInList(user, realms)
		def result2 = groupActionsByStateAndContext(result)
		
		render result2 as JSON
	}
	
}
