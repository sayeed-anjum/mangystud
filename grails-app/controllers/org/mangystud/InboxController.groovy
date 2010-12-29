package org.mangystud


import aajkaaj.Inbox;
import aajkaaj.Mailbox 
import grails.converters.JSON 
import grails.validation.ValidationException;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.shiro.SecurityUtils 

class InboxController {

    def index = { 
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def items = Inbox.findAllByOwnerAndProcessed(user, false)
		return [user: user, items: items];
	}
	
	def mailboxes = {
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def items = Mailbox.findAllByOwner(user)
		def model = [mailboxes: items]
		render model as JSON
	}

	def saveMailbox = {
		def email = params.email
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())

		def mailbox = Mailbox.findByEmail(email)
		def model = []
		if (!user || mailbox) {
			model = [success: false, message: 'Mailbox already exists!']
		} else {
			def s = user.getUsername() + System.currentTimeMillis() + email
			def digest = DigestUtils.sha256Hex(s)
			try {
				mailbox = new Mailbox(owner: user, email: email, digest: digest).save(failOnError: true)
				model = [mailbox: mailbox, success: true]
			} catch (ValidationException e) {
				model = [success: false, message: 'Email format is not valid!']
			}
		}
		
		render model as JSON
	}
	
	def deleteMailbox = {
		def mailboxId = params.int('id')
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())

		def mailbox = Mailbox.findByOwnerAndId(user, mailboxId)
		def model = [success: false]
		if (mailbox) {
			mailbox.delete()
			model.success = true
		}

		render model as JSON
	}
	
	def getDigest = {
		def mailboxId = params.int('id')
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def mailbox = Mailbox.findByOwnerAndId(user, mailboxId)

		def model = [digest: mailbox.digest] 
		render model as JSON
	}
	
	
}
