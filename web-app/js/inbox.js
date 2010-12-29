function makeTiddler() {
	var type = determineType(this);
	var currentItem = $('.message_link.selected');
	if (currentItem.length) {
		var listId = currentItem[0].id;
		var id = listId.substr(3);
		$.post(serverUrl + 'inbox/make', {id: id, type: type}, function(data){
			if (data.success) {
				$('#' + listId).parent().remove();
				$('#msg_' + id).remove();
				$('#inboxList :first-child a').addClass('selected');
			} else {
				alert('Unable to convert to tiddler: ' + data.message);
			}
		});
	}
}

function determineType(obj) {
	var type = "";
	if ($(obj).hasClass('action')) type = 'action';
	if ($(obj).hasClass('project')) type = 'project';
	if ($(obj).hasClass('tickler')) type = 'tickler';
	return type;
}

function showMessage() {
	var listId = this.id;
	var id = 'msg_' + this.id.substr(3);
	$('#inboxView .message').hide();
	$('#' + id).show();
	$('.message_link').removeClass('selected');
	$('#' + listId).addClass('selected');
}

function refreshInbox() {
	$.getJSON(serverUrl + 'inbox/list', function(data) {
		$('#inboxList').empty();
		$('#inboxView').empty();
		$('#messageListTemplate').tmpl(data).appendTo('#inboxList');
		$('#messageTemplate').tmpl(data).appendTo('#inboxView');
		$('#inboxList :first-child a').addClass('selected');
		$('#inboxView :first-child').show();
	});
}
	
function refreshMailboxList() {
	$.getJSON(serverUrl + 'inbox/mailboxes', function(data) {
		$('#mailboxes').empty();
		$('#mailboxTemplate').tmpl(data).appendTo('#mailboxes');
		$('.deleteMailbox').live('click', function() {
			var entry = $(this).closest('.mailboxEntry'); 
			var id = $(entry).attr('id').substr(8);
			$.post(serverUrl + 'inbox/deleteMailbox', {id: id}, function(data) {
				if (data.success) {
					$(entry).remove();
				}
			});
		});
		$('.newMailboxEntry').keypress(function(event){
			if (event.which == '13') {
				var email = $('.newMailboxEntry').val();
				if ($.trim(email) == '') {
					alert('Please provide a valid email entry');
					$('.newMailboxEntry').focus();
					return;
				}
			    $.post(serverUrl + 'inbox/saveMailbox', {email: email}, function(data){
			    	if (data.success) {
				    	var target = $('.newMailboxEntry').parent();
						$('#mailboxEntryTemplate').tmpl(data).insertBefore(target);
						$('.newMailboxEntry').val('');
			    	} else {
			    		alert('Unable to add new mailbox: ' + data.message);
			    	}
			    });
			}
		});
	});
}

function initMailboxTabs() {
	var div = $.tmpl("mailboxTemplate", []);
	$('.mailboxRefreshLink').click(refreshMailboxList);
	$('.inboxRefreshLink').click(refreshInbox);
	$('.message_link').live('click', showMessage);
	$('.makeTiddler').live('click', makeTiddler);
	$('.mailboxEntry .email').live('click', function() {
		$(this).parent().next().toggle();
	});
	$(div).appendTo('#settingsTab');
	$( "#tabs" ).tabs({
		select: function(event, ui) {
			if (ui.index == 1 && $('#mailboxes').is(':empty')) {
				refreshMailboxList();
			}
		}
	});		   
}
