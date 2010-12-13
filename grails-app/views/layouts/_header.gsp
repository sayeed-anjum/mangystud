<div id="header">
     <div id="appname">{mangystud}</div>
   	 <div id="realm">
   	 	<span>REALM</span>
	   	<g:each in="${realms}" var="realm">
			<span class='realm-tab <g:if test="${realm.active}">realm-active</g:if>'>${realm.name}</span>
	   	</g:each>
	   	<span class="realm-add"> + </span>
	   	<span class="spacer"></span>
	   	<span id="Action" class="action_link">+action</span> 
	   	<span id="Project" class="action_link">+project</span> 
	   	<span id="Tickler" class="action_link">+tickler</span> 
	   	<span id="Reference" class="action_link">+reference</span> 
	 </div>
</div>

<div id="realm_dialog" style="display:none">
	<g:formRemote url="[controller:'realm',action:'add']" 
          update="[success:'message',failure:'error']" name="newRealmForm"
          onSuccess="realmSaveSuccessHandler(data, textStatus)">
      	<input type="text" id="realm_name" name="name" value="" size="40" maxSize="25"/>
	</g:formRemote >
</div>
