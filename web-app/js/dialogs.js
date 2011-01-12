$.Class.extend("Dialog", {}, {
	init : function(name, manager) {
		this.manager = manager;
		this.name = name;
		this.el = $('#' + this.name);
		$.data(this.el[0], 'parent', this);
		this.el.dialog({
		    autoOpen: false,
			buttons: {
				"OK" : this.onSubmit,
				"Cancel" : this.onCancel
			},
			resizable: false,
			modal: true
		});
		return this;
	},

	onSubmit: function() {
		var me = $.data(this, 'parent');
		if (me && me.isValid()) {
			$('form', this).submit();
		}
	},
	
	isValid : function() { return true },
	
	onCancel : function() {
		$(this).dialog("close");		
	},
	
	close : function() {
		$(this.el).dialog("close");		
	},
	
	show : function(event) {
		this.beforeShow(event);
		this.el.dialog("open");
	}, 
	
	beforeShow : function() {}
});

Dialog.extend("RealmDialog", {}, {
	init : function(manager) {
		this.title = 'New Realm';
		this._super('realm_dialog', manager);
 	},
 	
	isValid : function() {
		var name = $('[name="name"]', this.el).val();
		if (name.trim() === "") {
			alert('Please enter a name');
			return false;
	  }
	  return true;
	},

	beforeShow : function(event) {
		$('[name="name"]', this.el).val('');
		this.el.dialog("option", "title", 'New Realm');
	}, 
	
	onSuccess : function(data, textStatus) {
		this.close();

		var span = $('<span/>', {
			"class": "realm-tab realm-active ui-corner-tl ui-corner-tr",
			"text": data.realm.name
		});
		$('.realm-add').before(span);
	}
});

Dialog.extend("ContextDialog", {}, {
	init : function(manager) {
		this.title = 'New Context';
		this._super('context_dialog', manager);
 	},
 	
	isValid : function() {
		var name = $('[name=name]', this.el).val();
		if (name.trim() === "") {
			alert('Please enter a name');
			return false;
	  }
	  return true;
	},

	beforeShow : function(event) {
		var actionId = manager.getCurrentActionId();
		if (actionId) {
			var tiddler = manager.currentTiddler;
			var realm = $('.realm_select select', tiddler).val();
	
			$('[name=realm]', this.el).val(realm);
			$('[name=actionId]', this.el).val(actionId);
			$('[name=name]', this.el).val('');
			this.el.dialog("option", "title", this.title);
		} else {
			alert('Unable to get action id!');
		}
	}, 
	
	onSuccess : function(data, textStatus) {
		this.close();
		var event = {event: 'newContext', data: data};
		manager.raiseEvent('newContext', event);
	}
});

Dialog.extend("ActionDialog", {}, {
	init : function(manager) {
		this._super('action_dialog', manager);
 	},
 	
	isValid : function() {
		var name = $('[name=title]', this.el).val();
		if (name.trim() === "") {
			alert('Please enter a title');
			return false;
	  }
	  return true;
	},

	beforeShow : function(event) {
		var obj = event.currentTarget;
		
		var form = $('form', this.el);
		
		$('[name=type]', this.el).val(obj.id);
		$('[name=title]', this.el).val('');
		this.updateContext(obj);
		this.el.dialog("option", "title", 'New ' + event.data.type);
	}, 
	
	updateContext : function(obj) {
		var p = $(obj).parent();
		var tiddler = $(obj).closest('.tiddler');
		
		var projectId = "";
		if ($('.project', tiddler).length) {
			projectId = $(tiddler).attr('id').substr(10);
		}
		$('[name=project]', this.el).val(projectId);

		var state = "";
		if ($(p).hasClass('dc_state_Next')) state = 'Next';
		if ($(p).hasClass('dc_state_Future')) state = 'Future';
		if ($(p).hasClass('dc_state_WaitingFor')) state = 'WaitingFor';
		$('[name=state]', this.el).val(state);
		
		var ctx = "";
		if ($(p).hasClass('dc_ctx')) {
			ctx = $(p).text();
			ctx = ctx.substr(0, ctx.length-1)
		}
		$('[name=context]', this.el).val(ctx);

		var contact = "";
		if ($(p).hasClass('dc_contact')) {
			contact = $(p).text();
			contact = contact.substr(0, contact.length-1)
		}
		$('[name=contact]', this.el).val(contact);
	},
	
	onSuccess : function(data, textStatus) {
		this.close();
		tl_viewAction(data.action.id);
		manager.raiseEvent('actionUpdate', {event: 'newAction', data: data, id: data.action.id});
	}
});


Dialog.extend("AreaDialog", {}, {
	init : function(manager) {
		this.title = 'New Area';
		this._super('area_dialog', manager);
 	},
 	
	isValid : function() {
		var name = $('[name=name]', this.el).val();
		if (name.trim() === "") {
			alert('Please enter a name');
			return false;
	  }
	  return true;
	},

	beforeShow : function(event) {
		var tiddler = manager.currentTiddler;
		var realm = $('.realm_select select', tiddler).val();

		$('[name=realm]', this.el).val(realm);
		$('[name=name]', this.el).val('');
		this.el.dialog("option", "title", this.title);
	}, 

	onSuccess : function(data, textStatus) {
		this.close();
		var event = {event: 'newArea', data: data};
		manager.raiseEvent('newArea', event);
	}
});

Dialog.extend("ContactDialog", {}, {
	init : function(manager) {
		this.title = 'New Contact';
		this._super('contact_dialog', manager);
 	},
 	
	isValid : function() {
		var name = $('[name=name]', this.el).val();
		if (name.trim() === "") {
			alert('Please enter a name');
			return false;
	  }
	  return true;
	},

	beforeShow : function(event) {
		var tiddler = manager.currentTiddler;
		var realm = $('.realm_select select', tiddler).val();

		$('[name=realm]', this.el).val(realm);
		$('[name=name]', this.el).val('');
		$('[name=email]', this.el).val('');
		this.el.dialog("option", "title", this.title);
	}, 
	
	onSuccess : function(data, textStatus) {
		this.close();
		var event = {event: 'newContact', data: data};
		manager.raiseEvent('newContact', event);
	}
});

Dialog.extend("TicklerDialog", {}, {
	init : function(manager) {
		this.title = 'New Tickler';
		this._super('tickler_dialog', manager);
 	},
 	
	isValid : function() {
	   var name = $('[name=title]', this.el).val();
	   if (name.trim() === "") {
			alert('Please enter a title');
			return false;
	   }
	   var date = $('[name=date]', this.el).val();
	   if (date.trim() === "") {
			alert('Please enter a date');
			return false;
	   }
	  return true;
	},

	beforeShow : function(event) {
		var tiddler = manager.currentTiddler;
		$('[name=title]', this.el).val('');
		$('[name=date]', this.el).val('');
		this.el.dialog("option", "title", this.title);
	}, 
	
	onSuccess : function(data, textStatus) {
		this.close();
		manager.raiseEvent('ticklerUpdate', {event: 'newTickler', data: data, id: data.tickler.id});
	}
});

Dialog.extend("ProjectDialog", {}, {
	init : function(manager) {
		this.title = 'New Project';
		this._super('project_dialog', manager);
 	},
 	
	isValid : function() {
	   var name = $('[name=title]', this.el).val();
	   if (name.trim() === "") {
			alert('Please enter a title');
			return false;
	   }
	  return true;
	},

	updateContext : function(obj) {
		var p = $(obj).parent();
		if ($(p).hasClass('dc_status_Active')) $('[name=status]', this.el).val('Active')
		if ($(p).hasClass('dc_status_Someday')) $('[name=status]', this.el).val('Someday')
	},
	
	beforeShow : function(event) {
		var obj = event.currentTarget;
		this.updateContext(obj);
		$('[name=title]', this.el).val('');
		this.el.dialog("option", "title", this.title);
	}, 
	
	onSuccess : function(data, textStatus) {
		this.close();
		manager.raiseEvent('projectUpdate', {event: 'newProject', data: data, id: data.project.id});
	}
});

Dialog.extend("ReferenceDialog", {}, {
	init : function(manager) {
		this.title = 'New Reference';
		this._super('reference_dialog', manager);
 	},
 	
	isValid : function() {
	   var name = $('[name=title]', this.el).val();
	   if (name.trim() === "") {
			alert('Please enter a title');
			return false;
	   }
	  return true;
	},

	updateContext : function(obj) {
	},
	
	beforeShow : function(event) {
		var obj = event.currentTarget;
		this.updateContext(obj);
		$('[name=title]', this.el).val('');
		this.el.dialog("option", "title", this.title);
	}, 
	
	onSuccess : function(data, textStatus) {
		this.close();
		manager.raiseEvent('referenceUpdate', {event: 'newReference', data: data, id: data.reference.id});
	}
});
