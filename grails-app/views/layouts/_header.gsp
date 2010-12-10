<div id="header">
     <div id="appname">{mangystud}</div>
   	 <div id="realm">
   	 	<span>REALM</span>
	   	<g:each in="${realms}" var="realm">
			<span class='realm <g:if test="${realm.active}">realm-active</g:if>'>${realm.name}</span>
	   	</g:each>
	   	<span class="realm"> + </span>
	   	<span class="spacer"></span>
	   	<span class="button">+action</span> 
	   	<span class="button">+project</span> 
	   	<span class="button">+tickler</span> 
	   	<span class="button">+reference</span> 
	 </div>
</div>
