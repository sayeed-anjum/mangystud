package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

class RealmController {
	def actionService;

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
		def model = [success: false];
		try {
			if (realm.save(failOnError: true)) {
				model.realm = realm;
				model.success = true;
			}
		} catch (Exception e) {
			model.message = e.message;
		}
		render model as JSON
	}

	def addContext = {
		def realmId = params.int('realm')
		def name = params.name;
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByIdAndUser(realmId, user)
		
		def model = [success:false, message:"realm not found!"]
		if (realm != null) {
			try {
				def context = new Context(name: name);
				realm.contexts << context;
		
				if (realm.save(failOnError: true, flush:true)) {
					model = [context: context, realm: realm, success:true];
				}
			} catch (Exception e) {
				model.message = e.message;
			}
		}
		render model as JSON
	}

	def addArea = {
		def realmId = params.int('realm')
		def name = params.name;
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findByIdAndUser(realmId, user)
		
		def model = [success:false, message:"realm not found!"]
		if (realm != null) {
			try {
				def area = new Area(name: name);
				realm.areas << area;
		
				if (realm.save(failOnError: true, flush:true)) {
					model = [area: area, realm: realm, success:true];
				}
			} catch (Exception e) {
				model.message = e.message;
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
		
		def model = [success:false, message:"realm not found!"]
		if (realm != null) {
			try {
				def contact = new Contact(name: name, email: email);
				realm.contacts << contact;
		
				if (realm.save(failOnError: true, flush:true)) {
					model = [contact: contact, realm: realm, success:true];
				}
			} catch (Exception e) {
				model.message = e.message;
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
	
	def contactDashboard = {
		def contactId = params.int("contactId")

		def model = [success: false];
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def contact = Contact.get(contactId)
		if (contact && contact.realm.user == user) {
			def tiddlers = actionService.getContactTiddlers(user, contact)
			model = [contact: contact, tiddlers: tiddlers, success: true]
		}
		
		render model as JSON
	}
}
