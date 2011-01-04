$.Class.extend("Dashboard", {}, {
	init : function(manager, options) {
		this.name = options.name;
		this.title = options.title;
		this.url = options.url;
		this.templateName = "dashboardTemplate";
		this.onLoad = $.isFunction(options.onLoad)? options.onLoad : $.noop;
		return this;
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
