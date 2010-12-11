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
});

function tiddlerSaveSuccessHandler(data, textStatus) {
	$('#tiddler_dialog').dialog("close");
	
	// var updatedOn = data.action.
	
	var realmSelect = $('#realm_select_template select').clone();
	var view = $('#action_div_template').clone();
	$(view).attr('id', 'action_' + data.action.id);
	$('#stage').append(view);
	$('.realm_select', view).append(realmSelect);
	$('.title', view).html(data.action.title);
	// $('.subtitle', view).html(updatedOn);
	$(view).show();
}
