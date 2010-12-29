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
	   		<h2>Inbox</h2>
		   	<div class="inboxList">	
			   	<g:each in="${items}" var="item">
			   		<div class="inboxItem"><a href='javascript:;' class='inbox_link'>${item.subject}</a></div>
			   	</g:each>
		   	</div>
		   	<div class="inboxContentOuter">
		   	</div>
	</div>
	<div id='settingsTab'>
		<h2>My Mailboxes</h2>
		<h4>Step 1) Add your mailboxes to the list below. <br>
		Step 2) Sending a mail from this email id to the VERIFICATION MAILBOX with the secret code as subject line.
		<br>Click on the email to view the secret code.</h4>
		<br/>
		<div id='mailboxes'>
		</div>
	</div>   	
   	
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
			* <input class='newMailboxEntry' type='text' name='email' value='' size='50' maxLength=200'> 
		</div>
		</div>
	</script>
   </body>
</html>
