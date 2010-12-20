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

	def addContext = {
		def realmId = params.int('realm')
		def actionId = params.int('actionId')
		def name = params.name;
		
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByIdAndUser(realmId, user)
		
		def model = [error:"realm not found!"]
		if (realm != null) {
			def context = new Context(name: name);
			realm.contexts << context;
	
			realm.save(failOnError: true)
	
			model = [context: context, realm: realm, actionId:actionId];
		}
		render model as JSON
	}

	def contexts = {
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByUser(user)
		
		def contexts = new TreeMap();
		def areas = new TreeMap();
		realms.each {
			contexts[it.id] = it.contexts;
			areas[it.id] = it.areas;
		}
		
		def model = [realms: realms, contexts: contexts, areas: areas]
		
		render model as JSON
	}
	

}
