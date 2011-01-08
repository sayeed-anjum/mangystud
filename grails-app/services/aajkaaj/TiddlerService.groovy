package aajkaaj


import java.io.StringWriter;

import org.eclipse.mylyn.internal.wikitext.core.parser.builder.SplittingHtmlDocumentBuilder 
import org.eclipse.mylyn.wikitext.core.parser.MarkupParser 
import org.eclipse.mylyn.wikitext.core.parser.builder.HtmlDocumentBuilder;
import org.eclipse.mylyn.wikitext.mediawiki.core.MediaWikiLanguage 
import org.mangystud.Action 
import org.mangystud.Project 
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
	
}
