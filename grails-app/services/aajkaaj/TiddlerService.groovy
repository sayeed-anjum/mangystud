package aajkaaj


import groovy.sql.Sql 
import java.io.StringWriter;

import org.eclipse.mylyn.wikitext.core.parser.MarkupParser 
import org.eclipse.mylyn.wikitext.core.parser.builder.HtmlDocumentBuilder;
import org.eclipse.mylyn.wikitext.mediawiki.core.MediaWikiLanguage 
import org.mangystud.Action 
import org.mangystud.Project 
import org.mangystud.Tickler 
import org.mangystud.Tiddler 

class TiddlerService {
	def dataSource
	
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
		
		def notesHtml = markup2Html(tiddler?.notes)
		return [tiddler: tiddler, dependsOn: dependsOn, project: project, notesHtml: notesHtml]
    }
	
	def markup2Html = {text ->
		StringWriter writer = new StringWriter();
		if (text) {
			HtmlDocumentBuilder documentBuilder = new HtmlDocumentBuilder(writer);
			documentBuilder.setEmitAsDocument false
			MarkupParser markupParser = new MarkupParser(new MediaWikiLanguage(), documentBuilder);
			markupParser.setBuilder documentBuilder
			markupParser.parse(text);
		}
		return writer.toString()
    }
	
	def makeTickler = {tid, user ->
		return convertTiddler(tid, user, Tickler.class.name)
	}
	
	def makeAction = {tid, user ->
		return convertTiddler(tid, user, Action.class.name)
	}

	def makeProject = {tid, user ->
		return convertTiddler(tid, user, Project.class.name)
	}

	def convertTiddler = {tid, user, what ->
		def db = new Sql(dataSource)
		def sql = "update tiddler set class='" + what + "' where id = " + tid + " and owner_id = " + user.id
		db.execute(sql);
		return Tiddler.findByIdAndOwner(tid, user);
	}
}
