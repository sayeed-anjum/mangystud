package mangystud

import org.mangystud.Tickler 

class TicklerService {

    static transactional = true

    def updateTicklerStatus() {
		def tomorrow = new Date() + 1;
		def result = Tickler.executeUpdate("update Tickler t set t.overdue = true where t.overdue = false and t.done = false and t.date < ?", [tomorrow]);
    }
}
