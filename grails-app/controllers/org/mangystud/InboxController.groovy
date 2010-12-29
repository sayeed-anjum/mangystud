package org.mangystud


import aajkaaj.InboxMessage;
import aajkaaj.Mailbox 
import grails.converters.JSON 
import grails.validation.ValidationException;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.shiro.SecurityUtils 

class InboxController {
	def realmService

    def index = { 
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		return [user: user];
	}
	
	def mailboxes = {
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def items = Mailbox.findAllByOwner(user)
		def model = [mailboxes: items]
		render model as JSON
	}

	def list = {
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def items = InboxMessage.findAllByOwnerAndProcessed(user, false)
		def model = [messages: items]
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
	
	def make = {
		def messageId = params.int('id')
		def type = params.type
		Person user = Person.get(SecurityUtils.getSubject()?.getPrincipal())
		
		def msg = InboxMessage.findByOwnerAndId(user, messageId)
		def model = [success: false]
		if (msg) {
			def realm = realmService.getActiveRealm(user)
			def values = [owner: msg.owner, realm: realm, title: msg.subject, notes: msg.body];
			try {
				switch (type) {
					case "dump":
						msg.delete();
						break;
					case "action":
						new Action(values).save(failOnError: true)
						break;
					case "project":
						new Project(values).save(failOnError: true)
						break;
					case "tickler":
						new Tickler(values).save(failOnError: true)
						break;
				}
				if (type != "dump") {
					msg.processed = true;
					msg.save();
				}
				model.success = true
			} catch (ValidationException e) {
				model.message = e.message
			}
		} else {
			model.message = "Cannot locate inbox message for processing"
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
	
}
