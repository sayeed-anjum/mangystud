Dashboard.extend("TicklerDashboard", {}, {
});

function tl_ticklerDashboard() {
	new TicklerDashboard(manager, {
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
	new TicklerDashboard(manager, {
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
