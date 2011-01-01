package aajkaaj

import java.util.Date;
import org.mangystud.Person 
import org.mangystud.Tiddler 

class InboxMessage {

    static constraints = {
		source(nullable: false)
		subject(maxSize:200,nullable:false)
		type(nullable: true)
		body(maxSize:2000, nullable:true)
		tiddler(nullable:true)
		owner(nullable: true)
    }
	
	MessageType type = MessageType.Mail;
	String source
	String subject
	String body
	
	boolean processed
	Tiddler tiddler
	Person owner
	
	Date lastUpdated
	Date dateCreated
}
