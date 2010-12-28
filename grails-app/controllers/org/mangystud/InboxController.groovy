package org.mangystud

import aajkaaj.Inbox;
import org.apache.shiro.SecurityUtils 

class InboxController {

    def index = { 
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def items = Inbox.findAllByOwnerAndProcessed(user, false)
		return [user: user, items: items];
	}
}
