package mangystud

import groovy.sql.Sql 
import org.mangystud.Action 
import org.mangystud.Tickler 

class TicklerService {
	def dataSource
	
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
		def db = new Sql(dataSource)
		def sql = "update tiddler set class='" + Action.class.name + "' where id = " + ticklerId
		db.execute(sql);
		return Action.findByIdAndOwner(ticklerId, user);
	}

}
