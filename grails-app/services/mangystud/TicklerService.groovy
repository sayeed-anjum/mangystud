package mangystud

import groovy.sql.Sql 
import org.mangystud.Action 
import org.mangystud.Tickler 

class TicklerService {
	
    static transactional = true

    def updateTicklerStatus() {
		def tomorrow = new Date() + 1;
		tomorrow.clearTime()
		def result = Tickler.executeUpdate("update Tickler t set t.overdue = true where t.overdue = false and t.done = false and t.date < ?", [tomorrow]);
    }

	def getTicklersByStateAndRealms = {user, state, realms ->
		def c = Tickler.createCriteria()
		return c.list {
			eq('done', false)
			eq('owner', user)
			eq('overdue', state)
			'in'('realm', realms)
			order('date', 'asc')
		}
	}

	def getDoneTicklers = {user, realms ->
		def c = Tickler.createCriteria()
		return c.list {
			eq('done', true)
			eq('owner', user)
			'in'('realm', realms)
			order('date', 'asc')
		}
	}
	
}
