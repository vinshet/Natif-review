
    Dropzone.autoDiscover = false;

    var myDropzone = new Dropzone("#dropzoneForm",
            {
                url: api_host+"/documents/",
                dictDefaultMessage: "Drop document files here to upload",
                maxFiles: 100,
                clickable: true,
                acceptedFiles: ".png,.jpg,.jpeg,.tiff,.tif,.pdf",
                addRemoveLinks: true,
                maxFilesize: 20, //MB
                headers:{Authorization:'Bearer '+$.session.get("access_token")}
            }
        );
    myDropzone.on("processing", function(file) {
      // Will send the filesize along with the file as POST data.
      myDropzone.options.url=api_host+"/documents/?document_type="+$("#upl_doctype").val()+"&language=xx";
    });



function buildtable(data){
        var rows = new Array();
        for (index = 0; index < data.length; index++) {
            var row={
                "id": "<button type=\"button\" class=\"btn btn-link btn-xs\"><a href=\"document.html?document_type="+data[index].document_type+"&document_id="+data[index].uuid+"\">"+data[index].uuid+"</a></button>",
                "name": data[index].filename_origin,
                "type": data[index].document_type,
                "doc": data[index].doc.replace("T"," "),
                "status": "<span class=\"label label-"+data[index].processing_status+"\">"+data[index].processing_status+"</span>",
                "pps": "<span class=\"label label-"+data[index].postprocessing_status+"\">"+data[index].postprocessing_status+"</span>"
            }
            rows.push(row);
        }
    	$('#document-table').html('').footable({

		"columns": [
			{ "name": "id", "title": "Document ID", "breakpoints": "xs" },
            { "name": "name", "title": "Upload Name", "breakpoints": "xs" },
			{ "name": "type", "title": "Document Type" },
			{ "name": "doc", "title": "Date" },
			{ "name": "status", "title": "AI Process", "breakpoints": "xs" },
            { "name": "pps", "title": "Post Process", "breakpoints": "xs" },
		],
		"rows": rows,
	});
}

function buildtabledemo(data){
        var rows = new Array();
        for (index = 0; index < data.length; index++) {
            var row={
                "id": "<button type=\"button\" class=\"btn btn-link btn-xs\"><a href=\"document.html?document_type="+data[index].document_type+"&document_id="+data[index].uuid+"\">"+data[index].uuid+"</a></button>",
                "name": data[index].filename_origin,
                "type": data[index].document_type,
                "doc": data[index].doc.replace("T"," "),
                "status": "<span class=\"label label-"+data[index].processing_status+"\">"+data[index].processing_status+"</span>"
            }
            rows.push(row);
        }
    	$('#document-table').html('').footable({

		"columns": [
			{ "name": "id", "title": "Document ID", "breakpoints": "xs" },
            { "name": "name", "title": "Upload Name", "breakpoints": "xs" },
			{ "name": "type", "title": "Document Type" },
			{ "name": "doc", "title": "Date" },
			{ "name": "status", "title": "AI Process", "breakpoints": "xs" }
		],
		"rows": rows,
	});
}

function search()
{
    $.session.set("date_from",$("#date_from").val());
    $.session.set("date_to",$("#date_to").val());
    $.session.set("status",$("#status").val());
    $.session.set("status",$("#postprocessing_status").val());
    $.ajax({
                    type: 'GET',
                    headers: {Authorization:'Bearer '+$.session.get("access_token")},
                    url: api_host+'/documents/',
                    data: {
                        date_from: $("#date_from").val()+'T12:00:00+01:00',
                        date_to: $("#date_to").val()+'T12:00:00+01:00',
                        status: $("#status").val(),
                        postprocessing_status : $("#postprocessing_status").val(),
                        get_postprocessing_status: true
                    },
                    success:function(data){if($.session.get("roles")!="demo"){buildtable(data)}else{buildtabledemo(data)}},
                    fail:function(data){console.log(data);toastr.error(data.responseJSON.detail, {timeOut: 5000})},
                    error:function(data){console.log(data);toastr.error(data.responseJSON.detail, {timeOut: 5000})}
    })
}

function pad2(number) {
   return (number < 10 ? '0' : '') + number
}

jQuery(function($){

    if($.session.get("roles")!="demo")
    {
        jQuery("#dropbox").show();
        jQuery("#pprocess").show();
    }

    var date=new Date();
    if($.session.get("date_from"))
    {
        $("#date_from").val($.session.get("date_from"));
    }else
    {
        var dt=new Date(date.setDate(date.getDate() - 1));
        var dtstring = dt.getFullYear()+ '-' + pad2(dt.getMonth()+1) + '-' + pad2(dt.getDate());
        $("#date_from").val(dtstring);
    }

    if($.session.get("date_to"))
    {
        $("#date_to").val($.session.get("date_to"));
    }else
    {
        var dt=new Date(date.setDate(date.getDate() + 2));
        var dtstring = dt.getFullYear()+ '-' + pad2(dt.getMonth()+1) + '-' + pad2(dt.getDate());
        $("#date_to").val(dtstring);
    }

    if($.session.get("status"))
    {
        $("#status").val($.session.get("status"));
    }else
    {
        $("#status").val('all');
    }
    if($.session.get("postprocessing_status"))
    {
        $("#postprocessing_status").val($.session.get("postprocessing_status"));
    }else
    {
        $("#postprocessing_status").val('all');
    }
    search();

	$('.input-daterange input').each(function() {
        $(this).datepicker({
            format: 'yyyy-mm-dd',
        })
    });
});

enableibox();