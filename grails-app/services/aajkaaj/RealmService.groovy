package aajkaaj

import org.mangystud.Area 
import org.mangystud.Contact 
import org.mangystud.Context 
import org.mangystud.Realm 

class RealmService {

    static transactional = true

	def getActiveRealm = {user ->
		return Realm.findByUserAndActive(user, true)
    }

	def getRealms = {user ->
		def realms = Realm.findAllByUser(user)
		return realms
	}

    def initialize = {user ->
		createRealm "Work", user, ["Phone", "Email", "Meeting", "Offline"]
		createRealm "Home", user, ["Call", "Home Maintenance", "Bills", "Outdoors", "Chore"]
    }

	def createRealm = {name, user, contextNames ->
		def realm = Realm.findByNameAndUser(name, user)
		if (!realm) {
			println "creating new realm: ${name} for ${user.username}" 
			def contexts = contextNames.collect {new Context(name: it)}
			new Realm(name: name, user: user, contexts: contexts).save(failOnError: true, flush:true)
		}
	}
  
}
