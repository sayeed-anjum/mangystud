package org.mangystud

import org.apache.shiro.SecurityUtils 

class HomeController {
	def realmService

    def index = { 
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())

		def realms = realmService.getRealms(user)
		if (realms.count() == 0) {
			realmService.initialize(user)
			realms = realmService.getRealms(user)
		}
		def isAdmin = SecurityUtils.getSubject()?.hasRole('SYSTEM ADMINISTRATOR')
		
		return [user: user, realms : realms, isAdmin: isAdmin];
	}
}
