Dialog = function(){
	this.name = "_dialog";
};

$.extend(Dialog.prototype, {
	init : function() {
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

RealmDialog = function() {
	this.name = 'realm_dialog';
	return this;
};

RealmDialog.prototype = $.extend({}, Dialog.prototype, {
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

ContextDialog = function() {
	this.name = 'context_dialog';
	this.title = 'New Context';
	return this;
};

ContextDialog.prototype = $.extend({}, Dialog.prototype, {
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

ActionDialog = function() {
	this.name = 'action_dialog';
	return this;
};

ActionDialog.prototype = $.extend({}, Dialog.prototype, {
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
		this.updateContext(obj);
		$('[name=type]', this.el).val(obj.id);
		$('[name=title]', this.el).val('');
		$('[name=state]', this.el).val('');
		this.el.dialog("option", "title", 'New ' + event.data.type);
	}, 
	
	updateContext : function(obj) {
		var p = $(obj).parent();
		var tiddler = $(obj).closest('.tiddler');
		if ($('.project', tiddler).length) {
			var projectId = $(tiddler).attr('id').substr(10);
			$('[name=project]', this.el).val(projectId);
		}
		
		if ($(p).hasClass('dc_state_Next')) $('[name=state]', this.el).val('Next')
		if ($(p).hasClass('dc_state_Future')) $('[name=state]', this.el).val('Future')
		if ($(p).hasClass('dc_state_WaitingFor')) $('[name=state]', this.el).val('WaitingFor');
		if ($(p).hasClass('dc_ctx')) {
			var ctx = $(p).text();
			ctx = ctx.substr(0, ctx.length-1)
			$('[name=context]', this.el).val(ctx);
		}
		if ($(p).hasClass('dc_contact')) {
			var contact = $(p).text();
			contact = contact.substr(0, contact.length-1)
			$('[name=contact]', this.el).val(contact);
		}
		
	},
	
	onSuccess : function(data, textStatus) {
		this.close();
		tl_viewAction(data.action.id);
		manager.raiseEvent('actionUpdate', {event: 'newAction', data: data, id: data.action.id});
	}
});


AreaDialog = function() {
	this.name = 'area_dialog';
	this.title = 'New Area';
	return this;
};

AreaDialog.prototype = $.extend({}, ContextDialog.prototype, {
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

ContactDialog = function() {
	this.name = 'contact_dialog';
	this.title = 'New Contact';
	return this;
};

ContactDialog.prototype = $.extend({}, Dialog.prototype, {
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

TicklerDialog = function() {
	this.name = 'tickler_dialog';
	this.title = 'New Tickler';
	return this;
};

TicklerDialog.prototype = $.extend({}, Dialog.prototype, {
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

ProjectDialog = function() {
	this.name = 'project_dialog';
	this.title = 'New Project';
	return this;
};

ProjectDialog.prototype = $.extend({}, Dialog.prototype, {
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
