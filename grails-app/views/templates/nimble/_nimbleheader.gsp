<div id="header">
    <div id="appname"><img src='${resource(dir:'images',file:'logo.png')}' alt='aajkaaj'/></div>
	
	<g:if test="${navigation}">
		<n:isLoggedIn>
			<div id="userops">
				<g:message code="nimble.label.usergreeting" /> <n:principalName /> | <g:link controller="home" action="index">Home</g:link> | <g:link controller="auth" action="logout" class=""><g:message code="nimble.link.logout.basic" /></g:link>
			</div>
		</n:isLoggedIn>
	</g:if>
</div>