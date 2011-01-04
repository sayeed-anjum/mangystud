// uses JavaScriptMVC class (see http://jupiterjs.com/news/a-simple-powerful-lightweight-class-for-jquery))
$.Class.extend("Viewer", {}, {
	prefix : 'td_tiddlr_',
	
	init : function(manager) {
		this.manager = manager;
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
				jQuery("abbr.timeago").timeago();
			}
		});
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
		this.prefix = 'td_action_';
		this.templateName = "actionViewTemplate";
		this.manager = manager;
		manager.addTemplate(this.templateName);
		return this;
	},  
	
	dataCallback : function(data) {
		var action = data.action; 
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
			source: dependsOnSource,
			minLength: 2,
			select: saveDependsOnAction
		});
		$('[name=project]', template).autocomplete({
			source: projectSource,
			minLength: 2,
			select: saveProjectAction
		});
	},
	
	loadView : function(id, focus) {
		this.viewLoader("action/view", {actionId: id}, focus);
	}
});

Viewer.extend("TicklerViewer", {}, {
	init: function(manager) {
		this.prefix = 'td_ticklr_';
		this.templateName = "ticklerViewTemplate";
		this.manager = manager;
		manager.addTemplate(this.templateName);
		return this;
	},
	
	dataCallback : function(data) {
		return {
			tickler: data.tickler, 
			id: data.tickler.id,
			realmId : data.tickler.realm.id,
			project: data.project
		};
	}, 
	
	postLoad : function(template, data) {
		$('.dateBox').datepicker({
			dateFormat: 'D, d-M-y',
			onSelect: updateTicklerDate
		});
		$('[name=project]', template).autocomplete({
			source: projectSource,
			minLength: 2,
			select: saveProjectAction
		});
	},
	
	loadView : function(id, focus) {
		this.viewLoader("tickler/view", {ticklerId: id}, focus);
	}
});

Viewer.extend("ProjectViewer", {}, {
	init: function(manager) {
		this.prefix = 'td_projct_';
		this.templateName = "projectViewTemplate";
		this.manager = manager;
		manager.addTemplate(this.templateName);
		return this;
	},  
	
	dataCallback : function(data) {
		var project = data.project;
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
		this.viewLoader("project/view", {projectId: id}, focus);
	}
});

Viewer.extend("ContactViewer", {}, {
	init: function(manager) {
		this.prefix = 'td_contct_';
		this.templateName = "contactViewTemplate";
		this.manager = manager;
		manager.addTemplate(this.templateName);
		return this;
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
