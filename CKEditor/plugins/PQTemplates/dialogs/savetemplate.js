CKEDITOR.dialog.add('PQSaveTemplateDialog', function(editor) {
	return {
		title: 'Save Template',
		minWidth: 300,
		minHeight: 75,
		contents: [{
			id: 'tab1',
			label: 'Only Tab',
			elements: [{
				type: 'vbox',
				widths: [null],
				children: [{
					type: 'text',
					id: 'tempname',
					label: 'Name',
					style: 'width:300px',
					onShow: function() {
						var template = sessionStorage.getItem('template');
						if (template) {
							var dialog = CKEDITOR.dialog.getCurrent();
							dialog.setValueOf("tab1", "tempname", template);
						}
					},
					validate: CKEDITOR.dialog.validate.notEmpty("Please enter a name for this template.")
				}]
			}]
		}],
		onOk: function(editor) {
			var dialog = this;
			//var editor = CKEDITOR.instances.editor;
			var settings = editor.config.PQTemplates.TemplateQB;


			// var batchName = editor.config.emailConfig.batchName;
			var dbid = settings.dbid;
			var appToken = settings.appToken;
			var nameFid = settings.nameFid;
			var contentFid = settings.contentFid;
			var noReplyFid = settings.noReplyFid;

			var savename = dialog.getValueOf("tab1", "tempname");

			var loadname = sessionStorage.getItem('template');

			var content = editor.getData();
			content = content.split(/\<td id\=\"body\"[^\>]+>/);
			if (content) {
				content = content[1].split(/<\/td\>/);
				content = content[0];
			}
			else {
				console.log("error");
			}

			if (content.indexOf("[CUSTOMER NAME]") == -1) {
				if (confirm('Your template does not contain the keyphrase "[CUSTOMER NAME]". Without this phrase, the customer\'s name will not be inserted into the message when appropriate. Do you wish to continue?') == false) {
					return false;
				}
			}

			var request = "";
			request += '<qdbapi>';
			request += '<apptoken>' + appToken + '</apptoken>';

			var url = "";
			url += "https://intuitcorp.quickbase.com/db/" + dbid;

			if (loadname == savename) {
				var casenum = sessionStorage.getItem('casenum');
				if (!casenum) {
					console.log("No record ID, unable to update record.");
				}

				url += "?act=API_EditRecord";
				request += '<rid>' + casenum + '</rid>';
			}
			else {
				url += "?act=API_AddRecord";
			}

			if (editor.getCommand('noreply').state == 1) {
				request += '<field fid="' + noReplyFid + '">true</field>';
			}
			else {
				request += '<field fid="' + noReplyFid + '">false</field>';
			}

			request += '<field fid="' + nameFid + '">' + savename + '</field>';
			request += '<field fid="' + contentFid + '"><![CDATA[' + content + ']]></field>';
			request += '</qdbapi>';

			jQuery.ajax({
					type: "POST",
					contentType: "text/xml",
					url: url,
					dataType: "xml",
					processData: false,
					data: request
				})
				.done(function(xml) {
					if ($("errcode", xml).text() == 0) {
						editor.showNotification("Template saved.");
					}
					else {
						var errcode = $("errcode", xml).text();
						var errtext = $("errtext", xml).text();
						console.log("CKEditor Error: Failed to save template. Error " + errcode + " :" + errtext);
					}
				})
				.fail(function(data) {
					console.log("CKEditor Error: Failed to save template to QuickBase. Error " + data.status + ": " + data.statusText);
				});
		}
	};
});