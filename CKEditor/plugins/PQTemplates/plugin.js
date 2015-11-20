CKEDITOR.plugins.add( 'PQTemplates', {
    icons: 'emailtemps,batch,noreply,setCase',
    init: function( editor ) {
		var editor = CKEDITOR.instances.editor

		CKEDITOR.dialog.add( 'PQTemplateDialog', this.path + 'dialogs/templates.js' );

		editor.addCommand( 'emailtemps', new CKEDITOR.dialogCommand( 'PQTemplateDialog' ) );
		
        editor.addCommand( 'batch', {
            exec: function( editor ) {
				var custname = document.URL.match(/&name=([^&]+)/);
				if (custname) {
					custname = fixCaps(decodeURI(custname[1]))
				}
				var batchname = editor.config.PQTemplates.batchName
				var global = editor.config.PQTemplates.globalBatchName
				
				if (!custname) { this.setState( 0 );}

				if (this.state == "1") {
					if (custname) {
						replaceTxt(batchname, custname, global)
						this.setState( 2 )
						return;
					}
				}
				if (this.state == "2") {
					if (custname) {
						replaceTxt(custname, batchname, global);
						this.setState( 1 )
					}
				}
            }
        });

		editor.addCommand( 'setCase', {
			exec: function ( editor ) {

				var casenum = document.URL.match(/&case=([^&]+)/);
				
				if (casenum) {
					casenum = casenum[1];
				}
				else { this.setState( 0 ); }
			
				if (this.state == "2") {
					if (casenum) {
						replaceTxt("\\[CASE NUMBER\\]", casenum, 1)
						this.setState( 1 );
						return;
					}
				}
				if (this.state == "1") {
					if (casenum) {
						replaceTxt(casenum, "\[CASE NUMBER\]", 1);
						this.setState( 2 );
					}
				}
			}
		});

		editor.addCommand( 'noreply', {
			exec: function ( editor ) {

				if ($("#footer").length == 0) { this.setState( 0 ); }

				if (this.state == "2") {
					var footer = editor.config.PQTemplates.footernoreply;
					var content = editor.getData();
					var cfooter = $("#footer", content)[0].innerHTML;
					var content = content.replace(cfooter, footer);
					editor.setData(content);
					this.setState( 1 );
					return;
				}
				if (this.state == "1") {
					var footer = editor.config.PQTemplates.footerReply;
					var content = editor.getData();
					var cfooter = $("#footer", content)[0].innerHTML;
					var content = content.replace(cfooter, footer);
					editor.setData(content);
					this.setState( 2 );
				}
			}
		});
		
		//Utility functions
		function fixCaps(str) {
			return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
		
		function replaceTxt(str1, str2, global) {
			if (global == 1) {
				var regex = new RegExp(str1,"g")
				var content = editor.getData();
				var content = content.replace(regex, str2);
				editor.setData(content)
			}
			else {
				var content = editor.getData();
				var content = content.replace(str1, str2);
				editor.setData(content)
			}
		}
		
		var temp = document.URL.match(/&temp=([^&]+)/);
		if (temp) {
			var temp = temp[1].replace(new RegExp(/\%20/g), "_").replace(new RegExp(/[^a-zA-Z0-9_.:-]/g), "_")
			var nrtemplates = editor.config.PQTemplates.noReplyTemplates
			if (nrtemplates.indexOf(temp) != -1) {
				editor.getCommand('noreply').setState( 2 );
				editor.execCommand('noreply', editor)
			}
		}
		else { editor.getCommand('noreply').setState( 0 ); }

		var batch = document.URL.match(/&batch=([^&]+)/);
		var custname = document.URL.match(/&name=([^&]+)/);
		if (!batch) { var batch = [1,1] }
		if (batch[1] == 0) {
			if (custname) {
				editor.getCommand('batch').setState( 1 );
				editor.execCommand('batch', editor);
			}
		}

		var casenum = document.URL.match(/&case=([^&]+)/);
		if (casenum) {
			editor.getCommand('setCase').setState( 2 );
			editor.execCommand('setCase', editor);
		}
		else {
			editor.getCommand('setCase').setState( 0 );
			$("main:first").prepend("<div style='text-align: center; font-weight: bold; background:orange';>No Case number found. Email will not be logged to Quickbase. Please record it manually.</div>");
		}
		
		editor.ui.addButton( 'emailtemps', {
			label: 'Email Templates',
			command: 'emailtemps',
			toolbar: 'PQTemplates,1'
		});
        editor.ui.addButton( 'Batch', {
            label: 'Multiple Customers',
            command: 'batch',
            toolbar: 'PQTemplates,2'
        });
		editor.ui.addButton( 'noreply', {
            label: 'No Reply',
            command: 'noreply',
            toolbar: 'PQTemplates,3'
        });
		editor.ui.addButton( 'setCase', {
            label: 'Insert Case #',
            command: 'setCase',
            toolbar: 'PQTemplates,4'
        });
    }
});