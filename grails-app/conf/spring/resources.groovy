import aajkaaj.MailboxInfo;

import org.mangystud.CustomDateEditorRegistrar 

// Place your Spring DSL code here
beans = {
	customPropertyEditorRegistrar(CustomDateEditorRegistrar)
	
	inboxSettings(MailboxInfo)
	verifyInboxSettings(MailboxInfo)
}