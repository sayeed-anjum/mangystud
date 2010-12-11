jQuery(document).ready(function() {
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

function tiddlerSaveSuccessHandler() {
	$('#tiddler_dialog').dialog("close");
}
