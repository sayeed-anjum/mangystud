<html>
    <head>
        <title><g:layoutTitle default="Grails" /></title>
        <link rel="stylesheet" href="${resource(dir:'css',file:'main.css')}" />
        <link rel="stylesheet" href="${resource(dir:'css/ui-lightness',file:'jquery-ui-1.8.7.custom.css')}" />
        <link rel="shortcut icon" href="${resource(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
        <g:layoutHead />
		<g:javascript library="jquery" plugin="jquery"/>
		<g:javascript src="jquery/jquery-ui-1.8.7.custom.min.js"/>
		<g:javascript src="application.js"/>
    </head>
    <body>
    	<g:render template="/layouts/header"/> 
    	<div id="content">
        	<g:layoutBody />
        </div>
        
        <div id="tiddler_dialog" style="display:none">
			<g:formRemote url="[controller:'tiddler',action:'add']" 
			          update="[success:'message',failure:'error']" name="newTiddlerForm"
			          onSuccess="tiddlerSaveSuccessHandler()">
	        	<input type="hidden" id="tiddlerType" name="type" value=""/>
	        	<input type="text" id="tiddler_title" name="title" value="" size="50"/>
			</g:formRemote >
        </div>
    </body>
</html>
