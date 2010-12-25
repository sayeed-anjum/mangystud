package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

class RealmController {

    def toggle = {
		def name= params.name;
		def active = params.boolean('active')
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByNameAndUser(name, user);
		realm.active = active;
		
		realm.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}

	def add = {
		def name = params.name
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def realm = new Realm(name:name, user:user)
		def model = [];
		if (realm.save(failOnError: true)) {
			model.realm = realm;
		}
		render model as JSON
	}

	def addContext = {
		def realmId = params.int('realm')
		def name = params.name;
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByIdAndUser(realmId, user)
		
		def model = [error:"realm not found!"]
		if (realm != null) {
			def context = new Context(name: name);
			realm.contexts << context;
	
			if (realm.save(failOnError: true, flush:true)) {
				model = [context: context, realm: realm];
			}
		}
		render model as JSON
	}

	def addArea = {
		def realmId = params.int('realm')
		def name = params.name;
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByIdAndUser(realmId, user)
		
		def model = [error:"realm not found!"]
		if (realm != null) {
			def area = new Area(name: name);
			realm.areas << area;
	
			if (realm.save(failOnError: true, flush:true)) {
				model = [area: area, realm: realm];
			}
		}
		render model as JSON
	}

	def addContact = {
		def realmId = params.int('realm')
		def name = params.name;
		def email = params.email;
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByIdAndUser(realmId, user)
		
		def model = [error:"realm not found!"]
		if (realm != null) {
			def contact = new Contact(name: name, email: email);
			realm.contacts << contact;
	
			if (realm.save(failOnError: true, flush:true)) {
				model = [contact: contact, realm: realm];
			}
		}
		render model as JSON
	}

	def contexts = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByUser(user)
		
		def contexts = new TreeMap();
		def areas = new TreeMap();
		def contacts = new TreeMap();
		realms.each {
			contexts[it.id] = it.contexts;
			areas[it.id] = it.areas;
			contacts[it.id] = it.contacts;
		}
		
		def model = [realms: realms, contexts: contexts, areas: areas, contacts : contacts]
		
		render model as JSON
	}
}
