function toggleRealm() {
	$(this).toggleClass('realm-active');
	var active = $(this).hasClass('realm-active');
	var realm = $(this).text();
	$.ajax({
		url: serverUrl + "realm/toggle",
		data: {name: realm, active: active}, 
		type: "POST",
		dataType: "json",
		success: function(data) {
			raiseEvent('actionUpdate', {event: 'realmToggle', realm: realm, active: true});
		}
	});
}

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

jQuery(document).ready(function() {
	$('.realm-tab').live('click', toggleRealm);
	$('.realm-add').live('click', addRealm);

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
});

