
import org.mangystud.Context 
import org.mangystud.Realm 
import org.mangystud.User 

class BootStrap {
	def initContext = { realmName, items ->
		Realm realm = Realm.findByName(realmName);
		if (realm != null) {
			def results = Context.findAllByRealm(realm);
			if (results.size() == 0) {
				items.each { 
					new Context(realm:realm, name: it).save(failOnError: true)
				}
			}
		}
	}
	
    def init = { servletContext ->
    }

	def destroy = {
    }
}
