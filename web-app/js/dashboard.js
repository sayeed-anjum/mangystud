$.Class.extend("Dashboard", {}, {
	init : function(manager, options) {
		this.name = options.name;
		this.title = options.title;
		this.url = options.url;
		this.templateName = "dashboardTemplate";
		this.manager = manager;
		this.listeners = [];
		this.onLoad = $.isFunction(options.onLoad)? options.onLoad : $.noop;
		this.addListener('close', this.onClose);
		return this;
	},
	
	refresh : function(manager, event, data) {
		var me = data.dashboard;
		var tiddler = $('#' + me.name);
		if (tiddler.length) {
			me.load();
		}
	},
	
	addListener : function(event, callback) {
		var listenerId = this.name + '_' + event + 'Listener';
		this.listeners.push(listenerId);
		this.manager.addListener(event, callback, listenerId, {dashboard: this});
	},
	
	onClose : function(manager, event, data) {
		var me = data.dashboard;
		if (me && event.id == me.name) {
			for (var j = 0; j < me.listeners.length; j++) {
				manager.removeListener(me.listeners[j]);
			}
		}
	},	
	
	load  : function(data) {
		var me = this;
		$.ajax({
			url: serverUrl + me.url,
			data: data, 
			type: "GET",
			dataType: "json",
			success: me.showView,
			context: me
		})
	},
	
	showView : function(result) {
		var html = this.onLoad(result);
		
		var data = {name: this.name,
			title: this.title,
			left: html.left, 
			right: html.right,
			tabIndex: 1
		};

		var template = manager.tmpl(this.templateName, data);

		var tiddler = $('#' + this.name);
		if (tiddler.length) {
			tiddler.replaceWith(template);
		} else {
			template.prependTo('#stage');
		} 
		
		$('.dateBox').datepicker({
			dateFormat: 'D, d-M-y',
			onSelect: updateTicklerDate
		});
	}
});
