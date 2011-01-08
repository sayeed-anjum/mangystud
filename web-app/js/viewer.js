// uses JavaScriptMVC class (see http://jupiterjs.com/news/a-simple-powerful-lightweight-class-for-jquery))
$.Class.extend("Viewer", {}, {
	prefix : 'td_tiddlr_',
	
	init : function(manager, options) {
		this.manager = manager;
		this.prefix = options.prefix;
		this.templateName = options.templateName;
		manager.addTemplate(this.templateName);
	},
	
	viewLoader : function(url, data, inFocus) {
		var me = this;
		var manager = this.manager;
		$.ajax({
			url: serverUrl + url,
			data: data, 
			type: "GET",
			dataType: "json",
			success: function(data) {
				var data = me.dataCallback(data);
				$.extend(data, {
					contexts: manager.getContexts(data.realmId),
					areas: manager.getAreas(data.realmId),
					contacts: manager.getContacts(data.realmId),
					realms: manager.getRealms(), 
					tabIndex: 1
				});
				var template = manager.tmpl(me.templateName, data);

				var tiddler = $('#' + me.prefix + data.id);
				if (tiddler.length) {
					tiddler.replaceWith(template);
				} else {
					template.appendTo('#stage');
				} 
				if (inFocus) {
					$(template).focus();
				}

				me.postLoad(template, data);
				$('[name=project]', template).autocomplete({
					source: me.projectSource,
					minLength: 2,
					select: me.saveProjectAction
				});
				jQuery("abbr.timeago").timeago();
			}
		});
	},

	projectSource : function( request, response ) {
		$.ajax({
			url: serverUrl + "project/search",
			dataType: "json",
			data: {term: request.term},
			success: response
		});
	},

	saveProjectAction : function(event, ui) {
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
	},

	show : function(id) {
		var tiddler = $('#' + this.prefix + id);
		if (tiddler.length) {
			tiddler.focus();
		} else {
			this.loadView(id, true);
		}
	}, 
	
	refresh : function(id, isNew) {
		var tiddler = $('#' + this.prefix + id);
		if (isNew || tiddler.length) {
			this.loadView(id);
		}
	}, 
	
	loadView : function(id, focus) {
		// abstract method
	}, 
	
	dataCallback : function(data) {
		// abstract method
	},
	
	postLoad : function(template, data) {
		// abstract method
	}
});

Viewer.extend("ActionViewer", {}, {
	init: function(manager) {
		this._super(manager, {
			prefix : 'td_action_',
			templateName : "actionViewTemplate"
		});
		manager.addListener('actionUpdate', this.actionUpdateListener, 'actionViewer_actionUpdateListener', {viewer: this});
		return this;
	},
	
	actionUpdateListener : function(manager, event, data) {
		var me = data.viewer;
		if (event.event == 'delete') {
			$('#td_action_' + event.id).remove();
		} else {
			me.refresh(event.id, (event.event=='newAction'));
		}
	},
	
	dataCallback : function(data) {
		var action = data.tiddler; 
		var data = {
			id: action.id,
			realmId : action.realm.id,
			action: action, 
			dependsOn : data.dependsOn,
			project: data.project
		};
		return data;
	}, 
	
	postLoad : function(template, data) {
		$('[name=dependsOn]', template).autocomplete({
			source: this.dependsOnSource,
			minLength: 2,
			select: this.saveDependsOnAction
		});
	},
	
	dependsOnSource : function( request, response ) {
		var actionId = manager.getCurrentActionId();
		if (actionId != null) {
			$.ajax({
				url: serverUrl + "action/search",
				dataType: "json",
				data: {actionId: actionId, term: request.term},
				success: response
			});
		}
	},

	saveDependsOnAction : function(event, ui) {
		var actionId = manager.determineTiddlerId(event.currentTarget.activeElement);
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
	},

	loadView : function(id, focus) {
		this.viewLoader("action/view", {id: id}, focus);
	}
});

Viewer.extend("TicklerViewer", {}, {
	init: function(manager) {
		this._super(manager, {
			prefix : 'td_ticklr_',
			templateName : "ticklerViewTemplate"
		});
		manager.addListener('ticklerUpdate', this.ticklerUpdateListener, 'ticklerViewer_ticklerUpdateListener', {viewer: this});
		return this;
	},
	
	ticklerUpdateListener : function(manager, event, data) {
		var me = data.viewer;
		if (event.event == 'delete') {
			$('#td_ticklr_' + event.id).remove();
		} else {
			me.refresh(event.id, (event.event=='newTickler'));
		}
	},
	
	dataCallback : function(data) {
		return {
			tickler: data.tiddler, 
			id: data.tiddler.id,
			realmId : data.tiddler.realm.id,
			project: data.project
		};
	}, 
	
	postLoad : function(template, data) {
		$('.dateBox').datepicker({
			dateFormat: 'D, d-M-y',
			onSelect: updateTicklerDate
		});
	},
	
	loadView : function(id, focus) {
		this.viewLoader("tickler/view", {id: id}, focus);
	}
});

Viewer.extend("ProjectViewer", {}, {
	init: function(manager) {
		this._super(manager, {
			prefix : 'td_projct_',
			templateName : "projectViewTemplate"
		});
		manager.addListener('actionUpdate', this.refreshProjectDetails, 'projectViewer_actionUpdateListener', {viewer: this});
		manager.addListener('ticklerUpdate', this.refreshProjectDetails, 'projectViewer_ticklerUpdateListener', {viewer: this});
		manager.addListener('projectUpdate', this.projectUpdateListener, 'projectViewer_projectUpdateListener', {viewer: this});
		manager.addListener('referenceUpdate', this.refreshProjectDetails, 'projectViewer_referenceUpdateListener', {viewer: this});
		return this;
	},  
	
	projectUpdateListener : function(manager, event, data) {
		var me = data.viewer;
		if (event.event == 'delete') {
			$('#td_projct_' + event.id).remove();
		} else {
			me.refresh(event.id, (event.event=='newProject'));
		}
	},
	
	refreshProjectDetails : function(manager, event, data) {
		var me = data.viewer;
		var views = $('.viewer.project').parents('.tiddler');
		var projectViews = [];
		$.each(views, function(index, value){
			projectViews.push(value);
		});

		for (var j = 0; j < projectViews.length; j++) {
			var viewId = projectViews[j].id.substr(10); 
			me.refresh(viewId);
		}
	},
	
	dataCallback : function(data) {
		var project = data.tiddler;
		prefix =  "______" + project.id;
		prefix = 'p' + prefix.substr(prefix.length-5) + '@';

		var data = {
			project: project, 
			realmId : project.realm.id,
			id: project.id,
			prefix: prefix,
			tiddlers: data.tiddlers
		};
		return data;
	}, 
	
	postLoad : function(template, data) {
	},
	
	loadView : function(id, focus) {
		this.viewLoader("project/view", {id: id}, focus);
	}
});

Viewer.extend("ReferenceViewer", {}, {
	init: function(manager) {
		this._super(manager, {
			prefix : 'td_refrnc_',
			templateName : "referenceViewTemplate"
		});
		manager.addListener('referenceUpdate', this.updateListener, 'referenceViewer_updateListener', {viewer: this});
		return this;
	},
	
	updateListener : function(manager, event, data) {
		var me = data.viewer;
		if (event.event == 'delete') {
			$('#td_refrnc_' + event.id).remove();
		} else {
			me.refresh(event.id, (event.event=='newReference'));
		}
	},
	
	dataCallback : function(data) {
		return {
			reference: data.tiddler, 
			id: data.tiddler.id,
			realmId : data.tiddler.realm.id,
			project: data.project
		};
	}, 
	
	loadView : function(id, focus) {
		this.viewLoader("reference/view", {id: id}, focus);
	}
});

Viewer.extend("ContactViewer", {}, {
	init: function(manager) {
		this._super(manager, {
			prefix : 'td_contct_',
			templateName : "contactViewTemplate"
		});
		manager.addListener('contactUpdate', this.contactUpdateListener, 'contactViewer_contactUpdateListener', {viewer: this});
		return this;
	},  
	
	contactUpdateListener : function(manager, event, data) {
		var me = data.viewer;
		me.refresh(event.id);
		manager.updateCache(function() {
			manager.updateRealmCache(manager, event);
		});
	},
	
	dataCallback : function(data) {
		var contact = data.contact;
		prefix =  "______" + contact.id;
		prefix = 'c' + prefix.substr(prefix.length-5) + '@';
		contact.title = contact.name

		var data = {
			contact: contact, 
			id: cotact.id,
			prefix: prefix,
			tiddlers: data.tiddlers,
			realmId : contact.realm.id
		};
		return data;
	}, 
	
	postLoad : function(template, data) {
	},
	
	loadView : function(id, focus) {
		this.viewLoader("realm/contactDashboard", {contactId: id}, focus);
	}
});
