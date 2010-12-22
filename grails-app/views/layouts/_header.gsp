<div id="header">
     <div id="appname">{mangystud}</div>
   	 <div id="realm">
   	 	<span>REALM</span>
	   	<g:each in="${realms}" var="realm">
			<span class='realm-tab <g:if test="${realm.active}">realm-active</g:if>'>${realm.name}</span>
	   	</g:each>
	   	<span class="realm-add"> + </span>
	   	<span class="spacer"></span>
	   	<span id="Action" class="action_link new_action">+action</span> 
	   	<span id="Project" class="action_link new_project">+project</span> 
	   	<span id="Tickler" class="action_link new_tickler">+tickler</span> 
	   	<span id="Reference" class="action_link">+reference</span> 
	 </div>
</div>
