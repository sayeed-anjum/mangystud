
import org.mangystud.Context 
import org.mangystud.Realm 

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
		if (!Realm.count()) {
			new Realm(name: "Work").save(failOnError: true)
			new Realm(name: "Home").save(failOnError: true)
		}
		initContext "Work", ["Phone", "Email", "Offline"]
		initContext "Home", ["Call", "Play", "Chore"]
    }
    def destroy = {
    }
}
