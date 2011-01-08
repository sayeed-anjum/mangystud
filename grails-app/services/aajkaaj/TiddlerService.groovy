package aajkaaj

import org.mangystud.Tiddler 

class TiddlerService {

    static transactional = true

    def tiddlerViewModel = {user, tid ->
		def tiddler = Tiddler.findByOwnerAndId(user, tid)
		
		def dependsOn = null
		if (tiddler?.dependsOn) {
			dependsOn = Action.findByOwnerAndId(user, tiddler.dependsOn.id)
		}
		def project = null
		if (tiddler?.project) {
			project = Project.findByOwnerAndId(user, tiddler.project.id)
		}
		
		def notes = "";

		return [tiddler: tiddler, dependsOn: dependsOn, project: project, notes: notes]
    }
	
}
