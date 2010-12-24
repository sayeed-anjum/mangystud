<html>
    <head>
        <title><g:layoutTitle default="Grails" /></title>
        <p:css name='bundled'/>
        <link rel="shortcut icon" href="${resource(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
		<p:javascript src="jquery/jquery-1.4.4.min"/>
		<p:javascript src="jquery/jquery-ui-1.8.7.custom.min"/>
		<p:javascript src="jquery/jquery.tmpl.min"/>
<%-- 		
        <link rel="stylesheet" href="${resource(dir:'css/ui-lightness',file:'jquery-ui-1.8.7.custom.css')}" />
		<p:javascript src="dialogs.js"/>
		<p:javascript src="dashboard.js"/>
		<p:javascript src="application.js"/>
--%>
		<p:javascript src="app.all"/>
		<g:javascript>
			serverUrl = "${resource(dir:'/')}";
		</g:javascript>
        <g:layoutHead />
    </head>
    <body>
    	<g:render template="/layouts/header"/> 
    	<div id="content">
        	<g:layoutBody />
        </div>
    </body>
</html>
