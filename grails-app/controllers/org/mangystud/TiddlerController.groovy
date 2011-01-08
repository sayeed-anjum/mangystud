package org.mangystud

import org.apache.commons.lang.StringUtils;
import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 
import org.owasp.esapi.ESAPI 
import org.owasp.esapi.Validator 

class TiddlerController {
	
	def update = {
		def tid = params.int("id")
		def type = params.type
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())

		def tiddler = getUpdator(type)(user, tid, params)
		
		def model = [success: true, tiddler: tiddler, realm: tiddler.realm]
		render model as JSON
	}
	
	def getUpdator = {type ->
		switch (type) {
			case 'contact':
				return updateContact
			default:
				return updateTiddler 
		}
	}
	
	def updateTiddler = {user, tid, params ->
		def title = params.title;
		def content = params.content
		
		title = StringUtils.abbreviate(title, 100)
		content = StringUtils.abbreviate(content, 2000)

		Validator instance = ESAPI.validator();
		title = instance.getValidSafeHTML("title", title, 100, false)
		content = content != ''? instance.getValidSafeHTML("content", content, 2000, false) : ""
		
		def tiddler = Tiddler.findByOwnerAndId(user, tid)
		
		tiddler.title = title
		tiddler.notes = content
		
		if (tiddler.validate()) {
			tiddler.save(failOnError: true)
		}
		
		return tiddler;
	}
	
	def updateContact = {user, tid, params ->
		def title = params.title
		def content = params.content
		def email = params.email

		def contact = Contact.get(tid)
		
		if (contact && contact.realm.user == user) {
			contact.name = title;
			contact.notes = content;
			contact.email = email;
			contact.save(failOnError: true)
		}
		
		return contact;
	} 
		
	
	def realmChange = {
		def actionId = params.int("id")
		def realmId = params.int("realm")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = Realm.findById(realmId);
		
		if (realm == null || realm.user != user) {
			String message = "Not a valid realm id: " + realmId;
			return message as JSON
		}
		
		def tiddler = Tiddler.findByOwnerAndId(user, actionId)
		
		if (tiddler) {
			tiddler.realm = realm
			tiddler.save(failOnError: true)
		}
		
		def model = [success: true]
		render model as JSON
	}

	def areaUpdate = {
		def oid = params.int("id")
		def areaId = params.int("area")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def area = areaId == 0? null : Area.findById(areaId);
		
		def tiddler = Tiddler.findByOwnerAndId(user, oid)
		
		if (tiddler) {
			tiddler.area = area
			tiddler.save(failOnError: true)
		}
		
		def model = [success: true]
		render model as JSON
	}

	def contactUpdate = {
		def oid = params.int("id")
		def contactId = params.int("contact")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def contact = contactId == 0? null : Contact.findById(contactId);
		
		def tiddler = Tiddler.findByOwnerAndId(user, oid)
		
		if (tiddler) {
			tiddler.contact = contact
			tiddler.save(failOnError: true)
		}
		
		def model = [success: true]
		render model as JSON
	}

	def remove = {
		def tid = params.int("id")
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def tiddler = Tiddler.findByOwnerAndId(user, tid)
		
		def childItems = Tiddler.findAllByProject(tiddler);
		def dependents = Tiddler.findAllByDependsOn(tiddler);
		
		if (childItems.size() > 0 || dependents.size() > 0) {
			def model = [success: false, message: 'Cannot delete due to references!']
			render model as JSON
		}  
		
		if (tiddler) {
			tiddler.delete()
		}
		
		def model = [success: true]
		render model as JSON
	}

	def toggleStar = {
		def tid = params.int("id")
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def tiddler = Tiddler.findByOwnerAndId(user, tid)
		
		def model = [success: false]
		if (tiddler) {
			tiddler.star = !tiddler.star;
			model.success = true;
		}
		render model as JSON
	}

	def complete = {
		def tid = params.int("id")
		def done = params.boolean("done")
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def tiddler = Tiddler.findByOwnerAndId(user, tid)
		
		def model = [success: false]
		if (tiddler) {
			tiddler.done = done;
			tiddler.save(failOnError: true)
			model.success = true;
		}
		
		render model as JSON
	}
	
	def projectUpdate = {
		def tid = params.int("id")
		def projectId = params.int("projectId")
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def tiddler = Tiddler.findByOwnerAndId(user, tid)
		def project = Project.findByOwnerAndId(user, projectId)
		
		if (tiddler && project) {
			tiddler.project = project
			tiddler.save(failOnError: true)
		}	
		
		def model = [success: true]
		render model as JSON
	}

	def deleteProject = {
		def tid = params.int("id")

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def tiddler = Tiddler.findByOwnerAndId(user, tid)
		
		if (tiddler) {
			tiddler.project = null
			tiddler.save(failOnError: true)
		}

		def model = [success: true]
		render model as JSON
	}

}
