Dashboard.extend("ProjectDashboard", {}, {
});

function tl_projectDashboard() {
	new ProjectDashboard(manager, {
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
