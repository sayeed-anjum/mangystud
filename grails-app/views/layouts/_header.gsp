<div id="header">
     <div id="appname"><p:image src='logo.png' alt='aajkaaj'/></div>
	 <div id="user"><g:message code="nimble.label.usergreeting" /> <n:principalName /> |
	 <g:if test="${isAdmin}"><a href='${resource(dir:'/')}administration/users/list'>User Admin</a> | </g:if>  
	 <g:link controller="auth" action="logout" class="logout"><g:message code="nimble.link.logout.basic" /></g:link></div>
   	 <div id="realm">
   	 	<span class='rlabel'>REALM</span>
	   	<g:each in="${realms}" var="realm">
			<span class='realm-tab <g:if test="${realm.active}">realm-active</g:if>'>${realm.name}</span>
	   	</g:each>
	   	<span class="realm-add"> + </span>
	   	<span class="spacer"></span>
	   	<span id="ticklerAlert" class="action_link ticklers_pending" style='display:none'><blink>*ticklers*</blink></span> 
	   	<span class="spacer"></span>
	   	<span id="Action" class="action_link new_action">+action</span> 
	   	<span id="Project" class="action_link new_project">+project</span> 
	   	<span id="Tickler" class="action_link new_tickler">+tickler</span> 
	   	<span id="Reference" class="action_link">+reference</span> 
	 </div>
</div>
