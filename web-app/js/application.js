manager = {
	templates : {},
	realmCache : {},
	eventListeners : {},
	staticTiddlers : {},
	ticklerDashboards : {},
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
		if (event.event == 'newContext') {
			var contexts = manager.realmCache.contexts[event.data.realm.id];
			contexts.push(event.data.context);
		}
		if (event.event == 'newArea') {
			var areas = manager.realmCache.areas[event.data.realm.id];
			areas.push(event.data.area);
		}
		if (event.event == 'newContact') {
			var contacts = manager.realmCache.contacts[event.data.realm.id];
			contacts.push(event.data.contact);
		}
		
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
	
	getContacts : function (realmId) {
		return this.realmCache.contacts[realmId];		
	},
	
	getRealms : function() {
		return this.realmCache.realms;
	},

	raiseEvent : function(name, event) {
		var listeners = this.eventListeners[name]
		if (listeners) {
			for (var j = 0; j < listeners.length; j++) {
				if ($.isFunction(listeners[j])) {
					listeners[j](this, event);
				}
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

	updateTicklerDashboards : function() {
		for (var key in this.ticklerDashboards) {
			var tiddler = $('#' + key);
			if (tiddler.length) {
				var fn = this.ticklerDashboards[key];
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
	
	ticklerUpdateListener : function(manager, event) {
		manager.updateTicklerDashboards();
		refreshTicklerView(event.id);
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
		
		$.extend(this.ticklerDashboards, {			
			"ticklerDashboard": tl_ticklerDashboard, 
			"activeTicklerDashboard": tl_activeTicklerDashboard 
		});

		this.updateCache(function() {
			$.each(data.templates, function(index, name) {
				manager.templates[name] = $.template(null, $("#" + name));
			});
			tl_actionDashboard();
		});

		this.eventListeners.actionUpdate = [this.actionUpdateListener];
		this.eventListeners.ticklerUpdate = [this.ticklerUpdateListener];
		this.eventListeners.newContext = [this.updateRealmCache];
		this.eventListeners.newArea = [this.updateRealmCache];
		this.eventListeners.newContact = [this.updateRealmCache];
	}, 
	
	determineTiddlerType : function(obj) {
		var controlDiv = $(obj).closest('.controls');
		var type = "";
		if (controlDiv.hasClass('action')) type = 'action';
		else if (controlDiv.hasClass('tickler')) type = 'tickler';
		return type;
	},
	
	determineTiddlerId : function(obj) {
		var id = null;
		var controlDiv = $(obj).closest('.controls');
		if (controlDiv.length > 0) {
			id = controlDiv[0].id.substr(7);
		} else {
			var link = $(obj).siblings('.tiddlyLink');
			if (link.length > 0) {
				id = link[0].id.substr(10);
			}
		} 
		return id;
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

	determineTicklerId : function (obj) {
		var controlDiv = $(obj).closest('.controls');
		var ticklerId = null;
		if (controlDiv.length > 0) {
			ticklerId = controlDiv[0].id.substr(7);
		} else {
			var link = $(obj).siblings('.tiddlyLink');
			if (link.length > 0) {
				ticklerId = link[0].id.substr(10);
			}
		} 
		return ticklerId;
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

function refreshTicklerView(id) {
	var tiddler = $('#td_ticklr_' + id);
	if (tiddler.length > 0) {
		tl_viewTickler(id);
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

function completeTickler() {
	var done = $(this).is(':checked');
	var ticklerId =  manager.determineTicklerId(this);
	if (ticklerId != null) {
		$.ajax({
			url: serverUrl + "tickler/complete",
			data: {ticklerId: ticklerId, done: done}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('ticklerUpdate', {event: 'complete', id: ticklerId});
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


function updateTicklerDate(dateText, inst) {
	var ticklerId = manager.determineTicklerId(this);
	var date = inst.selectedYear + "-" + (inst.selectedMonth+1) + "-" + inst.selectedDay;
	if (ticklerId != null) {
		$.ajax({
			url: serverUrl + "tickler/updateDate",
			data: {ticklerId: ticklerId, date: date}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('ticklerUpdate', {event: 'date', id: ticklerId, date: date});
			}
		});
	}
}

function incrementPeriod() {
	var period = $(this).text();
	var id = manager.determineTiddlerId(this);
	if (id != null) {
		$.ajax({
			url: serverUrl + "tickler/incrementPeriod",
			data: {id: id, period: period}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('ticklerUpdate', {event: 'incrementPeriod', id: id, period: period});
			}
		});
	}
}

function updatePeriodicity() {
	var period = $(this).attr('title');
	var id = manager.determineTiddlerId(this);
	if (id != null) {
		$.ajax({
			url: serverUrl + "tickler/updatePeriodicity",
			data: {id: id, period: period}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('ticklerUpdate', {event: 'updatePeriodicity', id: id, period: period});
			}
		});
	}
}

function updateRealm() {
	var realmId = $(this).val();
	if (realmId === "__new__") {
		alert('creating new realm');
		return;
	}

	var type = manager.determineTiddlerType(this);
	var id = manager.determineTiddlerId(this);
	if (id != null && type != "") {
		$.ajax({
			url: serverUrl + type + "/realmChange",
			data: {id: id, realm: realmId}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent(type + 'Update', {event: 'realmChange', id: id, realm: realmId});
			}
		});
	}
}

function updateArea() {
	var areaId = $(this).val();
	if (areaId === "__new__") {
		manager.showDialogByName('areaDialog', {});
		return;
	}

	var type = manager.determineTiddlerType(this);
	var id = manager.determineTiddlerId(this);
	if (id != null && type != "") {
		$.ajax({
			url: serverUrl + type + "/areaUpdate",
			data: {id: id, area: areaId}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent(type + 'Update', {event: 'areaUpdate', id: id, area: areaId});
			}
		});
	}
}

function updateContact() {
	var contactId = $(this).val();
	if (contactId === "__new__") {
		manager.showDialogByName('contactDialog', {});
		return;
	}

	var type = manager.determineTiddlerType(this);
	var id = manager.determineTiddlerId(this);
	if (id != null && type != "") {
		$.ajax({
			url: serverUrl + type + "/contactUpdate",
			data: {id: id, contact: contactId}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent(type + 'Update', {event: 'contactUpdate', id: id, contact: contactId});
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

function  dependsOnSource ( request, response ) {
	var actionId = manager.getCurrentActionId();
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/search",
			dataType: "json",
			data: {actionId: actionId, term: request.term},
			success: response
		});
	}
}

function saveDependsOnAction(event, ui) {
	var actionId = manager.determineActionId(event.currentTarget.activeElement);
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/dependsOnUpdate",
			data: {actionId: actionId, dependsOn: ui.item.value}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('actionUpdate', {event: 'dependOnUpdate', id: actionId});
			}
		});
	}
}

function deleteDependency() {
	var actionId = manager.determineActionId(this);
	if (actionId != null) {
		$.ajax({
			url: serverUrl + "action/deleteDependency",
			data: {actionId: actionId}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('actionUpdate', {event: 'deleteDependency', id: actionId});
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

function deleteTickler(ticklerId) {
	if (ticklerId != null) {
		$.ajax({
			url: serverUrl + "tickler/remove",
			data: {ticklerId: ticklerId}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('ticklerUpdate', {event: 'delete', id: ticklerId});
			}
		});
	}
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
			manager.raiseEvent('actionUpdate', {event: 'realmToggle', realm: realm, active: active});
			manager.raiseEvent('ticklerUpdate', {event: 'realmToggle', realm: realm, active: active});
		}
	});
}

function tl_viewAction(actionId, inFocus) {
	viewLoader("action/view", {actionId: actionId}, function(data) {
		var action = data.action; 

		var data = {
			action: action, 
			dependsOn : data.dependsOn,
			contexts: manager.getContexts(action.realm.id),
			areas: manager.getAreas(action.realm.id),
			contacts: manager.getContacts(action.realm.id),
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
		$('[name=dependsOn]', template).autocomplete({
			source: dependsOnSource,
			minLength: 2,
			select: saveDependsOnAction
		});
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

function tl_viewTickler(ticklerId, inFocus) {
	viewLoader("tickler/view", {ticklerId: ticklerId}, function(data) {
		var tickler = data.tickler; 

		var data = {
			tickler: tickler, 
			areas: manager.getAreas(tickler.realm.id),
			contacts: manager.getContacts(tickler.realm.id),
			realms: manager.getRealms(), 
			tabIndex: 1
		};
		
		var template = manager.tmpl("ticklerViewTemplate", data);

		var tiddler = $('#td_ticklr_' + tickler.id);
		if (tiddler.length) {
			tiddler.replaceWith(template);
		} else {
			template.appendTo('#stage');
		} 
		if (inFocus) {
			$(template).focus();
		}
		$('.dateBox').datepicker({
			dateFormat: 'D, d-M-y',
			onSelect: updateTicklerDate
		});
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
	$('.tiddler .deleteTicklerButton').live('click', function() {
		var ticklerId = manager.determineTicklerId(this);
		deleteTickler(ticklerId);
	});

	$('.action .chkOptionInput').live('click', completeAction);
	$('.tickler .chkOptionInput').live('click', completeTickler);
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
	$(".ticklers_pending").click(tl_activeTicklerDashboard);
	$(".new_action").click({manager:manager, dialog:'actionDialog'}, manager.showDialog);
	$('.new_tickler').click({manager:manager, dialog:'ticklerDialog'}, manager.showDialog);
	$('.contextAdd').live('click', {manager:manager, dialog:'contextDialog'}, manager.showDialog);
	$('.controls .chkContext').live('click', updateContextState);
	$('.controls .area').live('change', updateArea);
	$('.controls .contact').live('change', updateContact);
	$('.controls .deleteDependency').live('click', deleteDependency); 
	$('.controls .state .button').live('click', updatePeriodicity); 
	$('.controls .date .button').live('click', incrementPeriod); 
	$('.rollPeriod').live('click', incrementPeriod); 
	$('.dateControl').datepicker({
		dateFormat: 'dd/mm/yy'
	});
	$('.realm-tab').addClass("ui-corner-tl ui-corner-tr");
	$('.realm-add').addClass("ui-corner-tl ui-corner-tr");
}

function addRealmActionHandlers() {
	$('.realm').live('change', updateRealm);
	$('.realm-tab').live('click', toggleRealm);
	$('.realm-add').live('click', {manager:manager, dialog:'realmDialog'}, manager.showDialog);
}

function checkForActiveTicklers() {
	$.ajax({
		url: serverUrl + "tickler/activeCount",
		type: "GET",
		dataType: "json",
		success: function(data) {
			$('#ticklerAlert').toggle(data.count > 0);
			setTimeout(checkForActiveTicklers, 30000);
		}
	});
}

jQuery(document).ready(function() {
	manager.init({
		templates: ["actionViewTemplate", "dashboardTemplate", "ticklerViewTemplate", "activeTicklerDashboard"],
		dialogs: {
			"realmDialog" : new RealmDialog().init(), 
			"contextDialog" : new ContextDialog().init(),
			"areaDialog" : new AreaDialog().init(),
			"contactDialog" : new ContactDialog().init(),
			"ticklerDialog" : new TicklerDialog().init(),
			"actionDialog" : new ActionDialog().init()
		}
	});
	
	addTiddlerActionHandlers();
	addRealmActionHandlers();
	checkForActiveTicklers();
});


function formatTicklerDate(s) {
	return $.datepicker.formatDate('D, d-M-y', new Date(s));
}
