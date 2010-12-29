function initMailboxTabs() {
	var div = $.tmpl("mailboxTemplate", []);
	$(div).appendTo('#settingsTab');
	$( "#tabs" ).tabs({
		select: function(event, ui) {
			$.getJSON(serverUrl + 'inbox/mailboxes', function(data) {
				$('#mailboxes').empty();
				$('#mailboxTemplate').tmpl(data).appendTo('#mailboxes');
				$('.mailboxEntry .email').click(function() {
					$(this).parent().next().toggle();
				});
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
	});		   
}
