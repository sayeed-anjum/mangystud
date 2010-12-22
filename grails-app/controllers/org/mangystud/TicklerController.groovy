package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

class TicklerController {

	def add = {
		Tickler tickler = new Tickler(params)

		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByActive(true)

		tickler.owner = user;		
		tickler.realm = realm;
		
		try {
			if (tickler.save(failOnError: true)) {
				def model = [tickler: tickler, realm: realm];
				render model as JSON
			}
		} catch (Exception e) {
			render {error: "Error when saving."} as JSON
		}
	}
	
}
