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
	</head>
   <body>

	<div class='inboxOuter'>   	
   		<h2>Inbox</h2>
	   	<div class="inboxList">	
		   	<g:each in="${items}" var="item">
		   		<div class="inboxItem"><a href='javascript:;' class='inbox_link'>${item.subject}</a></div>
		   	</g:each>
	   	</div>
	   	<div class="inboxContentOuter">
	   	</div>
	</div>
   	
	<script id="inboxTemplate" type="text/x-jquery-tmpl">
	</script> 
   	
   </body>
</html>
