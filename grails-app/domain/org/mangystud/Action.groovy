package org.mangystud

class Action extends Tiddler {

	def addContext = {context ->
		if (!contexts.contains(context)) contexts << context
	}

	def removeContext = {context ->
		contexts.remove(context)
	}

}
