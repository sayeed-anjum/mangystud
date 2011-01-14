package aajkaaj

import org.apache.commons.lang.StringUtils;
import org.owasp.esapi.ESAPI 
import org.owasp.esapi.Validator 

import javax.mail.*
import javax.mail.search.*
import java.util.Properties

class InboxService {
	static transactional = true
	def inboxSettings
	def verifyInboxSettings
	
	def readEmails = {
		readEmailsForId inboxSettings, processInboxMessage
	}
	
	def readVerifyEmails = {
		readEmailsForId verifyInboxSettings, verifyMailbox
	}


	def readEmailsForId = {imap, callback ->
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
			inbox = store.getFolder("INBOX")
			inbox.open Folder.READ_WRITE
			def messages = inbox.search(
				new FlagTerm(new Flags(Flags.Flag.SEEN), false))
			messages.each { msg ->
				callback msg
				msg.setFlag(Flags.Flag.SEEN, true)
			}
		} catch (Exception e) {
			log.error "error when reading emails: \n" + e.message
		} finally {
			if(inbox) {
				inbox.close(true)
			}
			store.close()
		}
	}
	
	def processInboxMessage = {msg ->
		def from = msg.from.address[0]
		def subject = msg.subject
		def body = getText(msg)

		Validator instance = ESAPI.validator();
		subject = subject.length() > 0? instance.getValidSafeHTML("subject", subject, 100, false) : ""
		def mailbox = Mailbox.findByEmailAndValid(from, true);
		if (mailbox) {
			log.debug "Saving new message from source: ${from} - subject: ${subject} owner: ${mailbox.owner.username}"
			def text = StringUtils.abbreviate(body, 1999);
			text = instance.getValidSafeHTML("body", text, 1999, false)
			new InboxMessage(source: from, subject: subject, body: text, owner: mailbox.owner).save(failOnError: true, flush:true)
		} else {
			log.warn "Unable to locate a mailbox for source: ${from} - subject: ${subject}"
		}
	}

	def verifyMailbox = {msg ->
		def from = msg.from.address[0]
		def subject = msg.subject
		Validator instance = ESAPI.validator();
		subject = subject.length() > 0? instance.getValidSafeHTML("subject", subject, 100, false) : ""
		def mailbox = Mailbox.findByEmailAndDigest(from, subject);
		if (mailbox) {
			mailbox.valid = true
			mailbox.save()
		} else {
			log.warn "Unable to validate the message for source: ${from} - subject: ${subject}"
		}
	}
	
	def getText = {p ->
        if (p.isMimeType("text/*")) {
            String s = (String)p.getContent();
            return s;
        }

        if (p.isMimeType("multipart/alternative")) {
            // prefer plain text over html
            Multipart mp = (Multipart)p.getContent();
            String text = null;
            for (int i = 0; i < mp.getCount(); i++) {
                Part bp = mp.getBodyPart(i);
                if (bp.isMimeType("text/plain")) {
                    if (text == null)
                        text = getText(bp);
                    return text;
                } else if (bp.isMimeType("text/html")) {
                    String s = getText(bp);
					continue;
                } else {
                    return getText(bp);
                }
            }
            return text;
        } else if (p.isMimeType("multipart/*")) {
            Multipart mp = (Multipart)p.getContent();
            for (int i = 0; i < mp.getCount(); i++) {
                def result = getText(mp.getBodyPart(i));
                if (result != null)
                    return result;
            }
        }

        return null;
    }
}	