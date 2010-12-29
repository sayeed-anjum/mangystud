package org.mangystud

class Project extends Tiddler {
	def beforeDelete = {
		def result = Tickler.executeUpdate("update Tickler t set t.project = null where t.project = ?", [this]);
	 }
}
