package aajkaaj

class ReferenceService {

    static transactional = true

	def getReferenceByProject = {user, realms ->
		def c = Reference.createCriteria()
		def result = c.list {
			isNotNull('project')
			eq('owner', user)
			'in'('realm', realms)
		}
		return result.groupBy { it.project.title }
	}

	def getOtherReferences = {user, realms ->
		def c = Reference.createCriteria()
		def result = c.list {
			isNull('project')
			eq('owner', user)
			'in'('realm', realms)
		}
		return result
	}
}
