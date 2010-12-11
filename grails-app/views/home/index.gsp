<html>
    <head>
        <title>Welcome to mangystud!</title>
        <meta name="layout" content="main" />
       	<p:dependantJavascript>		</p:dependantJavascript>
		<g:javascript library="jquery"/>
		<g:javascript library="jquery" plugin="jquery-ui"/>
	</head>
   <body>
   		<div id="stage">
   		</div>

        <div id="tiddler_dialog" style="display:none">
			<g:formRemote url="[controller:'tiddler',action:'add']" 
			          update="[success:'message',failure:'error']" name="newTiddlerForm"
			          onSuccess="tiddlerSaveSuccessHandler(data, textStatus)">
	        	<input type="hidden" id="tiddlerType" name="type" value=""/>
	        	<input type="text" id="tiddler_title" name="title" value="" size="50"/>
			</g:formRemote >
        </div>
        
        <div id="template" style="display:none">
        	<div id="action_div_template" class="tiddler">
        		<div class="toolbar">
					<span style="padding: 1em;"></span>
					<span>
						<a name="closeTiddler" class="button command_closeTiddler" title="Close this tiddler" href="javascript:;">close</a>
						<a name="closeOthers" class="button command_closeOthers" title="Close all other tiddlers" href="javascript:;">close others</a>
						<a name="editTiddler" class="button command_editTiddler defaultCommand" title="Edit this tiddler" href="javascript:;">edit</a>
						<a name="deleteTiddler" class="button command_deleteTiddler" title="Delete this tiddler" href="javascript:;">delete</a>
					</span>
					<span><a name="newHere" class="button" title="Create a new tiddler" href="javascript:;">new here</a></span>
					<span style="padding: 1em;"></span>
        		</div>
       			<form class="viewer">
       				<div class="smaller" style="float: right;">
						<span class="label">Realm:</span>
						<span class="realm_select"></span>
 					</div>
 					<div>
	       				<span class="tick"><input type="checkbox" name="action_done"/></span>
	       				<span class="title"></span>
	       				<span><a class="button Starred off" title="Starred" href="javascript:;">★</a></span>
	       				<span class="subtitle"></span>
					</div>
					<div class="state">
						<a class=" button Next on" title="Next" href="javascript:;">next</a>
						<a class=" button WaitingFor off" title="Waiting For" href="javascript:;">waiting for</a>
						<a class=" button Future off" title="Future" href="javascript:;">future</a>
					</div>
       			</form>
        	</div>
        	
        	<div id="realm_select_template">
        		<select name="realm">
       				<option value="">-</option>
        			<option value="__new__">New Realm...</option>
        			<g:each in="${realms}" var="realm">
						<option value="${realm.name}">${realm.name}</span>
	   				</g:each>
       			</select>
        	</div>
        </div>

   </body>


</html>

