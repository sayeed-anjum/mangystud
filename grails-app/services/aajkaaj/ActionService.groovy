package aajkaaj

import groovy.sql.Sql 
import org.mangystud.Action 
import org.mangystud.Tickler;

class ActionService {
	def NO_CONTEXT = "(No Context)"
	def dataSource
	
    static transactional = true
	
	def search = {actionId, term ->
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
		return result
    }

	def hasTransitiveDependency = {action1, action2->
		def result = false;
		if (action1.dependsOn != null) {
			if (action1.dependsOn.id == action2.id) result = true;
			else if (hasTransitiveDependency(action1.dependsOn, action2)) result = true;
		}
		return result
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
		
		return resultByContext
	}
	
	def makeTickler = { actionId, user ->
		def db = new Sql(dataSource)
		def sql = "update tiddler set class='" + Tickler.class.name + "' where id = " + actionId
		db.execute(sql);
		return Tickler.findByIdAndOwner(actionId, user);
	}
	
}
