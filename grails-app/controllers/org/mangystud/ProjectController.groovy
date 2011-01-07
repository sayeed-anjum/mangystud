package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

class ProjectController {

	def realmService
	def actionService
	
	def add = {
		def title = params.title.encodeAsSanitizedMarkup()
		def status = params.status
		
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realm = realmService.getActiveRealm(user)
		
		def model = [success: false]
		if (realm == null) {
			model.message = "No active realm found!"
			render model as JSON
			return;
		}
		try {
			Project project = new Project(title:title, realm:realm, owner:user)
			def projectStatus = ProjectStatus.valueOf(status?:"Active");
			if (projectStatus) {
				project.projectStatus = projectStatus;
			}
			if (project.validate()) {
				project.save(failOnError: true)
				model = [project: project, realm: realm, success:true]
			} else {
				model.message = "The input validation failed!"
			}
		} catch (Exception e) {
			model.message = e.message
		}
		
		render model as JSON
	}
	
	def view = {
		def projectId = params.int("projectId")

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def project = Project.findByOwnerAndId(user, projectId)
		
		def tiddlers = actionService.getProjectTiddlers(user, project)
		
		def model = [project: project, tiddlers: tiddlers]
		
		render model as JSON
	}

	def complete = {
		def projectId = params.int("projectId")
		def done = params.boolean("done")

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def project = Project.findByOwnerAndId(user, projectId)
		
		project.done = done;
		project.save(failOnError: true)
		
		def model = [success: true]
		render model as JSON
	}

	def dashboard = {
		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def realms = Realm.findAllByActiveAndUser(true, user)
		
		def result2 = []
		def doneProjects = []
		if (realms.size() > 0) {
			result2 = actionService.getProjectsByTypeAndRealms(user, [ProjectStatus.Active, ProjectStatus.Someday], realms)
			doneProjects = actionService.getCompletedProjects(user, realms)
		}
		
		def model = [state: result2, done: doneProjects]
		
		render model as JSON
	}

	def updateStatus = {
		def projectId = params.int("id")
		def status = params.status

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		Project project = Project.findByOwnerAndId(user, projectId)
		
		def model = [success: false]
		if (project) {
			project.projectStatus = ProjectStatus.valueOf(status);
			model.success = true;
		}

		render model as JSON
	}

	def search = {
		def term = params.term;

		def user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		def projects = Project.findAllByOwnerAndTitleLike(user, "%${term}%");		
		def result = projects.collect {
				return [value: it.id, label: it.title]
		}
		
		render result as JSON
	}
	
}
