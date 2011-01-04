Dashboard.extend("ActionDashboard", {}, {
});

function tl_actionDashboard() {
	new ActionDashboard(manager, {
		name : 'actionDashboard',
		title : 'Action Dashboard By Context', 
		url : 'action/dashboard',
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
	new ActionDashboard(manager, {
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
	new ActionDashboard(manager, {
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

function tl_doneActionDashboard() {
	new ActionDashboard(manager, {
		name: 'doneActionDashboard', 
		title: 'Done Actions By Date', 
		url: 'action/doneByDateActions',
		onLoad: function(result) {
			var leftHtml = getDoneByDateHtml(result.dateMap, 'Done Actions', 'dacbyd');
			return {left: leftHtml, right: ""}
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
						(action.contact? " <a href='javascript:openContactView(" + action.contact.id + ")'>[C]</a> " : "") +
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
