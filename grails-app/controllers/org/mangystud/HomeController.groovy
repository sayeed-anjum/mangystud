package org.mangystud

import org.apache.shiro.SecurityUtils 

class HomeController {

    def index = { 
		def realms = Realm.list();
		def contexts = Context.list();
		def actions = Action.list();
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		return [user: user, realms : realms, contexts: contexts, actions: actions ];
	}
}
