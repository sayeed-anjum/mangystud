package aajkaaj

import java.util.Date;
import org.mangystud.Person 
import org.mangystud.Tiddler 

class InboxMessage {

    static constraints = {
		source(nullable: false)
		subject(maxSize:200,nullable:false)
		body(maxSize:2000, nullable:true)
		tiddler(nullable:true)
		owner(nullable: true)
    }
	
	String source
	String subject
	String body
	
	boolean processed
	Tiddler tiddler
	Person owner
	
	Date lastUpdated
	Date dateCreated
}
