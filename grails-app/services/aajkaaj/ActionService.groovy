package aajkaaj

import groovy.sql.Sql 
import org.mangystud.Action 
import org.mangystud.Contact 
import org.mangystud.Context 
import org.mangystud.Project 
import org.mangystud.State;
import org.mangystud.Tickler;
import org.mangystud.Tiddler 

class ActionService {
	def NO_CONTEXT = "(No Context)"
	def NO_CONTACT = "(No Contact)"
	def dataSource
	
    static transactional = true
	
	def search = {actionId, term, user ->
		def action = Action.findById(actionId);
		def actions = Action.findAllByOwnerAndTitleLike(user, "%${term}%");
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

	def getActionsByDoneAndRealms = {user, realms ->
		def cal = new GregorianCalendar();
		cal.add(GregorianCalendar.MONTH, -1);
		def c = Action.createCriteria()
		def result = c.list {
			eq('done', true)
			ge('lastUpdated', cal.getTime())
			'in'('realm', realms)
			order('lastUpdated', 'desc')
		}
		def formatter = new java.text.SimpleDateFormat("yyyy-MM-dd")
		return result.groupBy { formatter.format(it.lastUpdated) }
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
			if (it.key == State.WaitingFor) {
				resultByContext[it.key] = getContactActionMap(it.value)
			} else {
				resultByContext[it.key] = getContextActionMap(it.value)
			}
		}
		
		return resultByContext
	}
	
	def getContextActionMap = {actions ->
		def ctxMap = new TreeMap();
		actions.each {action ->
			def actionContext = action.contexts
			if (actionContext.size() == 0) {
				ctxMap.get(NO_CONTEXT, []) << action
			} else {
				actionContext.each {context ->
					ctxMap.get(context.name, []) << action
				}
			}
		}
		return ctxMap;
	}

	def getContactActionMap = {actions ->
		def contactMap = new TreeMap();
		actions.each {action ->
			def contact = action.contact
			if (contact) {
				contactMap.get(contact.name, []) << action
			} else {
				contactMap.get(NO_CONTACT, []) << action
			}
		}
		return contactMap;
	}

	def makeTickler = { actionId, user ->
		def db = new Sql(dataSource)
		def sql = "update tiddler set class='" + Tickler.class.name + "' where id = " + actionId
		db.execute(sql);
		return Tickler.findByIdAndOwner(actionId, user);
	}
	
	def getProjectsByTypeAndRealms = {user, statuses, realms ->
		def c = Project.createCriteria()
		def result = c.list {
			eq('done', false)
			eq('owner', user)
			'in'('projectStatus', statuses)
			'in'('realm', realms)
		}
		return result.groupBy { it.projectStatus }
	}

	def getCompletedProjects = {user, realms ->
		def c = Project.createCriteria()
		return c.list {
			eq('done', true)
			eq('owner', user)
			'in'('realm', realms)
		}
	}
	
	def getProjectTiddlers = {user, project ->
		def tiddlers = Tiddler.findAllByOwnerAndProject(user, project);
		
		def map = [:]
		map.NextActions = []
		map.FutureActions = []
		map.WaitingForActions = []
		map.subProjects = []
		map.references = []
		map.upcomingTicklers = []
		
		tiddlers.each {
			String key = null
			if (it.done) {
				key = "done${it.class.name}s"
			} else {
				switch (it.class) {
					case Action.class:
						key = "${it.state}Actions"
						break

					case Project.class:
						key = "subProjects";
						break
						
					case Reference.class:
						key = "references";
						break
						
					case Tickler.class:
						key = (it.overdue? "pending" : "upcoming") + "Ticklers";
						break
				}
			}
			if (key) map.get(key, []) << it;
		}

		map.NextActions = getContextActionMap(map.NextActions)
		map.WaitingForActions = getContactActionMap(map.WaitingForActions)
		map.FutureActions = getContextActionMap(map.FutureActions)

		return map;
	}
	
	def getContext = {user, contextId ->
		def items = Context.findAllByName(contextId.trim())
		def context = null
		items.each {item ->
			if (item.realm.user.id == user.id) {
				context = item
			} 
		}
		return context	
	}

	def getContact = {user, contactName ->
		def items = Contact.findAllByName(contactName.trim())
		def contact = null
		items.each {item ->
			if (item.realm.user.id == user.id) {
				contact = item
			} 
		}
		return contact	
	}

	def getContactTiddlers = {user, contact ->
		def tiddlers = Tiddler.findAllByOwnerAndContact(user, contact);
		
		def map = [:]
		map.DelegatedActions = []
		map.AssocActions = []
		map.AssocProjects = []
		map.AssocTicklers = []
		map.AssocReferences = []
		map.DoneActions = []
		map.DoneProjects = []
		
		tiddlers.each {
			String key = null
			if (it.done) {
				key = it.class == Tickler.class? null : "Done${it.class.name}s";
			} else {
				switch (it.class) {
					case Action.class:
						key = it.state == State.WaitingFor? "DelegatedActions" : it.state == State.Next? "AssocActions" : null;
						break

					case Project.class:
						key = "AssocProjects";
						break 
						
					case Tickler.class:
						key = "AssocTicklers";
						break

					case Reference.class:
						key = "AssocReferences";
						break 
				}
			}
			if (key) map.get(key, []) << it;
		}

		return map;
	}

	def getDoneActions = {user, realms ->
		def c = Action.createCriteria()
		return c.list {
			eq('done', true)
			eq('owner', user)
			'in'('realm', realms)
			order('lastUpdated', 'desc')
		}
	}
	
}
