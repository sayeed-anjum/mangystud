Dashboard.extend("ReferenceDashboard", {}, {
	init : function(manager, options) {
		this._super(manager, options);
		this.addListener('referenceUpdate', this.refresh);
	} 
});

function tl_referenceDashboard() {
	new ReferenceDashboard(manager, {
		name: 'referenceDashboard', 
		title: 'Reference Items', 
		url: 'reference/dashboard',
		onLoad: function(result) {
			var leftHtml = getReferenceByProjectHtml(result.project, 'Reference Items For Active Projects', 'riacpr');

			var rightHtml = getReferenceHtml(result.others, 'Other Reference Items', 'riothr')
			return {left: leftHtml, right: rightHtml}
		}
	}).load();
}

function getReferenceByProjectHtml(projectMap, title, prefix) {
	if (projectMap == undefined) return "";
	
	var html = "<div class='mgtdList'><h1>" + title + "</h1>";
	for (var project in projectMap) {
		html += "<div class='innerList'><h2>" + project +  "</h2>";
		var items = projectMap[project];
		for (var j = 0; j < items.length; j++) {
			var item = items[j];
			html += "<span class='link-container item'>" + 
					"<a class='button Starred " + (item.star? "on" : "off") + "' href='javascript:;' title='Starred'>★</a>" +
					"<span>&nbsp;</span>" +
					"<a href='javascript:;' title='' class='tiddlyLink tiddlyLinkExisting' refresh='link' tiddlylink='tl_viewReference' id='tl_" + prefix + "@" + item.id + "'>" + item.title + "</a>" +
					"</span><br>";
		}
		html += "</div>"
	}
	html += "</div>";
	return html;
}

function getReferenceHtml(items, title, prefix) {
	if (items == undefined) return "";
	
	var html = "<div class='mgtdList'><h1>" + title + "</h1>";
	html += "<div class='innerList'>";
	for (var j = 0; j < items.length; j++) {
		var item = items[j];
		html += "<span class='link-container item'>" + 
				"<a class='button Starred " + (item.star? "on" : "off") + "' href='javascript:;' title='Starred'>★</a>" +
				"<span>&nbsp;</span>" +
				"<a href='javascript:;' title='' class='tiddlyLink tiddlyLinkExisting' refresh='link' tiddlylink='tl_viewReference' id='tl_" + prefix + "@" + item.id + "'>" + item.title + "</a>" +
				"</span><br>";
	}
	html += "</div>"
	html += "</div>";
	return html;
}
