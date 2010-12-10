package org.mangystud

class HomeController {

    def index = { 
		def realms = Realm.list();
		def contexts = Context.list();
		def actions = Action.list();
		
		return [realms : realms, contexts: contexts, actions: actions ];
	}
}
