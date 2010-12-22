manager = {
	templates : {},
	realmCache : {},
	eventListeners : {},
	staticTiddlers : {},
	dialogs : {},
	
	updateCache : function(callback) {
		var manager = this;
		$.ajax({
			url: serverUrl + "realm/contexts",
			type: "GET",
			dataType: "json",
			success: function(data) {
				manager.realmCache = data;
				callback(manager);
			}
		});
	},

	updateRealmCache : function (manager, event) {
		var contexts = manager.realmCache.contexts[event.data.realm.id];
		contexts.push(event.data.context);
		
		var actionIds = getOpenActionIdsForRealm(event.data.realm.id);
		$.each(actionIds, function(index, value) {
			refreshActionView(value);
		});
	},
	
	getContexts : function (realmId) {
		return this.realmCache.contexts[realmId];		
	},
	
	getAreas : function (realmId) {
		return this.realmCache.areas[realmId];		
	},
	
	getRealms : function() {
		return this.realmCache.realms;
	},

	raiseEvent : function(name, event) {
		var listeners = this.eventListeners[name]
		for (var j = 0; j < listeners.length; j++) {
			if ($.isFunction(listeners[j])) {
				listeners[j](this, event);
			}
		}
	},

	updateStaticActionTiddlers : function() {
		for (var key in this.staticTiddlers) {
			var tiddler = $('#' + key);
			if (tiddler.length) {
				var fn = this.staticTiddlers[key];
				if ($.isFunction(fn)) {
					fn();
				}
			}
		}
	},

	actionUpdateListener : function(manager, event) {
		manager.updateStaticActionTiddlers();
		refreshActionView(event.id);
	}, 
	
	tmpl : function(name, data) {
		 return $.tmpl(this.templates[name], data);		
	}, 
	
	init : function(data) {
		var manager = this;
		
		this.dialogs = data.dialogs;

		$.extend(this.staticTiddlers, {			
			"nextActions": tl_nextActions, 
			"actionDashboard": tl_actionDashboard, 
			"nextAndWaiting" : tl_nextAndWaiting
		});
		
		this.updateCache(function() {
			$.each(data.templates, function(index, name) {
				manager.templates[name] = $.template(null, $("#" + name));
			});
			tl_actionDashboard();
		});

		this.eventListeners.actionUpdate = [this.actionUpdateListener];
		this.eventListeners.newContext = [this.updateRealmCache];
	}, 
	
	determineActionId : function (obj) {
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
	},
	
	showDialogByName : function(dialogName, event) {
		var dialog = this.dialogs[dialogName];
		if (dialog) {
			dialog.show(event);
		}
	},
	
	showDialog : function(event) {
		event.data.manager.showDialogByName(event.data.dialog, event);
	},
	
	dialogSuccess : function(dialogName, data, textStatus) {
		var dialog = this.dialogs[dialogName];
		if (dialog) {
			dialog.onSuccess(data, textStatus);
		}
	}, 
	
	getCurrentActionId : function() {
		if (this.currentTiddler) {
			var id = $(this.currentTiddler).attr('id');
			if (id.match('td_action_')) {
				return id.substr(10);
			}
		}
		return null;
	}
};

function isContextPresent(action, context) {
	var result = false;
	$.each(action.contexts, function(index, value){
		if (value.id == context.id) { 
			result = true;
			return false;
		}
	});
	return result;
}

function refreshActionView(actionId) {
	var tiddler = $('#td_action_' + actionId);
	if (tiddler.length > 0) {
		tl_viewAction(actionId);
	}
}

function getOpenActionIdsForRealm(id) {
	var actionIds = [];
	$.each($('.controls .realm'), function(index, value) {
		if ($(this).val() == id) {
			actionIds.push(manager.determineActionId(this))
		}
	});
	return actionIds;
}

function completeAction() {
	var done = $(this).is(':checked');
	var actionId =  manager.determineActionId(this);
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/complete",
			data: {actionId: actionId, done: done}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('actionUpdate', {event: 'complete', id: actionId});
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
	var actionId = manager.determineActionId(obj);
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/status",
			data: {actionId: actionId, status: status}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('actionUpdate', {event: 'status', id: actionId, status: status});
			}
		});
	}
}

function updateRealm() {
	var realmId = $(this).val();
	var actionId = manager.determineActionId(this);
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
				manager.raiseEvent('actionUpdate', {event: 'realmChange', id: actionId, realm: realmId});
			}
		});
	}
}

function updateArea() {
	var areaId = $(this).val();
	var actionId = manager.determineActionId(this);
	if (areaId === "__new__") {
		alert('creating new area');
		return;
	}
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/areaUpdate",
			data: {actionId: actionId, area: areaId}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('actionUpdate', {event: 'areaUpdate', id: actionId, area: areaId});
			}
		});
	}
}

function updateContextState(event) {
	var checked = $(this).is(':checked');
	var context = $(this).val();
	var actionId = manager.determineActionId(this);
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/updateContext",
			data: {actionId: actionId, context: context, checked: checked}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('actionUpdate', {event: 'updateContext', id: actionId, context: context, checked: checked});
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
				manager.raiseEvent('actionUpdate', {event: 'delete', id: actionId});
			}
		});
	}
}

function updateContextDivs(data) {
	var event = {event: 'newContext', data: data};
	manager.raiseEvent('newContext', event);
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
			manager.raiseEvent('actionUpdate', {event: 'realmToggle', realm: realm, active: true});
		}
	});
}

function tl_viewAction(actionId, inFocus) {
	viewLoader("action/view", {actionId: actionId}, function(data) {
		var action = data.action; 

		var data = {
			action: action, 
			contexts: manager.getContexts(action.realm.id),
			areas: manager.getAreas(action.realm.id),
			realms: manager.getRealms(), 
			tabIndex: 1
		};
		
		var template = manager.tmpl("actionViewTemplate", data);

		var tiddler = $('#td_action_' + action.id);
		if (tiddler.length) {
			tiddler.replaceWith(template);
		} else {
			template.appendTo('#stage');
		} 
		if (inFocus) {
			$(template).focus();
		}
	});
}

function viewLoader(url, data, callback) {
	$.ajax({
		url: serverUrl + url,
		data: data, 
		type: "GET",
		dataType: "json",
		success: function(data) {
			callback(data);
		}
	});
}

function addTiddlerActionHandlers() {
	$('.tiddler').live('mouseenter', function() {
		$(this).addClass("selected");
		manager.currentTiddler = this;
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
		var actionId = manager.determineActionId(this);
		deleteAction(actionId);
	});

	$('.tiddler .chkOptionInput').live('click', completeAction);
	$('.Next').live('click', nextAction);
	$('.WaitingFor').live('click', waitingForAction);
	$('.Future').live('click', futureAction);
	$('.tiddlyLink').live('click', function() {
		var name = $(this).attr('tiddlylink');
		var fn = window[name];
		if ($.isFunction(fn)) {
			var actionId = this.id.substr(10);
			fn(actionId, true);
		} else {
			alert('Missing tiddly method: ' + name);
		}
	});
	$(".action_link").click({manager:manager, dialog:'actionDialog'}, manager.showDialog);
	$('.contextAdd').live('click', {manager:manager, dialog:'contextDialog'}, manager.showDialog);
	$('.controls .chkContext').live('click', updateContextState);
	$('.controls .area').live('change', updateArea);
	updateArea
}

function addRealmActionHandlers() {
	$('.realm').live('change', updateRealm);
	$('.realm-tab').live('click', toggleRealm);
	$('.realm-add').live('click', {manager:manager, dialog:'realmDialog'}, manager.showDialog);
}

jQuery(document).ready(function() {
	manager.init({
		templates: ["actionViewTemplate", "dashboardTemplate"],
		dialogs: {
			"realmDialog" : new RealmDialog().init(), 
			"contextDialog" : new ContextDialog().init(),
			"actionDialog" : new ActionDialog().init()
		}
	});
	
	addTiddlerActionHandlers();
	addRealmActionHandlers();
});

