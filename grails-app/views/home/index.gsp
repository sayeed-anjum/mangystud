<html>
    <head>
        <title>aajkaaj - Today's work today</title>
        <meta name="layout" content="main" />
        <content tag="headerContent">
   	 		<div id="realm">
		   	 	<span class='rlabel'>REALM</span>
			   	<g:each in="${realms}" var="realm">
					<span class='realm-tab <g:if test="${realm.active}">realm-active</g:if>'>${realm.name}</span>
			   	</g:each>
			   	<span class="realm-add"> + </span>
			   	<span class="spacer"></span>
			   	<span id="ticklerAlert" class="action_link ticklers_pending" style='display:none'><blink>*ticklers*</blink></span> 
			   	<span id="inboxAlert" class="action_link inbox_pending"><g:link url="[action:'index',controller:'inbox']">*inbox*</g:link></span> 
			   	<span class="spacer"></span>
			   	<span id="Action" class="action_link new_action">+action</span> 
			   	<span id="Project" class="action_link new_project">+project</span> 
			   	<span id="Tickler" class="action_link new_tickler">+tickler</span> 
			   	<span id="Reference" class="action_link">+reference</span>
			   	<span class="spacer"></span>
			</div>
		</content>
		<g:javascript>
			jQuery(document).ready(function() {
				initTiddlerManager();
			});
		</g:javascript>
	</head>
   <body>
   		<div id="sidebar">
   			<div id="sidebarTabs">
	   			<div class="tabContents">
		   			<a class="tiddlyLink tiddlyLinkExisting" href="javascript:;" tiddlylink="tl_nextActions">Next Actions</a>
		   			<a class="tiddlyLink tiddlyLinkExisting" href="javascript:;" tiddlylink="tl_nextAndWaiting">Next &amp; Waiting Actions</a>
		   			<a class="tiddlyLink tiddlyLinkExisting" href="javascript:;" tiddlylink="tl_actionDashboard">Action Dashboard</a>
		   			<a class="tiddlyLink tiddlyLinkExisting" href="javascript:;" tiddlylink="tl_ticklerDashboard">Tickler Dashboard</a>
		   			<a class="tiddlyLink tiddlyLinkExisting" href="javascript:;" tiddlylink="tl_projectDashboard">Project Dashboard</a>
	   			</div>
   			</div>
   		</div>
   		
   		<div id="stage">
   		</div>

		<div id="realm_dialog" style="display:none">
			<g:formRemote url="[controller:'realm',action:'add']" 
		          update="[success:'message',failure:'error']" name="newRealmForm"
		          onSuccess="manager.dialogSuccess('realmDialog', data, textStatus)">
		      	<input type="text" name="name" value="" size="40" maxLength="25"/>
			</g:formRemote >
		</div>
		
        <div id="action_dialog" style="display:none">
			<g:formRemote url="[controller:'action',action:'add']" 
			          update="[success:'message',failure:'error']" name="newTiddlerForm"
			          onSuccess="manager.dialogSuccess('actionDialog', data, textStatus)">
	        	<input type="hidden" name="type" value=""/>
	        	<input type="hidden" name="state" value=""/>
	        	<input type="hidden" name="context" value=""/>
	        	<input type="hidden" name="contact" value=""/>
	        	<input type="hidden" name="project" value=""/>
	        	<input type="text" name="title" value="" size="40"/>
			</g:formRemote >
        </div>
        
        <div id="context_dialog" style="display:none">
			<g:formRemote url="[controller:'realm',action:'addContext']" 
			          update="[success:'message',failure:'error']" name="newContextForm"
			          onSuccess="manager.dialogSuccess('contextDialog', data, textStatus)">
	        	<input type="hidden" name="realm" value=""/>
	        	<input type="hidden" name="actionId" value=""/>
	        	<input type="text" name="name" value="" size="40" maxLength="25"/>
			</g:formRemote >
        </div>

        <div id="project_dialog" style="display:none">
			<g:formRemote url="[controller:'project',action:'add']" 
			          update="[success:'message',failure:'error']" name="newContextForm"
			          onSuccess="manager.dialogSuccess('projectDialog', data, textStatus)">
	        	<input type="hidden" name="status" value=""/>
	        	<input type="text" name="title" value="" size="40"/>
			</g:formRemote >
        </div>
        
        <div id="area_dialog" style="display:none">
			<g:formRemote url="[controller:'realm',action:'addArea']" 
			          update="[success:'message',failure:'error']" name="newContextForm"
			          onSuccess="manager.dialogSuccess('areaDialog', data, textStatus)">
	        	<input type="hidden" name="realm" value=""/>
	        	<input type="text" name="name" value="" size="40" maxLength="25"/>
			</g:formRemote >
        </div>

        <div id="contact_dialog" style="display:none">
			<g:formRemote url="[controller:'realm',action:'addContact']" 
			          update="[success:'message',failure:'error']" name="newContextForm"
			          onSuccess="manager.dialogSuccess('contactDialog', data, textStatus)">
	        	<input type="hidden" name="realm" value=""/>
	        	<label>Name:</label><input type="text" name="name" value="" size="40" maxLength="100"/>
	        	<label>Email:</label><input type="text" name="email" value="" size="40" maxLength="100"/>
			</g:formRemote >
        </div>
        
        <div id="tickler_dialog" style="display:none">
			<g:formRemote url="[controller:'tickler',action:'add']" 
			          update="[success:'message',failure:'error']" name="newContextForm"
			          onSuccess="manager.dialogSuccess('ticklerDialog', data, textStatus)">
	        	<label>Title:</label><input type="text" name="title" value="" size="40" maxLength="100"/>
	        	<label>Date:</label><br/><input class='dateControl' readonly="readonly" type="text" name="date" value="" size="20" maxLength="100"/>
			</g:formRemote >
        </div>
   </div>

			<script id="toolbarTemplate" type="text/x-jquery-tmpl"> 
	        	<div class="toolbar viewToolbar">
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
	        	<div class="toolbar editToolbar" style='display:none'>
					<span style="padding: 1em;"></span>
					<span>
						<a name="doneTiddler" class="button command_doneTiddler" title="Save changes to this tiddler" href="javascript:;">done</a>
						<a name="doneCloseTiddler" class="button command_doneCloseTiddler" title="Save changes to this tiddler and close it" href="javascript:;">done/close</a>
						<a name="closeOthers" class="button command_closeOthers" title="Close all other tiddlers" href="javascript:;">close others</a>
						<a name="cancelTiddler" class="button command_cancelTiddler defaultCommand" title="Undo changes to this tiddler" href="javascript:;">cancel</a>
						<a name="cancelCloseTiddler" class="button command_cancelCloseTiddler defaultCommand" title="Undo changes to this tiddler and close it" href="javascript:;">cancel/close</a>
						<a name="deleteTiddler" class="button command_deleteTiddler" title="Delete this tiddler" href="javascript:;">delete</a>
					</span>
					<span style="padding: 1em;"></span>
				</div>
			</script>
        	
			<script id="realmTemplate" type="text/x-jquery-tmpl">
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
			</script> 

			<script id="combosTemplate" type="text/x-jquery-tmpl"> 
				<div class='combos'>
					<span class="label">Area:</span>
					<select class='area' id='area_{{= action.id}}'>
						<option value="0">-</span>
						<option value="__new__">New Area...</span>
						{{each(i,area) areas}}
							<option value="{{= area.id}}" {{if action.area != null && action.area.id == area.id}}selected="selected"{{/if}}>{{= area.name}}</span>
						{{/each}}
					</select>
					<span class="label">Contact:</span>
					<select class='contact' id='contact_{{= action.id}}'>
						<option value="0">-</span>
						<option value="__new__">New Contact...</span>
						{{each(i,contact) contacts}}
							<option value="{{= contact.id}}" {{if action.contact != null && action.contact.id == contact.id}}selected="selected"{{/if}}>{{= contact.name}}</span>
						{{/each}}
					</select>
					<span class='label'>Project:</span>
					<input name='project' value='{{if project}}{{= project.title}}{{/if}}' size='50'/>
					{{if project}}<a class='unlinkProject' href='javascript:;' title='Remove project'>×</a>{{/if}}
				</div>
			</script>

			<script id="editorTemplate" type="text/x-jquery-tmpl"> 
				<div class='editor {{= class}}' id='tiddler_{{= tiddler.id}}' style='display:none'>
					<input type='hidden' name='oldTitle' value='{{= tiddler.title}}'>
					<input type='hidden' name='oldContent' value='{{= tiddler.notes}}'>
					<label>Title</label>
					<input name='title' maxlength='100' value="{{= tiddler.title}}" tabindex='1'>
					<br/>
					<label>Content</label>
					<textarea name='content' rows='10' tabindex='2'>{{= tiddler.notes}}</textarea>
				</div>
			</script>

			<script id="dashboardTemplate" type="text/x-jquery-tmpl"> 
        	<div id="{{= name}}" class="tiddler" tabIndex="{{= tabIndex}}">
        		{{tmpl '#toolbarTemplate'}}
        		<div class="title">{{= title}}</div>
        		<div class="viewer">
        		<table class="panel">
        		<tr>
        		<td><div class="leftPanel">{{html left}}</div></td>
        		<td><div class="rightPanel">{{html right}}</div></td>
        		</tr>
        		</table>
        		</div>
            </div>
			</script>
        	
			<script id="actionViewTemplate" type="text/x-jquery-tmpl"> 
	        	<div id="td_action_{{= action.id}}" class="tiddler" tabIndex="{{= tabIndex}}">
	        		{{tmpl '#toolbarTemplate'}}
	        		<div class="title td_title"></div>
	        		<div class="viewer controls action" id="action_{{= action.id}}">
	        			{{tmpl({realms:realms, action:action}) '#realmTemplate'}}
						<div>
		       				<span class="tick"><input type="checkbox" class="chkOptionInput" {{if action.done}}checked="checked" {{/if}}/></span>
		       				<span class="title vw_title">{{= action.title}}</span>
		       				<span><a class="button Starred {{if action.star}}on{{else}}off{{/if}}" title="Starred" href="javascript:;">★</a></span>
		       				<span class="subtitle"></span>
						</div>
						<div class="state longButton">
							<a class=" button Next {{if (action.state.name == 'Next')}}on{{else}}off{{/if}}" title="Next" href="javascript:;">next</a>
							<a class=" button WaitingFor {{if (action.state.name == 'WaitingFor')}}on{{else}}off{{/if}}" title="Waiting For" href="javascript:;">waiting for</a>
							<a class=" button Future {{if (action.state.name == 'Future')}}on{{else}}off{{/if}}" title="Future" href="javascript:;">future</a>
						</div>
						<div class='context' id='ctx_{{= action.realm.id}}_{{= action.id}}'>
							{{each(i,ctx) contexts}}
							<input class='chkContext' type='checkbox' value='{{= ctx.id}}' {{if isContextPresent(action, ctx)}}checked="checked"{{/if}}>
							<span class='contextLabel'>{{= ctx.name}}</span>
							{{/each}}
							<span class="contextAdd button off">+</span>
						</div>
						{{tmpl({action: action, contacts: contacts, project: project}) '#combosTemplate'}}
						<div class='buttonDiv'>
							<a class="button makeTickler off">make tickler</a>
						</div>
						<div class='combos'>
							<span class='label'>Depends On</span>
							<input name='dependsOn' value='{{if dependsOn}}{{= dependsOn.title}}{{/if}}' size='100'/>
							{{if dependsOn}}<a class='deleteDependency' href='javascript:;' title='Remove dependency'>×</a>{{/if}}
						</div>
					</div>
					<div class='content tiddlerContent'><pre>{{= action.notes}}</pre></div>
	        		{{tmpl({tiddler:action, class: 'action'}) '#editorTemplate'}}
				</div>
        	</script>

			<script id="projectViewTemplate" type="text/x-jquery-tmpl"> 
	        	<div id="td_projct_{{= project.id}}" class="tiddler" tabIndex="{{= tabIndex}}">
	        		{{tmpl '#toolbarTemplate'}}
	        		<div class="title td_title"></div>
	        		<div class="viewer controls project" id="projct_{{= project.id}}">
	        			{{tmpl({realms:realms, action:project}) '#realmTemplate'}}
						<div>
		       				<span class="tick"><input type="checkbox" class="chkOptionInput" {{if project.done}}checked="checked" {{/if}}/></span>
		       				<span class="title vw_title">{{= project.title}}</span>
		       				<span><a class="button Starred {{if project.star}}on{{else}}off{{/if}}" title="Starred" href="javascript:;">★</a></span>
		       				<span class="subtitle"></span>
						</div>
						<div class="projectStatus longButton">
							<a class=" button Active {{if (project.projectStatus.name == 'Active')}}on{{else}}off{{/if}}" title="Active" href="javascript:;">active</a>
							<a class=" button Someday {{if (project.projectStatus.name == 'Someday')}}on{{else}}off{{/if}}" title="Someday" href="javascript:;">someday/maybe</a>
						</div>
						<div class='buttonDiv'>
							<a class="button makeTickler off">make tickler</a>
						</div>
						{{tmpl({action: project, areas: areas, contacts: contacts}) '#combosTemplate'}}
					</div>
					{{tmpl({project: project, prefix: prefix, tiddlers: tiddlers}) '#projectDetails'}}
	        		{{tmpl({tiddler:project, class: 'project'}) '#editorTemplate'}}
				</div>
        	</script>

			<script id="ticklerViewTemplate" type="text/x-jquery-tmpl"> 
	        	<div id="td_ticklr_{{= tickler.id}}" class="tiddler" tabIndex="{{= tabIndex}}">
	        		{{tmpl '#toolbarTemplate'}}
	        		<div class="title td_title"></div>
	        		<div class="viewer controls tickler" id="ticklr_{{= tickler.id}}">
	        			{{tmpl({realms:realms, action:tickler}) '#realmTemplate'}}
						<div>
							{{if tickler.period.name == 'Once'}}
		       				<span class="tick"><input type="checkbox" class="chkOptionInput" {{if tickler.done}}checked="checked" {{/if}}/></span>
						    {{else}}
		       				<span class="tick"><a href='javascript:;' title='' class='rollPeriod button off'>+{{= tickler.p}}</a></span>
							{{/if}}
		       				<span class="title vw_title">{{= tickler.title}}</span>
		       				<span><a class="button Starred {{if tickler.star}}on{{else}}off{{/if}}" title="Starred" href="javascript:;">★</a></span>
		       				<span class="subtitle"></span>
						</div>
						<div class="period longButton">
							<span>
								<a href="javascript:;" title="Daily" class=" button Daily {{if (tickler.period.name == 'Daily')}}on{{else}}off{{/if}}">daily</a>
								<a href="javascript:;" title="Once" class=" button Once {{if (tickler.period.name == 'Once')}}on{{else}}off{{/if}}">one time</a>
								<a href="javascript:;" title="Weekly" class=" button Weekly {{if (tickler.period.name == 'Weekly')}}on{{else}}off{{/if}}">weekly</a>
								<a href="javascript:;" title="Monthly" class=" button Monthly {{if (tickler.period.name == 'Monthly')}}on{{else}}off{{/if}}">monthly</a>
								<a href="javascript:;" title="Yearly" class=" button Yearly {{if (tickler.period.name == 'Yearly')}}on{{else}}off{{/if}}">yearly</a>
							</span>
						</div>
						<div class="date">
  							<div class="floatleft"><span class="label">Date:</span><span><input class="dateBox" value="{{= formatTicklerDate(tickler.date)}}"></span></div>
  							<div class="floatleft buttonsLikeLinks">
						    	<span><a href="javascript:;" title="add a day" class="button">+d</a></span>
   								<span><a href="javascript:;" title="add a week" class="button">+w</a></span>
   								<span><a href="javascript:;" title="add a month" class="button">+m</a></span>
   								<span><a href="javascript:;" title="add a year" class="button">+y</a></span>
  							</div>
					    	<div class="clearboth"></div>
 						</div>
						<div class='buttonDiv'>
							<a class="button makeAction off">make action</a>
						</div>
						{{tmpl({action: tickler, areas: areas, contacts: contacts, project: project}) '#combosTemplate'}}
					</div>
					<div class='content tiddlerContent'><pre>{{= tickler.notes}}</pre></div>
	        		{{tmpl({tiddler:tickler, class: 'tickler'}) '#editorTemplate'}}
				</div>
        	</script>
   
   			<script id="projectDetails" type="text/x-jquery-tmpl"> 
        		<div class="projectDetails">
        			<table class="panel">
        			<tr>
        			<td><div class="panel1">
						{{tmpl({title:'Next Actions', ctxList:tiddlers.NextActions, n:"on", w:"off", f:"off", stateName: 'Next', prefix: prefix, groupBy:'ctx'}) '#showActionListByContext'}}
						{{tmpl({title:'Waiting Actions', ctxList:tiddlers.WaitingForActions, n:"off", w:"on", f:"off", stateName:'WaitingFor', prefix: prefix, groupBy:'contact'}) '#showActionListByContext'}}
					</div></td>
        			<td><div class="panel2">
						{{tmpl({title:'Future Actions', ctxList:tiddlers.FutureActions, n:"off", w:"off", f:"on", stateName: 'Future', prefix: prefix, groupBy:'ctx'}) '#showActionListByContext'}}
					</div></td>
        			<td><div class="panel3">
						{{tmpl({title:'Upcoming Ticklers', ticklers:tiddlers.upcomingTicklers, prefix: prefix}) '#showTicklers'}}
					</div></td>
        			</tr>
        			</table>
        		</div>
			</script>

			<script id="showActionListByContext" type="text/x-jquery-tmpl">
				<div class='viewer'>
				<div class='mgtdList'><h1 class='dc_state_{{= stateName}}'>{{= title}} <a class='action_link new_action'>+</a></h1>
				{{each(key,ctx) ctxList}}
					<div class='innerList'><h2 class='dc_{{= groupBy}} dc_state_{{= stateName}}'>{{= key}} <a class='action_link new_action'>+</a></h2>
						{{each(i,action) ctx}}
							<span class='link-container action'>
							<input type='checkbox' class='chkOptionInput' {{if action.done}}checked='checked'{{/if}}>
							<a class='button Next {{= n}}' href='javascript:;' title='Next'>n</a><a class='button WaitingFor {{= w}}' href='javascript:;' title='Waiting For'>w</a><a class='button Future {{= f}}' href='javascript:;' title='Future'>f</a>
							<a class='button Starred {{if action.star}}on{{else}}off{{/if}}' href='javascript:;' title='Starred'>★</a><span>&nbsp;</span><a class='tiddlyLink tiddlyLinkExisting' href='javascript:;' tiddlyLink='tl_viewAction' id='tl_{{= prefix}}{{= action.id}}'>{{= action.title}}</a> 
							<a class='deleteActionButton' href='javascript:;' title='Delete action'>×</a>
							</span><br>
						{{/each}}
					</div>
				{{/each}}					
				</div>			
				</div>
			</script> 

			<script id="showTicklers" type="text/x-jquery-tmpl">
				<div class='viewer'>
				<div class='mgtdList'><h1>{{= title}}</h1>
				<div class='innerList'><h2>{{= key}}</h2>
				{{each(key,tickler) ticklers}}
					<span class='link-container tickler'>
					{{if tickler.period.name == 'Once'}}
						<input type='checkbox' class='chkOptionInput' {{if tickler.done}}checked='checked{{/if}}>  
					{{else}}
						<a href='javascript:;' title='' class='rollPeriod button off'>{{= tickler.p}}</a>  
					{{/if}}
					<a class='button Starred {{if tickler.star}}on{{else}}off{{/if}}' href='javascript:;' title='Starred'>★</a>
					<input class='dateBox' value='{{= formatTicklerDate(tickler.date)}}'>
					<span>&nbsp;</span>
					<a class='tiddlyLink tiddlyLinkExisting' href='javascript:;' tiddlyLink='tl_viewTickler' id='tl_{{= prefix}}{{= tickler.id}}'>{{= tickler.title}}</a> 
					<a class='deleteTicklerButton' href='javascript:;' title='Delete tickler'>×</a>
					</span><br>
				{{/each}}					
				</div>			
				</div>
			</script> 
   </body>


</html>

