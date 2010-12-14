function cacheContexts() {
	$.ajax({
		url: serverUrl + "realm/contexts",
		type: "GET",
		dataType: "json",
		success: function(data) {
			realmCache = data;
			buildContextHtml();
		}
	});
}

function getContextSpanHtml(name) {
	return "<input class='chkContext' type='checkbox'><span class='contextLabel'>" + name + "</span>";	
}

function buildContextHtml() {
	contextHtml = {};
	for (var realm in realmCache.contexts) {
		var contexts = realmCache.contexts[realm];
		var html = "";
		$.each(contexts, function(index, value) {
			html += getContextSpanHtml(value.name);
		});
		html += "<span class='button off contextAdd'>+</span>";
		contextHtml[realm] = html;
	}
}

function updateRealmCache(event) {
	var contexts = realmCache.contexts[event.data.realm.name];
	contexts.push(event.data.context);
	buildContextHtml();
	
	var actionIds = getOpenActionIdsForRealm(event.data.realm.id);
	$.each(actionIds, function(index, value) {
		refreshActionView(value);
	});
}

function getOpenActionIdsForRealm(id) {
	var actionIds = [];
	$.each($('.controls .realm'), function(index, value) {
		if ($(this).val() == id) {
			actionIds.push(determineActionId(this))
		}
	});
	return actionIds;
}

function updateStaticActionTiddlers() {
	staticTiddlers = {
			"nextActions": tl_nextActions, 
			"actionDashboard": tl_actionDashboard, 
			"nextAndWaiting" : tl_nextAndWaiting
	};
	
	for (var key in staticTiddlers) {
		var tiddler = $('#' + key);
		if (tiddler.length > 0) {
			var fn = staticTiddlers[key];
			if (typeof fn === 'function') {
				fn();
			}
		}
	}
}

function actionUpdateListener(event) {
	updateStaticActionTiddlers();
	refreshActionView(event.id);
}

function refreshActionView(actionId) {
	var tiddler = $('#td_action_' + actionId);
	if (tiddler.length > 0) {
		tl_viewAction(tiddler[0]);
	}
}

var eventListeners = {
	actionUpdate : [actionUpdateListener],
	newContext : [updateRealmCache]
};

function raiseEvent(name, event) {
	var listeners = eventListeners[name]
	for (var j = 0; j < listeners.length; j++) {
		if (typeof listeners[j] =='function') {
			listeners[j](event);
		}
	}
}

function determineActionId(obj) {
	var controlDiv = $(obj).closest('.controls');
	var actionId = null;
	if (controlDiv.length > 0) {
		actionId = controlDiv[0].id.substr(7);
	} else {
		var link = $(obj).siblings('.tiddlyLink');
		if (link.length > 0) {
			actionId = link[0].id.substr(10);
		}
	} 
	return actionId;
}

function completeAction() {
	var done = $(this).is(':checked');
	var actionId = determineActionId(this);
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/complete",
			data: {actionId: actionId, done: done}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				raiseEvent('actionUpdate', {event: 'complete', id: actionId});
			}
		});
	}
}

function nextAction() {
	updateStatusAction(this, 'Next')
}

function waitingForAction() {
	updateStatusAction(this, 'WaitingFor')
}

function futureAction() {
	updateStatusAction(this, 'Future')
}


function updateStatusAction(obj, status) {
	if ($(obj).hasClass('on')) return;
	var actionId = determineActionId(obj);
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/status",
			data: {actionId: actionId, status: status}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				raiseEvent('actionUpdate', {event: 'status', id: actionId, status: status});
			}
		});
	}
}

function updateRealm() {
	var realmId = $(this).val();
	var actionId = determineActionId(this);
	if (realmId === "__new__") {
		alert('creating new realm');
		return;
	}
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/realmChange",
			data: {actionId: actionId, realm: realmId}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				raiseEvent('actionUpdate', {event: 'realmChange', id: actionId, realm: realmId});
			}
		});
	}
}

function deleteAction(actionId) {
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/remove",
			data: {actionId: actionId}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				raiseEvent('actionUpdate', {event: 'delete', id: actionId});
			}
		});
	}
}

function updateContextDivs(data) {
	var event = {event: 'newContext', data: data};
	raiseEvent('newContext', event);
}

function toggleRealm() {
	$(this).toggleClass('realm-active');
	var active = $(this).hasClass('realm-active');
	var realm = $(this).text();
	$.ajax({
		url: serverUrl + "realm/toggle",
		data: {name: realm, active: active}, 
		type: "POST",
		dataType: "json",
		success: function(data) {
			raiseEvent('actionUpdate', {event: 'realmToggle', realm: realm, active: true});
		}
	});
}

function addRealm() {
	$('#realm_title').val('');
	$('#realm_dialog').dialog("option", "title", 'New Realm');
	$('#realm_dialog').dialog("open");
}
		
function realmSaveSuccessHandler(data, textStatus) {
	$('#realm_dialog').dialog("close");

	var span = $('<span/>', {
		class: "realm-tab realm-active",
		text: data.realm.name
	});
	$('.realm-add').before(span);
}

function showNewContextDialog() {
	var controlDiv = $(this).closest('.controls');
	var actionId = determineActionId(this);
	var realm = $('.realm_select select', controlDiv).val();

	$('#context_realm').val(realm);
	$('#context_actionId').val(actionId);
	$('#context_name').val('');
	$('#context_dialog').dialog("option", "title", 'New Context');
	$('#context_dialog').dialog("open");
}

function contextSaveSuccessHandler(data, textStatus) {
	$('#context_dialog').dialog("close");
	updateContextDivs(data);
}

function showNewActionDialog() {
	$('#tiddlerType').val(this.id);
	$('#tiddler_title').val('');
	$('#tiddler_dialog').dialog("option", "title", 'New ' + this.id);
	$('#tiddler_dialog').dialog("open");
}

function tiddlerSaveSuccessHandler(data, textStatus) {
	$('#tiddler_dialog').dialog("close");
	loadActionView(data.action);
	raiseEvent('actionUpdate', {event: 'new', id: data.action.id});
}

function getContextActionsHtml(stateMap, title, state) {
	if (stateMap == undefined) return "";
	
	var html = "<div class='mgtdList'><h1>" + title + "</h1>";
	for (var ctx in stateMap) {
		html += "<div class='innerList'><h2>" + ctx + "</h2>";
		var ctxActions = stateMap[ctx];
		for (var j = 0; j < ctxActions.length; j++) {
			var action = ctxActions[j];
			html += "<span class='action'>" +
					"<input type='checkbox' class='chkOptionInput'" + (action.done? " checked='checked'>" : ">") +  
					"<a class='button Next " + state[0] + "' href='javascript:;' title='Next'>n</a>" +
					"<a class='button WaitingFor off " + state[1] + "' href='javascript:;' title='Waiting For'>w</a>" +
					"<a class='button Future off " + state[2] + "' href='javascript:;' title='Future'>f</a>" +
					"<a class='button Starred off' href='javascript:;' title='Starred'>★</a>" +
					"<span>&nbsp;</span>" + 
					"<a class='tiddlyLink tiddlyLinkExisting' href='javascript:;' tiddlyLink='tl_viewAction' id='tl_action_" + action.id + "'>" + action.title + "</a>" +
					"<a class='deleteTiddlerButton' href='javascript:;' title='Delete tiddler'>×</a>" + 
					"</span><br>"
		}
		html += "</div>"
	}
	html += "</div>";
	return html;
}

function getDoneActionsHtml(doneActions, title) {
	if (doneActions == undefined) return "";
	
	var html = "<div class='scroll10'><div class='mgtdList'><h1>" + title + "</h1>";
	html += "<br><div class='doneList'>";
	for (var j = 0; j < doneActions.length; j++) {
		var action = doneActions[j];
		html += "<span class='action'>" +
				"<input type='checkbox' class='chkOptionInput'" + (action.done? " checked='checked'>" : ">") +  
				"<span>&nbsp;</span>" + 
				"<a class='tiddlyLink tiddlyLinkExisting' href='javascript:;' tiddlyLink='tl_viewAction' id='tl_action_" + action.id + "'>" + action.title + "</a>" +
				"<a class='deleteTiddlerButton' href='javascript:;' title='Delete tiddler'>×</a>" + 
				"</span><br>"
	}
	html += "</div>";
	html += "</div></div>";
	return html;
}

function getTiddlerView(id, viewName) {
	var tiddler = $('#tiddler_template').clone();
	$(tiddler).attr('id', id);
	$('#stage').append(tiddler);

	var view = $('#' + viewName).clone();
	view.attr('id', null);
	$('.viewer', tiddler).append(view);
	return view;
}

function loadActionView(action) {
	var tiddler = $('#td_action_' + action.id);
	var view;
	if (tiddler.length > 0) {
		view = $('.viewer div', tiddler[0]);
	} else {
		view = getTiddlerView('td_action_' + action.id, 'action_view_template')
		var realmSelect = $('#realm_select_template select').clone();
		$('.realm_select', view).append(realmSelect);
	}
	$('.controls', view).attr('id', 'action_' + action.id);
	if (action.realm != null) {
		$('.realm_select select', view).val(action.realm.id);
	}
	
	$('.state a').removeClass('on').addClass('off');
	$('.' + action.state.name, view).removeClass('off').addClass('on');
	
	$('.chkOptionInput', view).attr('checked', action.done);
	$('.title', view).html(action.title);
	
	var ctxDiv = $('<div/>');
	var activeRealms = $('.realm-active')
	$('.context', view).empty();
	if (activeRealms.length > 0) {
		var html = contextHtml[$(activeRealms[0]).text()]
		$('.context', view).append(html);
	}
	
	// $('.subtitle', view).html(updatedOn);
	$(view).show();
}

function tl_viewAction(obj) {
	var actionId = obj.id.substr(10);
	$.ajax({
		url: serverUrl + "action/view",
		data: {actionId: actionId}, 
		type: "GET",
		dataType: "json",
		success: function(data) {
			loadActionView(data.action);
		}
	});
}

function showDashboardView(name, title, url, callback) {
	$.ajax({
		url: serverUrl + url,
		type: "GET",
		dataType: "json",
		success: function(result) {
			var tiddler = $('#' + name);
			var view;
			if (tiddler.length > 0) {
				view = $('.viewer div', tiddler[0]);
			} else {
				view = getTiddlerView(name, 'action_dashboard_template')
				tiddler = $('#' + name);
			}
			
			$('.title', tiddler).html(title);

			var leftPanel = $('.leftPanel', view)[0]
			$(leftPanel).empty();

			var rightPanel = $('.rightPanel', view)[0]
			$(rightPanel).empty();
			
			var viewer = {view: view, left: leftPanel, right: rightPanel, tiddler: tiddler, state:result.state, result:result};
			callback(viewer);

			$(view).show();
		}
	});
}

function tl_nextActions() {
	showDashboardView('nextActions', 
		'Next Actions By Context', 'action/nextActions',
		function(v) {
			var html = getContextActionsHtml(v.state.Next, 'Next Actions', ["on", "off", "off"]);
			$(v.left).append(html);
		}
	);
}

function tl_nextAndWaiting() {
	showDashboardView('nextAndWaiting', 
			'Next And Waiting Actions By Context', 'action/next_waiting',
			function(v) {
				var html = getContextActionsHtml(v.state.Next, 'Next Actions', ["on", "off", "off"]);
				$(v.left).append(html);
		
				html = getContextActionsHtml(v.state.WaitingFor, 'Waiting Actions', ["off", "on", "off"]);
				$(v.right).append(html);
			}
		);
}

function tl_actionDashboard() {
	showDashboardView('actionDashboard', 
			'Action Dashboard By Context', 'action/dashboard',
			function(v) {
				var html = getContextActionsHtml(v.state.Next, 'Next Actions', ["on", "off", "off"]);
				html += getContextActionsHtml(v.state.WaitingFor, 'Waiting Actions', ["off", "on", "off"]);
				$(v.left).append(html);
		
				html = getContextActionsHtml(v.state.Future, 'Future Actions', ["off", "off", "on"]);
				html += getDoneActionsHtml(v.result.done, 'Done Actions')
				$(v.right).append(html);
			}
		);
}

jQuery(document).ready(function() {
	$('.tiddler').live('mouseenter', function() {
		$(this).addClass("selected");
	});
	$('.tiddler').live('mouseleave', function() {
		$(this).removeClass("selected");
	});
	$('.tiddler .command_closeTiddler').live('click', function() {
		$(this).closest('.tiddler').remove();
	});
	$('.tiddler .command_deleteTiddler').live('click', function() {
		var actionId = $(this).closest('.tiddler')[0].id;
		if (actionId.substr(0, 10) === 'td_action_') {
			deleteAction(actionId.substr(10));
			$(this).closest('.tiddler').remove();
		}
	});
	$('.tiddler .deleteTiddlerButton').live('click', function() {
		var actionId = determineActionId(this);
		deleteAction(actionId);
	});
	$('.tiddler .chkOptionInput').live('click', completeAction);
	
	$('.Next').live('click', nextAction);
	$('.WaitingFor').live('click', waitingForAction);
	$('.Future').live('click', futureAction);
	$('.realm').live('change', updateRealm);
	$('.realm-tab').live('click', toggleRealm);
	$('.realm-add').live('click', addRealm);

	$('.tiddlyLink').live('click', function() {
		var name = $(this).attr('tiddlylink');
		var fn = window[name];
		if (typeof fn === 'function') {
			fn(this);
		} else {
			alert('Missing tiddly method: ' + name);
		}
	});
	
	$('#tiddler_dialog').dialog({
	    autoOpen: false,
		buttons: {
			"OK" : function() {
			  var title = $('#tiddler_title').val();
			  if (title.trim() === "") {
			  	alert('Please enter a title');
			  	return;
			  }
			  $('#newTiddlerForm').submit();
			},
			"Cancel" : function() {$(this).dialog("close"); }
		},
		resizable: false,
		modal: true
	});
	$('#context_dialog').dialog({
	    autoOpen: false,
		buttons: {
			"OK" : function() {
			  var name = $('#context_name').val();                                                 
			  if (name.trim() === "") {
			  	alert('Please enter a name');
			  	return;
			  }
			  $('#newContextForm').submit();
			},
			"Cancel" : function() {$(this).dialog("close"); }
		},
		resizable: false,
		modal: true
	});
	
	$('#realm_dialog').dialog({
	    autoOpen: false,
		buttons: {
			"OK" : function() {
			  var name = $('#realm_name').val();
			  if (name.trim() === "") {
			  	alert('Please enter a name');
			  	return;
			  }
			  $('#newRealmForm').submit();
			},
			"Cancel" : function() {$(this).dialog("close"); }
		},
		resizable: false,
		modal: true
	});
	
	$(".action_link").click(showNewActionDialog);
	$('.contextAdd').live('click', showNewContextDialog);
	
	tl_actionDashboard();
	cacheContexts();
});

