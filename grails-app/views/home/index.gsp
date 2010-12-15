<html>
    <head>
        <title>Welcome to mangystud!</title>
        <meta name="layout" content="main" />
		<g:javascript>
			actionViewTemplate = {};
		</g:javascript>
	</head>
   <body>
   		<div id="sidebar">
   			<div id="sidebarTabs">
	   			<div class="tabContents">
		   			<a class="tiddlyLink tiddlyLinkExisting" href="javascript:;" tiddlylink="tl_nextActions">Next Actions</a>
		   			<a class="tiddlyLink tiddlyLinkExisting" href="javascript:;" tiddlylink="tl_nextAndWaiting">Next &amp; Waiting Actions</a>
		   			<a class="tiddlyLink tiddlyLinkExisting" href="javascript:;" tiddlylink="tl_actionDashboard">Action Dashboard</a>
	   			</div>
   			</div>
   		</div>
   		
   		<div id="stage">
   		</div>

        <div id="tiddler_dialog" style="display:none">
			<g:formRemote url="[controller:'action',action:'add']" 
			          update="[success:'message',failure:'error']" name="newTiddlerForm"
			          onSuccess="tiddlerSaveSuccessHandler(data, textStatus)">
	        	<input type="hidden" id="tiddlerType" name="type" value=""/>
	        	<input type="text" id="tiddler_title" name="title" value="" size="40"/>
			</g:formRemote >
        </div>
        <div id="context_dialog" style="display:none">
			<g:formRemote url="[controller:'realm',action:'addContext']" 
			          update="[success:'message',failure:'error']" name="newContextForm"
			          onSuccess="contextSaveSuccessHandler(data, textStatus)">
	        	<input type="hidden" id="context_realm" name="realm" value=""/>
	        	<input type="hidden" id="context_actionId" name="actionId" value=""/>
	        	<input type="text" id="context_name" name="name" value="" size="40" maxLength="25"/>
			</g:formRemote >
        </div>
        
        <div id="template" style="display:none">
        	<div id="tiddler_template" class="tiddler">
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
        		<div class="title"></div>
        		<div class="viewer">
        		</div>
        	</div>

        	<div id="action_dashboard_template">
        		<table class="panel">
        		<tr>
        		<td><div class="leftPanel"></div></td>
        		<td><div class="rightPanel"></div></td>
        		</tr>
        		</table>
        	</div>
        	
			<script id="toolbarTemplate" type="text/x-jquery-tmpl"> 
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
			</script>
        	
			<script id="actionViewTemplate2" type="text/x-jquery-tmpl"> 
	        	<div id="td_action_{{= action.id}}" class="tiddler">
	        		{{tmpl '#toolbarTemplate'}}
	        		<div class="title"></div>
	        		<div class="viewer controls" id="action_{{= action.id}}">
	      				<div class="smaller" style="float: right;">
							<span class="label">Realm:</span>
							<span class="realm_select">
								<select class="realm">
								{{each(i, realm) realms}} 
									<option value="{{= realm.id}}" {{if (realm.id == action.realm.id)}}selected="selected"{{/if}}>{{= realm.name}}</span>
				   				{{/each}}
								</select>
							</span>
						</div>
						<div>
		       				<span class="tick"><input type="checkbox" class="chkOptionInput" {{if action.done}}checked="checked" {{/if}}/></span>
		       				<span class="title">{{= action.title}}</span>
		       				<span><a class="button Starred off" title="Starred" href="javascript:;">★</a></span>
		       				<span class="subtitle"></span>
						</div>
						<div class="state">
							<a class=" button Next {{if (action.state.name == 'Next')}}on{{else}}off{{/if}}" title="Next" href="javascript:;">next</a>
							<a class=" button WaitingFor {{if (action.state.name == 'WaitingFor')}}on{{else}}off{{/if}}" title="Waiting For" href="javascript:;">waiting for</a>
							<a class=" button Future {{if (action.state.name == 'Future')}}on{{else}}off{{/if}}" title="Future" href="javascript:;">future</a>
						</div>
						<div class='context' id='{{= action.realm.id}}_{{= action.id}}'>
							{{each(i,ctx) contexts}}
							<input class='chkContext' type='checkbox'>
							<span class='contextLabel'>{{= ctx.name}}</span>
							{{/each}}
							<span class="contextAdd button off">+</span>
						</div>
					</div>
				</div>
        	</script>
        </div>

   </body>


</html>

