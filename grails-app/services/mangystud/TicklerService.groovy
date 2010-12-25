package mangystud

import org.mangystud.Action 
import org.mangystud.Tickler 

class TicklerService {

    static transactional = true

    def updateTicklerStatus() {
		def tomorrow = new Date() + 1;
		def result = Tickler.executeUpdate("update Tickler t set t.overdue = true where t.overdue = false and t.done = false and t.date < ?", [tomorrow]);
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
	
	def makeAction = {ticklerId, user ->
		Tickler tickler = Tickler.findByOwnerAndId(user, ticklerId)
		def action = null;
		if (tickler) {
			def prunedMap = [:]
			tickler.properties.each{
				if (Action.metaClass.properties.find{p-> p.name == it.key}) {
					prunedMap.put(it.key, it.value)
				}
			}
			tickler.delete(flush:true);
			action = new Action(prunedMap)
			action.save(failOnError: true, flush:true)
		}
		return action;
	}

}
