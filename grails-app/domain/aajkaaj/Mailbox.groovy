package aajkaaj

import java.util.Date;
import org.mangystud.Person 

class Mailbox {

    static constraints = {
		email(email:true, maxSize:200,nullable: false)
		digest(maxSize:200,nullable:false)
		owner(nullable:false)
    }
	
	String email
	boolean valid
	String digest
	Person owner
	
	Date lastUpdated
	Date dateCreated
}
