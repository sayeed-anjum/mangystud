package aajkaaj

import javax.mail.*
import javax.mail.search.*
import java.util.Properties

class InboxService {
	static transactional = true
	def inboxSettings
	
	def readMailbox = {
		def imap = inboxSettings
		
		if (imap.host == '') {
			return;
		}
		
		Properties props = new Properties()
		props.setProperty("mail.store.protocol", "imap")
		props.setProperty("mail.imap.host", imap.host)
		props.setProperty("mail.imap.port", "${imap.port}")
		def session = Session.getDefaultInstance(props, null)
		def username = imap.user 
		def password = imap.password 
		def store = session.getStore("imap")
		def inbox
		
		try {
			store.connect(imap.host, username, password)
			println "connected to mailbox!"
			inbox = store.getFolder("INBOX")
			inbox.open Folder.READ_ONLY
			def messages = inbox.search(
				new FlagTerm(new Flags(Flags.Flag.SEEN), false))
			messages.each { msg ->
				println("${msg.subject} ${msg.sender}")
				// msg.setFlag(Flags.Flag.SEEN, true)
			}
		} finally {
			if(inbox) {
				inbox.close(true)
			}
			store.close()
		}
	}
}	