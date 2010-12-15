<html>
    <head>
        <title><g:layoutTitle default="Grails" /></title>
        <link rel="stylesheet" href="${resource(dir:'css',file:'main.css')}" />
        <link rel="stylesheet" href="${resource(dir:'css',file:'additional.css')}" />
        <link rel="stylesheet" href="${resource(dir:'css/ui-lightness',file:'jquery-ui-1.8.7.custom.css')}" />
        <link rel="shortcut icon" href="${resource(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
        <g:layoutHead />
		<g:javascript src="jquery/jquery-1.4.4.min.js"/>
		<g:javascript src="jquery/jquery-ui-1.8.7.custom.min.js"/>
		<g:javascript src="jquery/jquery.tmpl.min.js"/>
		<g:javascript>
			serverUrl = "${resource(dir:'/')}";
			realmCache = {};
			contextHtml = {};
		</g:javascript>
		<g:javascript src="application.js"/>
		<g:javascript src="more.js"/>
    </head>
    <body>
    	<g:render template="/layouts/header"/> 
    	<div id="content">
        	<g:layoutBody />
        </div>
    </body>
</html>
