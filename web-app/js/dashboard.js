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
		
		$('.dateBox').datepicker({
			dateFormat: 'D, d-M-y',
			onSelect: updateTicklerDate
		});
	}
});

function tl_actionDashboard() {
	var dashboard = new DashboardView();
	dashboard.init({
		name: 'actionDashboard', 
		title: 'Action Dashboard By Context', 
		url: 'action/dashboard',
		onLoad: function(result) {
			var leftHtml = getContextActionsHtml(result.state.Next, 'Next Actions', ["on", "off", "off"], 'Next', "adna__");
			leftHtml += getContextActionsHtml(result.state.WaitingFor, 'Waiting Actions', ["off", "on", "off"], 'WaitingFor', "adwa__");

			var rightHtml = getContextActionsHtml(result.state.Future, 'Future Actions', ["off", "off", "on"], 'Future', "adfa__");
			rightHtml += getDoneActionsHtml(result.done, 'Done Actions', "adda__");
			
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
			var leftHtml = getContextActionsHtml(result.state.Next, 'Next Actions', ["on", "off", "off"], 'Next', "nana__");
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
			var leftHtml = getContextActionsHtml(result.state.Next, 'Next Actions', ["on", "off", "off"], 'Next', "nwna__");
			var rightHtml = getContextActionsHtml(result.state.WaitingFor, 'Waiting Actions', ["off", "on", "off"], 'WaitingFor', "nwwa__");
			return {left: leftHtml, right: rightHtml}
		}
	}).load();
}

function getContextActionsHtml(stateMap, title, state, stateName, prefix) {
	var html = "<div class='mgtdList'><h1 class='dc_state_" + stateName + "'>" + title + " <a class='action_link new_action'>+</a></h1>";
	if (stateMap) {
		for (var ctx in stateMap) {
			html += "<div class='innerList'><h2 class='dc_ctx dc_state_" + stateName + "'>" + ctx +  " <a class='action_link new_action'>+</a></h2>";
			var ctxActions = stateMap[ctx];
			for (var j = 0; j < ctxActions.length; j++) {
				var action = ctxActions[j];
				html += "<span class='link-container action'>" +
						"<input type='checkbox' class='chkOptionInput'" + (action.done? " checked='checked'>" : ">") +  
						" <a class='button Next " + state[0] + "' href='javascript:;' title='Next'>n</a>" +
						"<a class='button WaitingFor off " + state[1] + "' href='javascript:;' title='Waiting For'>w</a>" +
						"<a class='button Future off " + state[2] + "' href='javascript:;' title='Future'>f</a>" +
						"<a class='button Starred " + (action.star? "on" : "off") + "' href='javascript:;' title='Starred'>★</a>" +
						"<span>&nbsp;</span>" + 
						"<a class='tiddlyLink tiddlyLinkExisting' href='javascript:;' tiddlyLink='tl_viewAction' id='tl_" + prefix + "@" + action.id + "'>" + action.title + "</a>" +
						"<a class='deleteActionButton' href='javascript:;' title='Delete action'>×</a>" + 
						(action.project? " <a href='javascript:openProjectView(" + action.project.id + ")'>[P]</a> " : "") +
						"</span><br>"
			}
			html += "</div>"
		}
	}
	html += "</div>";
	return html;
}

function getDoneActionsHtml(doneActions, title, prefix) {
	var html = "<div class='scroll10'><div class='mgtdList'><h1>" + title + "</h1>";
	if (doneActions) {
		html += "<br><div class='doneList'>";
		for (var j = 0; j < doneActions.length; j++) {
			var action = doneActions[j];
			html += "<span class='link-container action'>" +
					"<input type='checkbox' class='chkOptionInput'" + (action.done? " checked='checked'>" : ">") +  
					"<span>&nbsp;</span>" + 
					"<a class='tiddlyLink tiddlyLinkExisting' href='javascript:;' tiddlyLink='tl_viewAction' id='tl_" + prefix + "@" + action.id + "'>" + action.title + "</a>" +
					"<a class='deleteActionButton' href='javascript:;' title='Delete action'>×</a>" + 
					"</span><br>"
		}
		html += "</div>";
	}
	html += "</div></div>";
	return html;
}

function tl_ticklerDashboard() {
	var dashboard = new DashboardView();
	dashboard.init({
		name: 'ticklerDashboard', 
		title: 'Tickler Dashboard', 
		url: 'tickler/dashboard',
		onLoad: function(result) {
			var leftHtml = getTicklerHtml(result.overdue, 'Ticklers Requiring Action', 'tdtkac');
			leftHtml += getTicklerHtml(result.upcoming, 'Upcoming Ticklers', 'tduptk');

			var rightHtml = getDoneTicklerHtml(result.done, 'Old Ticklers', 'tdoltk')
			return {left: leftHtml, right: rightHtml}
		}
	}).load();
}

function tl_activeTicklerDashboard() {
	var dashboard = new DashboardView();
	dashboard.init({
		name: 'activeTicklerDashboard', 
		title: 'Ticklers Requiring Action', 
		url: 'tickler/dashboard',
		onLoad: function(result) {
			var leftHtml = getTicklerHtml(result.overdue, '', 'actkdb');
			return {left: leftHtml, right: ""}
		}
	}).load({mode: 4});
}

function getTicklerHtml(ticklers, title, prefix) {
	if (ticklers == undefined) return "";
	
	var html = "<div class='mgtdList'><h1>" + title + "</h1>";
	html += "<div class='innerList'>";
	for (var j = 0; j < ticklers.length; j++) {
		var tickler = ticklers[j];
		var tick = '';
		if (tickler.period.name == 'Once') {
			tick = "<input type='checkbox' class='chkOptionInput'" + (tickler.done? " checked='checked'>" : ">");  
		} else {
			tick = "<a href='javascript:;' title='' class='rollPeriod button off'>+" + tickler.p + "</a>";  
		}
		html += "<span class='link-container tickler'>" + tick + 
				"<a class='button Starred " + (tickler.star? "on" : "off") + "' href='javascript:;' title='Starred'>★</a>" +
				"<input class='dateBox' value='" + formatTicklerDate(tickler.date) + "'>" +
				"<span>&nbsp;</span>" +
				"<a href='javascript:;' title='' class='tiddlyLink tiddlyLinkExisting' refresh='link' tiddlylink='tl_viewTickler' id='tl_" + prefix + "@" + tickler.id + "'>" + tickler.title + "</a>" +
				"<a class='deleteTicklerButton' href='javascript:;' title='Delete tickler'>×</a>" + 
				(tickler.project? " <a href='javascript:openProjectView(" + tickler.project.id + ")'>[P]</a> " : "") +
				"</span><br>";
	}
	html += "</div>"
	html += "</div>";
	return html;
}

function getDoneTicklerHtml(ticklers, title, prefix) {
	if (ticklers == undefined) return "";
	
	var html = "<div class='mgtdList'><h1>" + title + "</h1>";
	html += "<br><div class='doneList'>";
	for (var j = 0; j < ticklers.length; j++) {
		var tickler = ticklers[j];
		html += "<span class='link-container tickler'>" +
				"<input type='checkbox' class='chkOptionInput'" + (tickler.done? " checked='checked'>" : ">") +  
				"<a class='button Starred  " + (tickler.star? "on" : "off") + "' href='javascript:;' title='Starred'>★</a>" +
				"<input class='dateBox' value='" + formatTicklerDate(tickler.date) + "'>" +
				"<span>&nbsp;</span>" +
				"<a href='javascript:;' title='' class='tiddlyLink tiddlyLinkExisting' refresh='link' tiddlylink='tl_viewTickler' id='tl_" + prefix + "@" + tickler.id + "'>" + tickler.title + "</a>" + 
				"<a class='deleteTicklerButton' href='javascript:;' title='Delete tickler'>×</a>" + 
				"</span><br>"
	}
	html += "</div>";
	html += "</div>";
	return html;
}

function tl_projectDashboard() {
	var dashboard = new DashboardView();
	dashboard.init({
		name: 'projectDashboard', 
		title: 'Project Dashboard', 
		url: 'project/dashboard',
		onLoad: function(result) {
			var leftHtml = getProjectHtml(result.state.Active, 'Active Projects', ['on', 'off'], "pdacti", 'Active');

			var rightHtml = getProjectHtml(result.state.Someday, 'Someday/Maybe Projects', ['off', 'on'], "pdsome", 'Someday');
			rightHtml += getDoneProjectHtml(result.done, 'Completed Projects', "pdcomp");
			return {left: leftHtml, right: rightHtml}
		}
	}).load();
}

function getProjectHtml(projects, title, state, prefix, statusName) {
	var html = "<div class='mgtdList'><h1 class='dc_status_" + statusName + "'>" + title + " <a class='action_link new_project'>+</a></h1>";
	if (projects) {
		html += "<div class='innerList'>";
		for (var j = 0; j < projects.length; j++) {
			var project = projects[j];
			html += "<span class='link-container project'>" +
				    "<input type='checkbox' class='chkOptionInput'" + (project.done? " checked='checked'>" : ">") +   
					"<a class='button Active " + state[0] + "' href='javascript:;' title='Active'>a</a>" +
					"<a class='button Someday off " + state[1] + "' href='javascript:;' title='Someday'>s/m</a>" +
					"<a class='button Starred " + (project.star? "on" : "off") + "' href='javascript:;' title='Starred'>★</a>" +
					"<span>&nbsp;</span>" +
					"<a href='javascript:;' title='' class='tiddlyLink tiddlyLinkExisting' refresh='link' tiddlylink='tl_viewProject' id='tl_" + prefix + '@' + project.id + "'>" + project.title + "</a>" + 
					"<a class='deleteProjectButton' href='javascript:;' title='Delete project'>×</a>" + 
					"</span><br>";
		}
		html += "</div>"
	}
	html += "</div>";
	return html;
}

function getDoneProjectHtml(projects, title, prefix) {
	var html = "<div class='mgtdList'><h1>" + title + "</h1>";
	if (projects) {
		html += "<br><div class='doneList'>";
		for (var j = 0; j < projects.length; j++) {
			var project = projects[j];
			html += "<span class='link-container project'>" +
					"<input type='checkbox' class='chkOptionInput'" + (project.done? " checked='checked'>" : ">") +  
					"<a class='button Starred  " + (project.star? "on" : "off") + "' href='javascript:;' title='Starred'>★</a>" +
					"<span>&nbsp;</span>" +
					"<a href='javascript:;' title='' class='tiddlyLink tiddlyLinkExisting' refresh='link' tiddlylink='tl_viewProject' id='tl_" + prefix + '@' + project.id + "'>" + project.title + "</a>" + 
					"<a class='deleteProjectButton' href='javascript:;' title='Delete project'>×</a>" + 
					"</span><br>"
		}
		html += "</div>";
	}
	html += "</div>";
	return html;
}

function tl_doneActionDashboard() {
	var dashboard = new DashboardView();
	dashboard.init({
		name: 'doneActionDashboard', 
		title: 'Done Actions By Date', 
		url: 'action/doneByDateActions',
		onLoad: function(result) {
			var leftHtml = getDoneByDateHtml(result.dateMap, 'Done Actions', 'dacbyd');
			return {left: leftHtml, right: ""}
		}
	}).load();
}

function getDoneByDateHtml(dateMap, title, prefix) {
	var html = "<div class='mgtdList'><h1>" + title + "</h1>";
	for (var date in dateMap) {
		html += "<div class='innerList'><h2>" + date +  "</h2>";
		var dateActions = dateMap[date];
		for (var j = 0; j < dateActions.length; j++) {
			var action = dateActions[j];
			html += "<span class='link-container action'>" +
					"<input type='checkbox' class='chkOptionInput'" + (action.done? " checked='checked'>" : ">") +  
					"<a class='button Starred  " + (action.star? "on" : "off") + "' href='javascript:;' title='Starred'>★</a>" +
					"<span>&nbsp;</span>" +
					"<a href='javascript:;' title='' class='tiddlyLink tiddlyLinkExisting' refresh='link' tiddlylink='tl_viewAction' id='tl_" + prefix + '@' + action.id + "'>" + action.title + "</a>" + 
					"<a class='deleteActionButton' href='javascript:;' title='Delete action'>×</a>" + 
					"</span><br>"
		}
		html += "</div>";
	}
	html += "</div>";
	return html;
}
