package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

class RealmController {

    def toggle = {
		def name= params.name;
		def active = params.boolean('active')
		
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByNameAndUser(name, user);
		realm.active = active;
		
		realm.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}

	def add = {
		def name = params.name
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def realm = new Realm(name:name, user:user)
		try {
			if (realm.save(failOnError: true)) {
				def model = [realm: realm];
				render model as JSON
			}
		} catch (Exception e) {
			render {error: "Error when saving."} as JSON
		}
	}

}
