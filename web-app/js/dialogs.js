function addRealm() {
	$('#realm_title').val('');
	$('#realm_dialog').dialog("option", "title", 'New Realm');
	$('#realm_dialog').dialog("open");
}
		
function realmSaveSuccessHandler(data, textStatus) {
	$('#realm_dialog').dialog("close");

	var span = $('<span/>', {
		class: "realm-tab realm-active",
		text: data.realm.name
	});
	$('.realm-add').before(span);
}

function showNewContextDialog() {
	var controlDiv = $(this).closest('.controls');
	var actionId = manager.determineActionId(this);
	var realm = $('.realm_select select', controlDiv).val();

	$('#context_realm').val(realm);
	$('#context_actionId').val(actionId);
	$('#context_name').val('');
	$('#context_dialog').dialog("option", "title", 'New Context');
	$('#context_dialog').dialog("open");
}

function contextSaveSuccessHandler(data, textStatus) {
	$('#context_dialog').dialog("close");
	updateContextDivs(data);
}

function showNewActionDialog() {
	$('#tiddlerType').val(this.id);
	$('#tiddler_title').val('');
	$('#tiddler_dialog').dialog("option", "title", 'New ' + this.id);
	$('#tiddler_dialog').dialog("open");
}

function tiddlerSaveSuccessHandler(data, textStatus) {
	$('#tiddler_dialog').dialog("close");
	tl_viewAction(data.action.id);
	manager.raiseEvent('actionUpdate', {event: 'new', id: data.action.id});
}

function setupDialogs() {
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
	$('#context_dialog').dialog({
	    autoOpen: false,
		buttons: {
			"OK" : function() {
			  var name = $('#context_name').val();                                                 
			  if (name.trim() === "") {
			  	alert('Please enter a name');
			  	return;
			  }
			  $('#newContextForm').submit();
			},
			"Cancel" : function() {$(this).dialog("close"); }
		},
		resizable: false,
		modal: true
	});
	
	$('#realm_dialog').dialog({
	    autoOpen: false,
		buttons: {
			"OK" : function() {
			  var name = $('#realm_name').val();
			  if (name.trim() === "") {
			  	alert('Please enter a name');
			  	return;
			  }
			  $('#newRealmForm').submit();
			},
			"Cancel" : function() {$(this).dialog("close"); }
		},
		resizable: false,
		modal: true
	});
}

