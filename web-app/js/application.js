function getContextActionsHtml(stateMap, title, state) {
	if (stateMap == undefined) return "";
	
	var html = "<div class='mgtdList'><h1>" + title + "</h1>";
	for (var ctx in stateMap) {
		html += "<div class='innerList'><h2>" + ctx + "</h2>";
		var ctxActions = stateMap[ctx];
		for (var j = 0; j < ctxActions.length; j++) {
			var action = ctxActions[j];
			html += "<span class='action'>" +
					"<input type='checkbox' class='chkOptionInput'>" +
					"<a class='button Next " + state[0] + "' href='javascript:;' title='Next'>n</a>" +
					"<a class='button WaitingFor off " + state[1] + "' href='javascript:;' title='Waiting For'>w</a>" +
					"<a class='button Future off " + state[2] + "' href='javascript:;' title='Future'>f</a>" +
					"<a class='button Starred off' href='javascript:;' title='Starred'>★</a>" +
					"<span>&nbsp;</span>" + 
					"<a class='tiddlyLink tiddlyLinkExisting' href='javascript:;' tiddlyLink='action_" + action.id + "'>" + action.title + "</a>" +
					"<a class='deleteTiddlerButton' href='javascript:;' title='Delete tiddler'>×</a>" + 
					"</span><br>"
		}
		html += "</div>"
	}
	html += "</div>";
	return html;
}

function getTiddlerView(id, viewName) {
	var tiddler = $('#tiddler_template').clone();
	$(tiddler).attr('id', id);
	$('#stage').append(tiddler);

	var view = $('#' + viewName).clone();
	view.attr('id', null);
	$('.viewer', tiddler).append(view);
	return view;
}

function tiddlerSaveSuccessHandler(data, textStatus) {
	$('#tiddler_dialog').dialog("close");
	
	// var updatedOn = data.action.
	var view = getTiddlerView('action_' + data.action.id, 'action_view_template')

	var realmSelect = $('#realm_select_template select').clone();
	$('.realm_select', view).append(realmSelect);
	$('.title', view).html(data.action.title);
	// $('.subtitle', view).html(updatedOn);
	$(view).show();
}

function tl_actionDashboard() {
	$.ajax({
		url: serverUrl + "tiddler/actionDashboard",
		type: "GET",
		dataType: "json",
		success: function(result) {
			var tiddler = $('#actionDashboard');
			var view;
			if (tiddler.length > 0) {
				view = $('.viewer div', tiddler[0]);
			} else {
				view = getTiddlerView("actionDashboard", 'action_dashboard_template')
			}
			
			var leftPanel = $('.leftPanel', view)[0]
			$(leftPanel).empty();

			var rightPanel = $('.rightPanel', view)[0]
			$(rightPanel).empty();

			var html = getContextActionsHtml(result.NEXT, 'Next Actions', ["on", "off", "off"]);
			html += getContextActionsHtml(result.WAITING, 'Waiting Actions', ["off", "on", "off"]);
			$(leftPanel).append(html);

			html = getContextActionsHtml(result.FUTURE, 'Future Actions', ["off", "off", "on"]);
			$(rightPanel).append(html);
			
			$(view).show();
		}
	});
}

jQuery(document).ready(function() {
	$('.tiddler').live('mouseenter', function() {
		$(this).addClass("selected");
	});
	$('.tiddler').live('mouseleave', function() {
		$(this).removeClass("selected");
	});
	$('.tiddler .command_closeTiddler').live('click', function() {
		$(this).closest('.tiddler').remove();
	});
	$('.tiddler .command_deleteTiddler').live('click', function() {
		var id = $(this).closest('.tiddler')[0].id;
		alert('deleting ' + id);
	});
	$('.tiddlyLink').live('click', function() {
		var name = $(this).attr('tiddlylink');
		var fn = window[name];
		if (typeof fn === 'function') {
			fn();
		} else {
			alert('Missing tiddly method: ' + name);
		}
	});
	
	$('#tiddler_dialog').dialog({
	    autoOpen: false,
		buttons: {
			"OK" : function() {
			  var title = $('#tiddler_title').val();
			  if (title.trim() === "") {
			  	alert('Please enter a title');
			  	return;
			  }
			  $('#newTiddlerForm').submit();
			},
			"Cancel" : function() {$(this).dialog("close"); }
		},
		resizable: false,
		modal: true
	});
	$(".action_link").click(function() {
		$('#tiddlerType').val(this.id);
		$('#tiddler_title').val('');
		$('#tiddler_dialog').dialog("option", "title", 'New ' + this.id);
		$('#tiddler_dialog').dialog("open");
	});
	
	tl_actionDashboard();
});

