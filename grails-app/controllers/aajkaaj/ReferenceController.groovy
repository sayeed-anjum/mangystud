package aajkaaj

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 
import org.mangystud.Person 
import org.mangystud.Realm 
import org.owasp.esapi.ESAPI 
import org.owasp.esapi.Validator 

class ReferenceController {
	def realmService
	def referenceService
	def tiddlerService
	
	def add = {
		Reference reference = new Reference(params)

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = realmService.getActiveRealm(user)

		reference.owner = user;		
		reference.realm = realm;
		Validator instance = ESAPI.validator();
		reference.title = instance.getValidSafeHTML("title", reference.title, 100, false)
		
		def model = [success: false]
		try {
			if (reference.validate()) {
				reference.save(failOnError: true)
				model = [reference: reference, realm: realm, success: true]
			} else {
				model.message = "The input validation failed!"
			}
		} catch (Exception e) {
			model.message = e.message;
		}

		render model as JSON
	}

	def view = {
		def tid = params.int("id")

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def model = tiddlerService.tiddlerViewModel(user, tid)
		
		render model as JSON
	}
	
	def dashboard = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def projectReferences = []
		def otherReferences = []
		if (realms.size() > 0) {
			projectReferences = referenceService.getReferenceByProject(user, realms)
			otherReferences = referenceService.getOtherReferences(user, realms)
		}
		
		def model = [project: projectReferences, others: otherReferences]
		
		render model as JSON
	}
	
}
