<html>
    <head>
        <title>Inbox - aajkaaj</title>
        <meta name="layout" content="main" />
        <content tag="headerContent">
   	 		<div id="realm">
			   	<span class="spacer"></span>
			   	<span class="action_link"><g:link url="[action:'index',controller:'home']">Home</g:link></span> 
			</div>
		</content>
		<g:javascript>
		   jQuery(document).ready(function() {
		   		initMailboxTabs();
		   		refreshInbox();
		   });
		</g:javascript>
	</head>
   <body>

	<div id="tabs">
	<ul>
		<li><a href="#inboxTab">Process Inbox</a></li>
		<li><a href="#settingsTab">Settings</a></li>
	</ul>		
	<div id='inboxTab' class='inboxOuter'>
			<table>
			<tr>
			<td>
	   		<h2>Inbox</h2>
			<div id='inboxRefresh'><a href='javascript:;' class='inboxRefreshLink'>Refresh</a></div>
		   	<div id="inboxList"></div>
		   	</td>
		   	<td>
	   		<div id='inbox_action_links'>
	   			<a href='javascript:;' class='button makeTiddler action'>Make Action</a> 
	   			<a href='javascript:;' class='button makeTiddler project'>Make Project</a> 
	   			<a href='javascript:;' class='button makeTiddler tickler'>Make Tickler</a>
	   			<a href='javascript:;' class='button makeTiddler dump'>Dump It!</a>
	   		</div>
		   	<div id="inboxView"></div>
			</td>
			</tr>		   	
			</table>
	</div>
	<div id='settingsTab'>
		<h2>My Mailboxes</h2>
		<h4>Step 1) Add your mailboxes to the list below. <br>
		Step 2) Sending a mail from this email id to the VERIFICATION MAILBOX with the secret code as subject line.
		<br>Click on the email to view the secret code.</h4>
		<br/>
		<div id='mailboxRefresh'><a href='javascript:;' class='mailboxRefreshLink'>Refresh</a></div>
		<div id='mailboxes'></div>
	</div>

	<script id="messageTemplate" type="text/x-jquery-tmpl">
		{{each(i,msg) messages}}
	 		<div class="message" id='msg_{{= msg.id}}' style='display:none'>
				<h3>Subject: {{= msg.subject}}</h3>
				<textarea class='body'>{{= msg.body}}</textarea>
			</div>
	   	{{/each}}
	</script>
	
	<script id="messageListTemplate" type="text/x-jquery-tmpl">
		{{each(i,msg) messages}}
	 		<div class="inboxItem"><a href='javascript:;' class='message_link' id='ml_{{= msg.id}}'>{{= msg.subject}}</a></div>
	   	{{/each}}
	</script>
   	
	<script id="mailboxEntryTemplate" type="text/x-jquery-tmpl">
		<div class='mailboxEntry' id='mailbox_{{= mailbox.id}}'>
			<div><a class='email {{if mailbox.valid}}valid{{else}}invalid{{/if}}' href='javascript:;'>{{= mailbox.email}}</a> <span class='status'>{{if mailbox.valid}}(Verified!){{else}}(Not yet verified){{/if}}</span> <span class='links'><a href='javascript:;' class='deleteMailbox' title='delete mailbox'>x</a></span></div>
			<div class='secret' style='display:none'>{{= mailbox.digest}}</div>
		</div>
	</script> 

	<script id="mailboxTemplate" type="text/x-jquery-tmpl">
		<div id='mailboxList'>
		{{each(i, mailbox) mailboxes}}
			{{tmpl({mailbox:mailbox}) '#mailboxEntryTemplate'}}
		{{/each}}
		<div class='mailboxEntry' id='mailbox_0'>
			* <input class='newMailboxEntry' type='text' name='email' value='' size='50' maxLength=200' title="Type new email address and press ENTER key"> 
		</div>
		</div>
	</script>
   </body>
</html>
