manager = {
	templates : {},
	realmCache : {},
	eventListeners : {},
	staticTiddlers : {},
	ticklerDashboards : {},
	projectDashboards: {},
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
		var ticklerIds = getOpenTiddlerIdsForRealm(event.data.realm.id);
		$.each(ticklerIds, function(index, value) {
			refreshTicklerView(value);
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

	updateProjectDashboards : function() {
		for (var key in this.projectDashboards) {
			var tiddler = $('#' + key);
			if (tiddler.length) {
				var fn = this.projectDashboards[key];
				if ($.isFunction(fn)) {
					fn();
				}
			}
		}
	},

	actionUpdateListener : function(manager, event) {
		manager.updateStaticActionTiddlers();
		if (event.event == 'delete') {
			$('#td_action_' + event.id).remove();
		} else {
			refreshActionView(event.id, (event.event=='newAction'));
			refreshProjectDetailsView(event)
		}
	}, 
	
	ticklerUpdateListener : function(manager, event) {
		manager.updateTicklerDashboards();
		if (event.event == 'delete') {
			$('#td_ticklr_' + event.id).remove();
		} else {
			refreshTicklerView(event.id, (event.event=='newTickler'));
			refreshProjectDetailsView(event)
		}
	}, 

	projectUpdateListener : function(manager, event) {
		manager.updateProjectDashboards();
		if (event.event == 'delete') {
			$('#td_projct_' + event.id).remove();
		} else {
			refreshProjectView(event.id, (event.event=='newProject'));
		}
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

		$.extend(this.projectDashboards, {			
			"projectDashboard": tl_projectDashboard 
		});

		this.updateCache(function() {
			$.each(data.templates, function(index, name) {
				manager.templates[name] = $.template(null, $("#" + name));
			});
			if ($.isFunction(data.initialView)) {
				data.initialView();
			}
		});

		this.eventListeners.actionUpdate = [this.actionUpdateListener];
		this.eventListeners.ticklerUpdate = [this.ticklerUpdateListener];
		this.eventListeners.projectUpdate = [this.projectUpdateListener];
		this.eventListeners.newContext = [this.updateRealmCache];
		this.eventListeners.newArea = [this.updateRealmCache];
		this.eventListeners.newContact = [this.updateRealmCache];
	}, 
	
	determineTiddlerType : function(obj) {
		var type = "";
		var tiddler = $(obj).closest('.tiddler');
		var controlDiv = $('.controls', tiddler);
		if (!controlDiv.length) {
			controlDiv = $(obj).closest('.link-container');
		} 
		if (controlDiv.length) {
			if ($(controlDiv).hasClass("action")) {
				type = "action";
			} else if ($(controlDiv).hasClass("tickler")) {
				type = "tickler";
			} else if ($(controlDiv).hasClass("project")) {
				type = "project";
			}
		}
		return type;
	},
	
	determineTiddlerId : function(obj) {
		var id = null;
		var tiddler = $(obj).closest('.tiddler');
		var controlDiv = $('.controls', tiddler);
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

function refreshActionView(actionId, isNew) {
	var tiddler = $('#td_action_' + actionId);
	if (isNew || tiddler.length > 0) {
		tl_viewAction(actionId);
	}
}

function refreshTicklerView(id, isNew) {
	var tiddler = $('#td_ticklr_' + id);
	if (isNew || tiddler.length > 0) {
		tl_viewTickler(id);
	}
}

function refreshProjectView(id, isNew) {
	var tiddler = $('#td_projct_' + id);
	if (isNew || tiddler.length > 0) {
		tl_viewProject(id);
	}
}

function refreshProjectDetailsView(event) {
	var views = $('.viewer.project').parents('.tiddler');
	var projectViews = [];
	$.each(views, function(index, value){
		projectViews.push(value);
	});

	for (var j = 0; j < projectViews.length; j++) {
		var viewId = projectViews[j].id.substr(10); 
		tl_viewProject(viewId);
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

function getOpenTiddlerIdsForRealm(id) {
	var tiddlerIds = [];
	$.each($('.controls .realm'), function(index, value) {
		if ($(this).val() == id) {
			tiddlerIds.push(manager.determineTiddlerId(this))
		}
	});
	return tiddlerIds;
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
	var id = manager.determineTiddlerId(this);
	if (id != null) {
		$.ajax({
			url: serverUrl + "tiddler/complete",
			data: {id: id, done: done}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('ticklerUpdate', {event: 'complete', id: id});
			}
		});
	}
}

function completeProject() {
	var done = $(this).is(':checked');
	var id = manager.determineTiddlerId(this);
	if (id != null) {
		$.ajax({
			url: serverUrl + "tiddler/complete",
			data: {id: id, done: done}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('projectUpdate', {event: 'complete', id: id});
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

function updateProjectStatus() {
	var status = $(this).attr('title');
	var id = manager.determineTiddlerId(this);
	if (id != null) {
		$.ajax({
			url: serverUrl + "project/updateStatus",
			data: {id: id, status: status}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent('projectUpdate', {event: 'updateStatus', id: id, status: status});
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
			url: serverUrl + "tiddler/realmChange",
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
			url: serverUrl + "tiddler/areaUpdate",
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
			url: serverUrl + "tiddler/contactUpdate",
			data: {id: id, contact: contactId}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent(type + 'Update', {event: 'contactUpdate', id: id, contact: contactId});
			}
		});
	}
}

function toggleStar() {
	var type = manager.determineTiddlerType(this);
	var id = manager.determineTiddlerId(this);
	if (id != null && type != "") {
		$.ajax({
			url: serverUrl + "tiddler/toggleStar",
			data: {id: id}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent(type + 'Update', {event: 'toggleStar', id: id});
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
				manager.raiseEvent('actionUpdate', {event: 'dependOnUpdate', id: actionId, item: ui.item});
			}
		});
	}
}

function  projectSource ( request, response ) {
	$.ajax({
		url: serverUrl + "project/search",
		dataType: "json",
		data: {term: request.term},
		success: response
	});
}

function saveProjectAction(event, ui) {
	var obj = event.currentTarget.activeElement;
	var type = manager.determineTiddlerType(obj);
	var id = manager.determineTiddlerId(obj);
	if (id != null) {
		$.ajax({
			url: serverUrl + "tiddler/projectUpdate",
			data: {id: id, projectId: ui.item.value}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent(type + 'Update', {event: 'projectUpdate', id: id, item: ui.item});
			}
		});
	}
}

function makeTickler() {
	var me = this;
	var type = manager.determineTiddlerType(this);
	var id = manager.determineTiddlerId(this);
	if (type == 'action' && id != null) {
		$.ajax({
			url: serverUrl + "action/makeTickler",
			data: {id: id}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				$(me).closest('.tiddler').remove();
				tl_viewTickler(data.tickler.id, true);
				var event = {event: 'makeTickler', id: id};
				manager.raiseEvent('actionUpdate', event);
				manager.raiseEvent('ticklerUpdate', event);
			}
		});
	}
}

function makeAction() {
	var me = this;
	var type = manager.determineTiddlerType(this);
	var id = manager.determineTiddlerId(this);
	if (type == 'tickler' && id != null) {
		$.ajax({
			url: serverUrl + "tickler/makeAction",
			data: {id: id}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				$(me).closest('.tiddler').remove();
				tl_viewAction(data.action.id, true);
				var event = {event: 'makeAction', id: id};
				manager.raiseEvent('actionUpdate', event);
				manager.raiseEvent('ticklerUpdate', event);
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

function unlinkProject() {
	var type = manager.determineTiddlerType(this);
	var id = manager.determineTiddlerId(this);
	if (id != null) {
		$.ajax({
			url: serverUrl + "tiddler/deleteProject",
			data: {id: id}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent(type + 'Update', {event: 'deleteProject', id: id});
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

function deleteTiddler(type, id) {
	if (id != null) {
		$.ajax({
			url: serverUrl + "tiddler/remove",
			data: {id: id}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent(type + 'Update', {event: 'delete', id: id});
			}
		});
	}
}

function deleteProject(id) {
	deleteTiddler("project", id);
}

function deleteAction(id) {
	deleteTiddler("action", id);
}

function deleteTickler(id) {
	deleteTiddler("tickler", id);
}

function deleteTiddlerCommand() {
	var type = manager.determineTiddlerType(this);
	var id = manager.determineTiddlerId(this);
	deleteTiddler(type, id);
}

function deleteActionButton() {
	var actionId = manager.determineActionId(this);
	deleteAction(actionId);
}

function deleteTicklerButton() {
	var ticklerId = manager.determineTicklerId(this);
	deleteTickler(ticklerId);
}

function deleteProjectButton() {
	var projectId = manager.determineTiddlerId(this);
	deleteProject(projectId);
}

function cancelCloseTiddler() {
		cancelTiddler.call(this);
		closeTiddler.call(this);
}

function doneCloseTiddler() {
	if (doneTiddler.call(this)) {
		closeTiddler.call(this);
	}
}


function closeTiddler() {
	$(this).closest('.tiddler').remove();
}

function closeOtherTiddlers() {
	var id = $(this).closest('.tiddler').attr('id');
	var kids = $('#stage').children(':not(#' + id + ')');
	$.each(kids, function(index, k){
		$(k).remove();
	});
}

function doneTiddler() {
	var id = manager.determineTiddlerId(this);
	var type = manager.determineTiddlerType(this);
	var tiddler = $(this).closest('.tiddler');
	var editor = $('.editor', tiddler);
	var title = $.trim($('[name=title]', editor).val());
	var content = $.trim($('[name=content]', editor).val());
	if (title == '') {
		alert('Please specify a proper title!');
		return false;
	}
	if (id != null) {
		$.ajax({
			url: serverUrl + "tiddler/update",
			data: {id: id, title: title, content: content}, 
			type: "POST",
			dataType: "json",
			success: function(data) {
				manager.raiseEvent(type + 'Update', {event: 'editTiddler', id: id, data: data});
			}
		});
	}
	return true;
}

function editTiddler() {
	var tiddler = $(this).closest('.tiddler');
	var editor = $('.editor', tiddler);
	$('.viewToolbar', tiddler).hide();
	$('.viewer', tiddler).hide();
	$('.content', tiddler).hide();
	$('.projectDetails', tiddler).hide();
	$('.editToolbar', tiddler).show();
	$(editor).show();
	$('[name=title]', editor).select().focus();
	$('.td_title', tiddler).text($('[name=oldTitle]', editor).val());
}

function cancelTiddler() {
	var tiddler = $(this).closest('.tiddler');
	var editor = $('.editor', tiddler);
	$('[name=title]', editor).val($('[name=oldTitle]', editor).val());
	$('[name=content]', editor).val($('[name=oldContent]', editor).val());
	$('.viewToolbar', tiddler).show();
	$('.viewer', tiddler).show();
	$('.content', tiddler).show();
	$('.projectDetails', tiddler).show();
	$('.editToolbar', tiddler).hide();
	$('.editor', tiddler).hide();
	$('.td_title', tiddler).empty();
}

function tl_viewAction(actionId, inFocus) {
	viewLoader("action/view", {actionId: actionId}, function(data) {
		var action = data.action; 

		var data = {
			action: action, 
			dependsOn : data.dependsOn,
			project: data.project,
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
		$('[name=project]', template).autocomplete({
			source: projectSource,
			minLength: 2,
			select: saveProjectAction
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
			project: data.project,
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
		$('[name=project]', template).autocomplete({
			source: projectSource,
			minLength: 2,
			select: saveProjectAction
		});
	});
	
}

function tl_viewProject(projectId, inFocus) {
	viewLoader("project/view", {projectId: projectId}, function(data) {
		var project = data.project;
		prefix =  "______" + project.id;
		prefix = 'p' + prefix.substr(prefix.length-5) + '@';

		var data = {
			project: project, 
			prefix: prefix,
			tiddlers: data.tiddlers,
			areas: manager.getAreas(project.realm.id),
			contacts: manager.getContacts(project.realm.id),
			realms: manager.getRealms(), 
			tabIndex: 1
		};
		
		var template = manager.tmpl("projectViewTemplate", data);

		var tiddler = $('#td_projct_' + project.id);
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

function addTiddlerActionHandlers() {
	$('.tiddler').live('mouseenter', function() {
		$(this).addClass("selected");
		manager.currentTiddler = this;
	});
	$('.tiddler').live('mouseleave', function() {
		$(this).removeClass("selected");
	});
	$('.tiddler .command_closeTiddler').live('click', closeTiddler);
	$('.tiddler .command_closeOthers').live('click', closeOtherTiddlers);
	$('.tiddler .command_editTiddler').live('click', editTiddler);
	$('.tiddler .vw_title').live('dblclick', editTiddler);
	$('.tiddler .tiddlerContent').live('dblclick', editTiddler);
	$('.tiddler .command_doneTiddler').live('click', doneTiddler);
	$('.tiddler .command_doneCloseTiddler').live('click', doneCloseTiddler);
	$('.tiddler .command_cancelTiddler').live('click', cancelTiddler);
	$('.tiddler .command_cancelCloseTiddler').live('click', cancelCloseTiddler);
	$('.tiddler .command_deleteTiddler').live('click', deleteTiddlerCommand);
	$('.tiddler .deleteActionButton').live('click', deleteActionButton);
	$('.tiddler .deleteTicklerButton').live('click', deleteTicklerButton);
	$('.tiddler .deleteProjectButton').live('click', deleteProjectButton);

	$('.action .chkOptionInput').live('click', completeAction);
	$('.tickler .chkOptionInput').live('click', completeTickler);
	$('.project .chkOptionInput').live('click', completeProject);
	$('.Next').live('click', nextAction);
	$('.WaitingFor').live('click', waitingForAction);
	$('.Future').live('click', futureAction);
	$('.Starred').live('click', toggleStar);
	$('.Active').live('click', {status: 'Active'}, updateProjectStatus);
	$('.Someday').live('click', {status: 'Someday'}, updateProjectStatus);
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
	$(".new_action").live('click', {manager:manager, dialog:'actionDialog', type:'Action'}, manager.showDialog);
	$('.new_tickler').live('click', {manager:manager, dialog:'ticklerDialog', type:'Tickler'}, manager.showDialog);
	$('.new_project').live('click', {manager:manager, dialog:'projectDialog', type:'Project'}, manager.showDialog);
	$('.contextAdd').live('click', {manager:manager, dialog:'contextDialog'}, manager.showDialog);
	$('.controls .chkContext').live('click', updateContextState);
	$('.controls .area').live('change', updateArea);
	$('.controls .contact').live('change', updateContact);
	$('.controls .deleteDependency').live('click', deleteDependency); 
	$('.controls .unlinkProject').live('click', unlinkProject); 
	$('.controls .period .button').live('click', updatePeriodicity); 
	$('.controls .date .button').live('click', incrementPeriod); 
	$('.rollPeriod').live('click', incrementPeriod); 
	$('.dateControl').datepicker({
		dateFormat: 'dd/mm/yy'
	});
	$('.makeTickler').live('click', makeTickler);
	$('.makeAction').live('click', makeAction);
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
			setTimeout(checkForActiveTicklers, 120000);
		}
	});
}

function initTiddlerManager() {
	manager.init({
		templates: ["actionViewTemplate", "dashboardTemplate", 
		            "ticklerViewTemplate", "projectViewTemplate", 
		            "activeTicklerDashboard"],
		dialogs: {
			"realmDialog" : new RealmDialog().init(), 
			"contextDialog" : new ContextDialog().init(),
			"areaDialog" : new AreaDialog().init(),
			"contactDialog" : new ContactDialog().init(),
			"ticklerDialog" : new TicklerDialog().init(),
			"projectDialog" : new ProjectDialog().init(),
			"actionDialog" : new ActionDialog().init()
		},
		initialView: tl_nextAndWaiting
	});
	
	addTiddlerActionHandlers();
	addRealmActionHandlers();
	checkForActiveTicklers();
	
	$('#inboxAlert').show();
}

function formatTicklerDate(s) {
	return s == null? '(set date)' : $.datepicker.formatDate('D, d-M-y', new Date(s));
}
