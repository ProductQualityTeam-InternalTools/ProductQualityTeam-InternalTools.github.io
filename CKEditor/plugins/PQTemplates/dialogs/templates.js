CKEDITOR.dialog.add( 'PQTemplateDialog', function(  ) {
    return {
        title: 'Customer Response Email Templates',
        minWidth: 300,
        minHeight: 200,
        contents: [
            {
                id: 'tab1',
                label: 'Only Tab',
                elements: [
                    {
                        type: 'select',
                        id: 'PQTemplatesSelect',
                        label: '',
						style: 'width:300px;height:185px',
						size: 15,
						items: [],
						onLoad: function() {
							var editor = CKEDITOR.instances.editor
							var templatefile = editor.config.PQTemplates.templatefile;
							var dialog = this.getDialog()
							$("#templates").load(templatefile + " span", function() {

								var temps = $("#templates").find("span");

								selbox = dialog.getContentElement( 'tab1', 'PQTemplatesSelect' );
													
								//selbox.setAttribute("size",temps.length);
								var i = document.createElement("option") 
								selbox.add("Blank"," ")
								$.each(temps, function () {
									var i = document.createElement("option") 
									selbox.add(this.id.replace(/_/g, " "), this.id)
								});
							});
						},
                        validate: CKEDITOR.dialog.validate.notEmpty( "No template selected." )
                    }
                ]
            }
        ],
        onOk: function() {
            var dialog = this;
			var tempname = this.getContentElement('tab1', 'PQTemplatesSelect').getValue();
			loadTemplate(tempname)
        }
    };
	function loadTemplate(tempname) {
		var newurl = document.URL.replace(/&temp=([^&]+)/,"\&temp="+tempname);
		location.href = newurl;
	}
});