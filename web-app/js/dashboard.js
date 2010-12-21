DashboardView = function() {};

$.extend(DashboardView.prototype, {
	init : function(options) {
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
	}
});

function tl_actionDashboard() {
	var dashboard = new DashboardView();
	dashboard.init({
		name: 'actionDashboard', 
		title: 'Action Dashboard By Context', 
		url: 'action/dashboard',
		onLoad: function(result) {
			var leftHtml = getContextActionsHtml(result.state.Next, 'Next Actions', ["on", "off", "off"]);
			leftHtml += getContextActionsHtml(result.state.WaitingFor, 'Waiting Actions', ["off", "on", "off"]);

			var rightHtml = getContextActionsHtml(result.state.Future, 'Future Actions', ["off", "off", "on"]);
			rightHtml += getDoneActionsHtml(result.done, 'Done Actions')
			
			return {left: leftHtml, right: rightHtml}
		}
	}).load();
}

function tl_nextActions() {
	var dashboard = new DashboardView();
	dashboard.init({
		name: 'nextActions', 
		title: 'Next Actions By Context', 
		url: 'action/nextActions',
		onLoad: function(result) {
			var leftHtml = getContextActionsHtml(result.state.Next, 'Next Actions', ["on", "off", "off"]);
			return {left: leftHtml, right: ""}
		}
	}).load();
}

function tl_nextAndWaiting() {
	var dashboard = new DashboardView();
	dashboard.init({
		name: 'nextAndWaiting', 
		title: 'Next And Waiting Actions By Context', 
		url: 'action/next_waiting',
		onLoad: function(result) {
			var leftHtml = getContextActionsHtml(result.state.Next, 'Next Actions', ["on", "off", "off"]);
			var rightHtml = getContextActionsHtml(result.state.WaitingFor, 'Waiting Actions', ["off", "on", "off"]);
			return {left: leftHtml, right: rightHtml}
		}
	}).load();
}

function getContextActionsHtml(stateMap, title, state) {
	if (stateMap == undefined) return "";
	
	var html = "<div class='mgtdList'><h1>" + title + "</h1>";
	for (var ctx in stateMap) {
		html += "<div class='innerList'><h2>" + ctx + "</h2>";
		var ctxActions = stateMap[ctx];
		for (var j = 0; j < ctxActions.length; j++) {
			var action = ctxActions[j];
			html += "<span class='action'>" +
					"<input type='checkbox' class='chkOptionInput'" + (action.done? " checked='checked'>" : ">") +  
					"<a class='button Next " + state[0] + "' href='javascript:;' title='Next'>n</a>" +
					"<a class='button WaitingFor off " + state[1] + "' href='javascript:;' title='Waiting For'>w</a>" +
					"<a class='button Future off " + state[2] + "' href='javascript:;' title='Future'>f</a>" +
					"<a class='button Starred off' href='javascript:;' title='Starred'>★</a>" +
					"<span>&nbsp;</span>" + 
					"<a class='tiddlyLink tiddlyLinkExisting' href='javascript:;' tiddlyLink='tl_viewAction' id='tl_action_" + action.id + "'>" + action.title + "</a>" +
					"<a class='deleteTiddlerButton' href='javascript:;' title='Delete tiddler'>×</a>" + 
					"</span><br>"
		}
		html += "</div>"
	}
	html += "</div>";
	return html;
}

function getDoneActionsHtml(doneActions, title) {
	if (doneActions == undefined) return "";
	
	var html = "<div class='scroll10'><div class='mgtdList'><h1>" + title + "</h1>";
	html += "<br><div class='doneList'>";
	for (var j = 0; j < doneActions.length; j++) {
		var action = doneActions[j];
		html += "<span class='action'>" +
				"<input type='checkbox' class='chkOptionInput'" + (action.done? " checked='checked'>" : ">") +  
				"<span>&nbsp;</span>" + 
				"<a class='tiddlyLink tiddlyLinkExisting' href='javascript:;' tiddlyLink='tl_viewAction' id='tl_action_" + action.id + "'>" + action.title + "</a>" +
				"<a class='deleteTiddlerButton' href='javascript:;' title='Delete tiddler'>×</a>" + 
				"</span><br>"
	}
	html += "</div>";
	html += "</div></div>";
	return html;
}