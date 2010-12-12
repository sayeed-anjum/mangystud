function updateStaticActionTiddlers() {
	staticTiddlers = {"actionDashboard": tl_actionDashboard}
	for (var key in staticTiddlers) {
		var tiddler = $('#' + key);
		if (tiddler.length >= 0) {
			var fn = staticTiddlers[key];
			if (typeof fn === 'function') {
				fn();
			}
		}
	}
}

function actionUpdateListener(event) {
	updateStaticActionTiddlers();
	
	var tiddler = $('#td_action_' + event.id);
	if (tiddler.length > 0) {
		tl_viewAction(tiddler[0]);
	}
}

var eventListeners = {
	actionUpdate : [actionUpdateListener]
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
	if ($(this).hasClass('on')) return;
	updateStatusAction(this, 'Next')
}

function waitingForAction() {
	if ($(this).hasClass('on')) return;
	updateStatusAction(this, 'WaitingFor')
}

function futureAction() {
	if ($(this).hasClass('on')) return;
	updateStatusAction(this, 'Future')
}


function updateStatusAction(obj, status) {
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

function tiddlerSaveSuccessHandler(data, textStatus) {
	$('#tiddler_dialog').dialog("close");
	loadActionView(data.action);
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

function tl_actionDashboard() {
	$.ajax({
		url: serverUrl + "action/dashboard",
		type: "GET",
		dataType: "json",
		success: function(result) {
			var tiddler = $('#actionDashboard');
			var state = result.state;
			var view;
			if (tiddler.length > 0) {
				view = $('.viewer div', tiddler[0]);
			} else {
				view = getTiddlerView("actionDashboard", 'action_dashboard_template')
				tiddler = $('#actionDashboard');
			}
			
			$('.title', tiddler).html('Action Dashboard By Context');
			
			var leftPanel = $('.leftPanel', view)[0]
			$(leftPanel).empty();

			var rightPanel = $('.rightPanel', view)[0]
			$(rightPanel).empty();

			var html = getContextActionsHtml(state.Next, 'Next Actions', ["on", "off", "off"]);
			html += getContextActionsHtml(state.WaitingFor, 'Waiting Actions', ["off", "on", "off"]);
			$(leftPanel).append(html);

			html = getContextActionsHtml(state.Future, 'Future Actions', ["off", "off", "on"]);
			html += getDoneActionsHtml(result.done, 'Done Actions')
			$(rightPanel).append(html);
			
			$(view).show();
		}
	});
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
	$(".action_link").click(function() {
		$('#tiddlerType').val(this.id);
		$('#tiddler_title').val('');
		$('#tiddler_dialog').dialog("option", "title", 'New ' + this.id);
		$('#tiddler_dialog').dialog("open");
	});
	
	tl_actionDashboard();
});

