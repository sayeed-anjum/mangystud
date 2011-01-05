$.Class.extend("AKListener", {}, {
	init : function(callback, key, data) {
		this.callback = $.isFunction(callback)? callback : $.noop;
		this.data = data? data : {};
		this.key = key;
	}
});

manager = {
	templates : {},
	realmCache : {},
	eventListeners : {},
	dialogs : {},
	viewers : {},
	
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
			for (var key in listeners) {
				var listener = listeners[key];
				listener.callback(this, event, listener.data);
			}
		}
	},

	addTemplate : function(name) {
		this.templates[name] = $.template(null, $("#" + name));
	},
	
	tmpl : function(name, data) {
		 return $.tmpl(this.templates[name], data);		
	}, 
	
	init : function(data) {
		var manager = this;
		this.dialogs = data.dialogs;
		this.viewers = data.viewers;

		$.each(data.templates, function(index, name) {
			manager.addTemplate(name);
		});

		this.updateCache(function() {
			if ($.isFunction(data.initialView)) {
				data.initialView();
			}
		});

		this.addListener('newContext', this.updateRealmCache, 'mgr_nclist');
		this.addListener('newArea', this.updateRealmCache, 'mgr_nalist');
		this.addListener('newContact', this.updateRealmCache, 'mgr_ncolist');
	},
	
	addListener : function(eventName, listener, key, data) {
		if (this.eventListeners[eventName] == undefined) {
			this.eventListeners[eventName] = {};
		}
		this.eventListeners[eventName][key] = new AKListener(listener, key, data);
	},
	
	removeListener : function(listenerName) {
		// this.printListeners('--------- before remove');
		for (var event in this.eventListeners) {
			delete this.eventListeners[event][listenerName];
		}
		// this.printListeners('--------- after remove');
	},
	
	printListeners : function(s) {
		console.log(s);
		for (var event in this.eventListeners) {
			console.log('event: ' + event);
			for (var l in this.eventListeners[event]) {
				var listener = this.eventListeners[event][l];
				console.log('  > listener: ' + listener.key);
			}
		}
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
			} else if ($(controlDiv).hasClass("contact")) {
				type = "contact";
			}
		}
		return type;
	},
	
	determineTiddlerId : function(obj) {
		var id = null;
		var tiddler = $(obj).closest('.tiddler');
		var link = $(obj).siblings('.tiddlyLink');
		if (link.length) {
			id = link[0].id.substr(10);
		} else {
			var controlDiv = $('.controls', tiddler);
			if (controlDiv.length) {
				id = controlDiv[0].id.substr(7);
			}
		}
		return id;
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
		if (data.success) {
			if (dialog) {
				dialog.onSuccess(data, textStatus);
			}
		} else {
			alert('Server error: ' + data.message);
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
	}, 
	
	getViewer : function(id) {
		return this.viewers[id];
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

function openTiddler(event, ui) {
	var id = ui.item.value;
	var viewerId = id.substr(0, 10);
	id = id.substr(10);
	var viewer = manager.getViewer(viewerId);
	if (viewer) viewer.show(id);
	return false;
}

function openProjectView(id) {
	manager.getViewer('td_projct_').show(id);
}

function refreshActionView(id, isNew) {
	manager.getViewer('td_action_').refresh(id, isNew);
}

function refreshTicklerView(id, isNew) {
	manager.getViewer('td_ticklr_').refresh(id, isNew);
}

function tl_viewAction(id, focus) {
	manager.getViewer('td_action_').loadView(id, focus);
}

function tl_viewTickler(id, focus) {
	manager.getViewer('td_ticklr_').refresh(id, focus);
}

function tl_viewProject(id, focus) {
	manager.getViewer('td_projct_').refresh(id, focus);
}

function tl_viewContact(id, focus) {
	manager.getViewer('td_contct_').refresh(id, focus);
}

function getOpenActionIdsForRealm(id) {
	var actionIds = [];
	$.each($('.controls .realm'), function(index, value) {
		if ($(this).val() == id) {
			actionIds.push(manager.determineTiddlerId(this))
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
	var actionId =  manager.determineTiddlerId(this);
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
	var actionId = manager.determineTiddlerId(obj);
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
	var ticklerId = manager.determineTiddlerId(this);
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
	var actionId = manager.determineTiddlerId(this);
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
	var actionId = manager.determineTiddlerId(this);
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
				if (data.success) {
					manager.raiseEvent(type + 'Update', {event: 'delete', id: id});
				} else {
					alert('Unable to delete this item: ' + data.message);
				}
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
	// TODO: replace with deleteTiddlerCommand()
	var actionId = manager.determineTiddlerId(this);
	deleteAction(actionId);
}

function deleteTicklerButton() {
	// TODO: replace with deleteTiddlerCommand()
	var ticklerId = manager.determineTiddlerId(this);
	deleteTickler(ticklerId);
}

function deleteProjectButton() {
	// TODO: replace with deleteTiddlerCommand()
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
	var tiddler = $(this).closest('.tiddler');
	var id = $(tiddler).attr('id');
	$(tiddler).remove();
	manager.raiseEvent('close', {event: 'closeTiddler', id: id, tiddler: tiddler});
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
	var params = {id: id, title: title, content: content, type: type}
	if (type == 'contact') {
		params.email = $.trim($('[name=email]', editor).val());
	}
	if (title == '') {
		alert('Please specify a proper title!');
		return false;
	}
	if (id != null) {
		$.ajax({
			url: serverUrl + "tiddler/update",
			data: params, 
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
	$('.tiddlerDetails', tiddler).hide();
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
	$('.tiddlerDetails', tiddler).show();
	$('.editToolbar', tiddler).hide();
	$('.editor', tiddler).hide();
	$('.td_title', tiddler).empty();
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
			data.count > 0? $('#ticklerAlert').show() : $('#ticklerAlert').hide();
			data.inboxCount > 0? $('#inboxAlert').show() : $('#inboxAlert').hide();
			setTimeout(checkForActiveTicklers, 120000);
		}
	});
}

function initTiddlerManager() {
	manager.init({
		templates: ["dashboardTemplate", "activeTicklerDashboard"],
		dialogs: {
			"realmDialog" : new RealmDialog().init(), 
			"contextDialog" : new ContextDialog().init(),
			"areaDialog" : new AreaDialog().init(),
			"contactDialog" : new ContactDialog().init(),
			"ticklerDialog" : new TicklerDialog().init(),
			"projectDialog" : new ProjectDialog().init(),
			"actionDialog" : new ActionDialog().init()
		},
		viewers : {
			"td_action_" : new ActionViewer(manager),
			"td_ticklr_" : new TicklerViewer(manager),
			"td_projct_" : new ProjectViewer(manager),
			"td_contact_" : new ContactViewer(manager)
		},
		initialView: tl_nextAndWaiting
	});
	
	addTiddlerActionHandlers();
	addRealmActionHandlers();
	checkForActiveTicklers();
	jQuery("abbr.timeago").timeago();
	
	$('#searchBoxDiv').show();
	$('#searchBox').autocomplete({
		source: serverUrl + "action/csearch",
		minLength: 2,
		focus: function(event,ui) {
			// $('#searchBox').val(ui.item.label);
			return false;
		},
		select: openTiddler
	});
}

function formatTicklerDate(s) {
	return s == null? '(set date)' : $.datepicker.formatDate('D, d-M-y', new Date(s));
}
