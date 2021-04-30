function pickcolorhex(id)
{
    var colorpicked=["2f4f4f","556b2f","6b8e23","a0522d","a52a2a","2e8b57","228b22","191970","708090","8b0000","66cdaa","ffc0cb","808000","483d8b","5f9ea0","3cb371","bc8f8f","663399","b8860b","bdb76b","008b8b","cd853f","4682b4","d2691e","9acd32","20b2aa","cd5c5c","fff8dc","00008b","4b0082","32cd32","800080","b03060","d2b48c","9932cc","ff0000","ff4500","ff8c00","ffa500","ffd700","ffff00","c71585","0000cd","40e0d0","7fff00","8fbc8f","00ff00","ba55d3","00fa9a","00ff7f","4169e1","dc143c","00ffff","00bfff","9370db","f08080","adff2f","ff6347","da70d6","d8bfd8","ff7f50","ff00ff","1e90ff","db7093","f0e68c","eee8aa","ffff54","6495ed","dda0dd","b0e0e6","87ceeb","ff1493","7b68ee","98fb98","7fffd4","ffdab9","ff69b4","e6e6fa","ffe4e1","9400d3","e9967a","0000ff"];
    var bigint = parseInt(colorpicked[id], 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + "," + g + "," + b;
}

function lightOrDark(color) {

    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

        r = color[1];
        g = color[2];
        b = color[3];
    }
    else {

        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace(
        color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp>150) {

        return 'light';
    }
    else {

        return 'dark';
    }
}

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

hslToRgb = function(_h, s, l) {
	var h = Math.min(_h, 359)/60;

	var c = (1-Math.abs((2*l)-1))*s;
	var x = c*(1-Math.abs((h % 2)-1));
	var m = l - (0.5*c);

	var r = m, g = m, b = m;
	if (h < 1) {
		r += c, g = +x, b += 0;
	} else if (h < 2) {
		r += x, g += c, b += 0;
	} else if (h < 3) {
		r += 0, g += c, b += x;
	} else if (h < 4) {
		r += 0, g += x, b += c;
	} else if (h < 5) {
		r += x, g += 0, b += c;
	} else if (h < 6) {
		r += c, g += 0, b += x;
	} else {
		r = 0, g = 0, b = 0;
	}
	return 'rgba(' + Math.floor(r*255) + ', ' + Math.floor(g*255) + ', ' + Math.floor(b*255) + ','+randomNumber(0.25,0.95)+')';
}

createSpectrum = function(length) {
	var colors = [];
	// 270 because we don't want the spectrum to circle back
	var step = 270/length;
	for (var i = 1; i <= length; i++) {
		var color = hslToRgb((i)*step, 0.5, 0.5);
		colors.push(color);
	}

	return colors;
}

function loadBoxLinks(addnewrow=false)
{
	var html='<div class="">';
	html += '<ul class="list-unstyled row boxes_list_links" >';
	var boxlistarr=[];
	// number total of line items to generate colors
	var total_lines=0;
	for (var i = 0; i < json_object["ocr"]['pages'].length; i++)
	{
		total_lines+=json_object["ocr"]["pages"][i]["line_items"].length;
	}
	// add one if add a new row action is triggered
	if (addnewrow)
			total_lines++;
	var colors=createSpectrum(total_lines);

	var total_lines=0;
	for (var i = 0; i < json_object["ocr"]['pages'].length; i++)
	{
		var line_items=json_object["ocr"]["pages"][i]["line_items"];
				for(var k=0;k<line_items.length;k++)
				{
					var rgba=colors[total_lines];
					var boxlist='';
					for(var j=0;j < line_items[k].length; j++)
					{
						//page array index + 1 for page number
						boxvalue='box_'+parseInt(i+1)+'_'+line_items[k][j];
						if(j==0){boxlist=boxvalue;}else{boxlist=boxlist+','+boxvalue;}
					}
					boxlistarr.push({boxlist:boxlist,rgba:rgba});
					total_lines++;
					html+=newLinkLi(rgba,total_lines,i,k);
				}
	}

	if(addnewrow)
		html+=newLinkLi(colors[total_lines],total_lines+1,0,0);
	html += '</ul>';
	html+= '<button type="button" class="btn btn-primary" onclick="addNewLink()">New Link</button>&nbsp;&nbsp;<button type="button" class="btn btn-primary" onclick="delSelectedLink()">Delete Link</button>'
	html+='</div>';
	$("#tab_content_links_body").html(html);

	for(var l=0;l<boxlistarr.length;l++)
	{
		var boxlist=boxlistarr[l].boxlist.split(',');
		for(var i=0;i<boxlist.length;i++)
		{
			var rgba=boxlistarr[l].rgba;
			$('#'+boxlist[i]).css("background",rgba);
			$('#'+boxlist[i]).attr("linkskey",rgba);
		}
	}
	disableListeners();
    linksSelection();
    enableLinksListener();
}

function newLinkLi(rgba,linknb,page_index,line_item_idx)
{
	var html='<li class="selectable_link boxes_list_links_li" style="background-color:'+rgba+';" rgba="'+rgba+'" origin_index="'+page_index+'_'+line_item_idx+'">Link '+linknb+'</li>';
	return html;
}

function delSelectedLink()
{
	$("[linkskey='"+$('.selectable_linkON').attr("rgba")+"']").each(function(){
	 	$(this).css("background","").removeAttr( "linkskey");
	 });
	updateLinks();
	loadBoxLinks();
}

function updateLinks()
{
			 var links=[];
		 	 //json_object["ocr"]["pages"][i]["line_items"]
			 $('[linkskey]').each(function(){
			 	var linkskey=$(this).attr('linkskey');
			 	var id=$(this).attr('id').split('_');
			 	if(!(linkskey in links))
				{
			 		links[linkskey]={page:id[1],boxes:[id[2]]};
				}
			 	else
				{
					links[linkskey].boxes.push(id[2]);
				}
			 });
			 var composed_array=[];
			 for(var key in links)
			 {
			 	var page_idx=parseInt(links[key].page)-1;
			 	if(typeof composed_array[page_idx] === 'undefined') {
					composed_array[page_idx]=[]
				}
			 	composed_array[page_idx].push(links[key].boxes);
			 }
			 for(var i=0; i<json_object["ocr"]["pages"].length;i++)
			 {
			 	if(typeof composed_array[i] !== 'undefined') {
					json_object["ocr"]["pages"][i]["line_items"]=composed_array[i];
				}
			 }
}

function updateBoxes()
{
	         var boxes=[];
		 	 //json_object["ocr"]["pages"][i]["line_items"]
			 $('[colorkey]').each(function(){
			 	var colorskey=$(this).attr('colorkey');
			 	var boxid=$(this).attr('id');
			 	if(colorskey!="undefined" && colorskey!==undefined && colorskey!="")
			 		boxes[boxid]=$('[rgba="'+colorskey+'"]').attr("data-type");
			 });
			 for(var i=0; i<json_object["ocr"]["pages"].length;i++) {
				 for (var j = 0; j < json_object["ocr"]["pages"][i]["bboxes"].length; j++) {
				 	var ref='box_'+(parseInt(i)+1)+'_'+json_object["ocr"]["pages"][i]["bboxes"][j]["id"];
					if(!(ref in boxes))
					{
						json_object["ocr"]["pages"][i]["bboxes"][j]["assigned_type"]="VOID";
					}
					else
					{
						json_object["ocr"]["pages"][i]["bboxes"][j]["assigned_type"]=boxes[ref];
					}
				 }
			 }
			 $('[title][title!=""]').tooltip();
}

function updateExt()
{
	console.log('save locally');
	var extractions={};
$("[data-structure]").each(function(){
	var dt=$(this).attr("data-structure").split('-');
	if(dt[0]=="string")
	{
		if (dt[1]=="general")
		{
			extractions[dt[2]]=formatExt($(this).val(),$(this).attr('boxlist'));
		}
		else
		{
			if(extractions[dt[1]]===undefined)
				extractions[dt[1]]={};
			extractions[dt[1]][dt[2]]=formatExt($(this).val(),$(this).attr('boxlist'));
		}
	}
	if(dt[0]=="table")
	{
		var rows=[]
		$(this).find('tr').not(".footable-header").not(".footable-empty").not(".footable-editing").each(function() {
        	var row={};
        	$(this).find('input').each(function()
        	{
        		row[$(this).attr('datatype')]=formatExt($(this).val(),$(this).attr('boxlist'));
        	});
        	rows.push(row);
   		});

	   	if(dt.length==2)
	   	{
				if (extractions[dt[1]] === undefined)
					extractions[dt[1]] = {};
				extractions[dt[1]] = rows;
	   	}
	   	if(dt.length==3)
	   	{
				if(extractions[dt[1]]===undefined)
					extractions[dt[1]]={};
				if(extractions[dt[1]][dt[2]]===undefined)
					extractions[dt[1]][dt[2]]={};
				extractions[dt[1]][dt[2]]=rows;
	   	}
	}
});
	$('[title][title!=""]').tooltip();
	json_object.extractions=extractions;
}

function formatExt(value,boxlist)
{

	var bbox_refs=[];
	if(value=="")
		return obj=null;
    if(boxlist!="" && boxlist!="undefined" && boxlist!==undefined)
    {
    	boxlist=boxlist.split(',');
        for(var box in boxlist)
        {
            var tmp=boxlist[box].split('_');
            var newbox={"page_num":tmp[1],"bbox_id":tmp[2]};
            bbox_refs.push(newbox);
        }

    }
    return obj={"value":value,"bbox_refs":bbox_refs};
}

function addNewLink()
{
	loadBoxLinks(true);
	disableListeners();
    linksSelection();
    enableLinksListener();
}

function loadMenu(types)
{
    var i=0;
	var k=0;
	var html='<div class="">';

	for (var key in types["Attributes"])
	{
		html += '<div class=""><h6>'+key+'</h6></div><ul class="list-unstyled row boxes_list_types" >';
		var j=1;
		for (var key2 in types["Attributes"][key]) {

		var alphacolor=pickcolorhex(k)+','+0.9;
        var txtcolor='';
		if(lightOrDark('rgba('+alphacolor+')')=='dark')
            {
                txtcolor=';color:white';
            }
    		html += '<li class="selectable boxes_list_types_li" style="background-color:rgba('+alphacolor+');'+txtcolor+'" rgba="'+alphacolor+'"  data-type="'+types["Attributes"][key][key2]+'">'+key2+'</li>';
			j++;
            k++;
		}
		html += '</ul>';
		i++;
	}
    html+='</div>';
    return html;
}

function linksSelection()
{
	selection = Selection.create({

    // Class for the selection-area
    class: 'selection',

    // All elements in this container can be selected
    selectables: ['.document_page_box_hidden'],

    // The container is also the boundary in this case
    boundaries: ['#zoomwrapper']
}).on('beforestart', ({inst, selected, oe}) => {
	 var $arr=[];
	 $("[linkskey='"+$('.selectable_linkON').attr("rgba")+"']").each(function(){
	 	$arr.push("#"+$(this).attr("id"));
	 });
	 console.log($arr);
	 if($arr.length > 0)
	 	inst.select($arr);

}).on('move', ({inst,changed: {removed, added}}) => {
    // Add attribute type to the elements that where selected.
    for (const el of added) {
        $('#'+el.id).css("background",$('.selectable_linkON').attr("rgba")).attr("linkskey",$('.selectable_linkON').attr("rgba"));
    }

    // Remove the attribute type from elements that where removed
    // since the last selection
    for (const el of removed) {
        $('#'+el.id).css("background","").removeAttr( "linkskey");
    }

}).on('stop', ({inst,selected,oe}) => {
         if ($('.selectable_linkON').length === 0)
         {
             inst.clearSelection();
         }else
		 {
		 	 updateLinks();
		 	 inst.keepSelection();
		 }
});
}

function ocrSelection()
{
	selection = Selection.create({

    // Class for the selection-area
    class: 'selection',

    // All elements in this container can be selected
    selectables: ['.document_page_box_hidden'],

    // The container is also the boundary in this case
    boundaries: ['#zoomwrapper']
}).on('beforestart', ({inst, selected, oe}) => {
	 var $arr=[];
	 $("[colorkey='"+$('.selectableON').attr("rgba")+"']").each(function(){
	 	$arr.push("#"+$(this).attr("id"));
	 });
	 if($arr.length > 0)
	 	inst.select($arr);

}).on('start', ({inst, selected, oe}) => {

}).on('move', ({changed: {removed, added}}) => {
    // Add attribute type to the elements that where selected.
    for (const el of added) {
        $('#'+el.id).css("background","rgba("+$('.selectableON').attr("rgba")+")").attr("colorkey",$('.selectableON').attr("rgba"));
    }

    // Remove the attribute type from elements that where removed
    // since the last selection
    for (const el of removed) {
    	console.log(el.id);
        $('#'+el.id).css("background","").removeAttr( "colorkey");
    }

}).on('stop', ({inst,selected,oe}) => {
         if ($('.selectableON').length === 0)
         {
             inst.clearSelection();
         }else
		 {
		 	 updateBoxes();
		 	 inst.keepSelection();
		 }
});
}

function highlightBoxes(elt)
{
	$(".highlighted").removeClass("highlighted");
	if(!elt.attr('boxlist')) return;
	var boxlist=elt.attr('boxlist').split(',');

	if(boxlist=="") return;

    for(var i=0; i <  boxlist.length;i++)
	{
		if(i==0){
			var eltposition=$("#"+boxlist[i]);

			$( "#zoomwrapper" ).scrollTo(eltposition,{offset: {top:-200} });

		};
		$("#"+boxlist[i]).addClass("highlighted");
	}
}
function enableLinksListener()
{
	$('.selectable_link').on('click',function(){
		$('.selectable_linkON').removeClass('selectable_linkON');
					$(this).addClass('selectable_linkON');
					selection.clearSelection();
	});
}

function enableExtListener()
{
	$('input').on('click',function(){
		$('input').removeClass('EditData');
		$(this).addClass('EditData');
		selection.clearSelection();
	});

	$('input').on('keyup',function()
	{
		updateExt();
	});

	$('input').on('click',function(){
		highlightBoxes($(this));
	});
}

function enableOcrListener()
{
	$('.selectable').on('click',function(){
		if($('.selectableON').attr('data-type')==$(this).attr('data-type'))
				{
					$('.selectableON').removeClass('selectableON');
				}else
				{
					$('.selectableON').removeClass('selectableON');
					$(this).addClass('selectableON');
					selection.clearSelection();
				}
			});
}

function disableOcrListener()
{
	$('.selectable').unbind();
	$(".box_with_attributes").unbind();
}

function disableExtListener()
{
	$('input').unbind();
}

function disableLinksListener()
{
	$('.selectable_link').unbind();
	$(".box_with_attributes").unbind();
}

function disableListeners()
{

	if(selection!==null)
        selection.destroy();
	 disableLinksListener();
	 disableOcrListener();
	 disableExtListener();
}

function extSelection()
{
	selection = Selection.create({

    // Class for the selection-area
    class: 'selection',

    // All elements in this container can be selected
    selectables: ['.document_page_box_hidden'],

    // The container is also the boundary in this case
    boundaries: ['#zoomwrapper']
}).on('start', ({inst, selected, oe}) => {
	 if (!oe.ctrlKey && !oe.metaKey) {

        // Unselect all elements
        for (const el of selected) {
            inst.removeFromSelection(el);
        }

        // Clear previous selection
        inst.clearSelection();
        $(".highlighted").removeClass("highlighted");
    }


}).on('move', ({changed: {removed, added}}) => {

    // Add a custom class to the elements that where selected.
    for (const el of added) {
        el.classList.add('box_selection');
    }

    // Remove the class from elements that where removed
    // since the last selection
    for (const el of removed) {
        el.classList.remove('box_selection');
    }

}).on('stop', ({inst,selected,oe}) => {

         if ($('.EditData').length === 0)
         {
             $('.box_selection').removeClass('box_selection');
             inst.clearSelection();
         }else
         {
             inst.keepSelection();
             if($(".EditData").attr('boxlist'))
			 {
			     var boxlist=$(".EditData").attr('boxlist').split(',');
			        for(var i=0; i <  boxlist.length;i++) {
							$('#'+boxlist[i]).removeClass('box_linked');
                    }
			 }


			var boxlist="";
			var text="";

			var idsarray=[];
            var ind=0;
			for (const el of selected) {
			    if (!idsarray.includes(el.id))
                {
                    for(var j=0;j<idsarray.length;j++)
                    {
                        if(el.offsetTop < idsarray[j].y+4 && el.offsetTop > idsarray[j].y-4)
                        {
                            //compare x
                            if(el.offsetLeft < idsarray[j].x)
                            {
                                idsarray.splice(j, 0, {id:el.id,y:el.offsetTop,x:el.offsetLeft});
                                break;
                            }else if (el.offsetLeft > idsarray[j].x)
                            {
                                if(j==idsarray.length-1)
                                {
                                    idsarray.push({id:el.id,y:el.offsetTop,x:el.offsetLeft});
                                }
                            }
                        }else
                        {
                            if(el.offsetTop < idsarray[j].y)
                            {
                                idsarray.splice(j, 0, {id:el.id,y:el.offsetTop,x:el.offsetLeft});
                                break;
                            }else if (el.offsetTop > idsarray[j].y)
                            {
                                if(j==idsarray.length-1)
                                {
                                    idsarray.push({id:el.id,y:el.offsetTop,x:el.offsetLeft});
                                }
                            }
                        }

                    }
                    if (ind==0)
                         idsarray.push({id:el.id,y:el.offsetTop,x:el.offsetLeft});
                }
			    ind++;
			}
			var i=0;
			for (index in idsarray) {
				var id=idsarray[index].id;
				if(i==0)
				{
					boxlist=id;
					text=$('#'+id).attr('data_text');
				}else
				{
					boxlist=boxlist+','+id;
					text=text+' '+$('#'+id).attr('data_text');
				}
				$('#'+id).addClass('box_linked');
				i++;
		 	}
			console.log(boxlist);
			$(".EditData").attr('boxlist',boxlist);
			$(".EditData").val(text);
			updateExt();
			if (!oe.ctrlKey && !oe.metaKey) {
			    inst.clearSelection();
			    $('.box_selection').removeClass('box_selection');
            }
         }

});
}

function LoadDocument()
{
	$(".nav-link").addClass("nav-nodisplay");
	if(document_type=='other')
	{
		$("#tab_ocrboxes").removeClass('nav-nodisplay').addClass('active');
		$("#tab-5").addClass("active");
		$("#tab_data").removeClass('nav-nodisplay');
		var incl_type=false;
		var endpoint='ocr';

	}else
	{
		$("#tab_extract").removeClass('nav-nodisplay').addClass('active');
		$("#tab-1").addClass("active");
		$("#tab_ocr").removeClass('nav-nodisplay');
		$("#tab_links").removeClass('nav-nodisplay');
		if($.session.get("roles")!="demo")
        {
            $("#tab_pps").removeClass('nav-nodisplay');
        }

		var incl_type=true;
		var endpoint='all';
	}

	$.ajax({
			type: 'GET',
			headers: {Authorization:'Bearer '+$.session.get("access_token")},
			url: api_host+'/documents/'+document_id+'/'+endpoint,
			data: {
				include_types: incl_type,
				//include_fulltext: false,
			},
			success:function(json){
				json_object=json;
			   $.ajax({
					type: 'GET',
					headers: {Authorization:'Bearer '+$.session.get("access_token")},
					url: api_host+'/documents/'+document_id+'/processed',
					data: {
						scaled: true
					},
					success:function(data){LoadImageArray(data);
							var date = new Date();
							var timestamp = date. getTime();
							$('.fa-bars').click();

							if(document_type!='other')
								$.getJSON("generic-"+json_object["extractions"]["document_type"]+".jsonp?timestamp="+timestamp).done(function(data) {config=data;load_tab_extract()});
							else
								load_tab_ocrboxes();
					 },
					fail:function(data){toastr.error(data.responseJSON.detail, {timeOut: 5000})},
					error:function(data){toastr.error(data.responseJSON.detail, {timeOut: 5000})}
				})
			},
			fail:function(data){toastr.error(data.responseJSON.detail, {timeOut: 5000})},
			error:function(data){toastr.error(data.responseJSON.detail, {timeOut: 5000})}
    });
}

function htmlPPS()
{
	if (PPS.length>0)
	{
		var html='<hr/><button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">PPS List<ul class="dropdown-menu">';
		for(var i=0;i<PPS.length;i++)
		{
			html+='<li><a class="label-'+PPS[i].status+'" href="#" onclick="expandPPS('+i+')">'+PPS[i].status+' '+PPS[i].doc+'</a></li>';
		}
		html+='</ul>';
		$('#PPS_dropdown').html(html);
		expandPPS(0);
	}

}

function expandPPS(index)
{
	try {
			var jsonarray=JSON.parse(PPS[index].comment);
		} catch (error) {
			var jsonarray=false;
		}
	var comments='';
	if(jsonarray==false)
		comments=PPS[index].comment;
	else
		if(jsonarray.negative!==undefined)
		{
			for(var i=0 ;i < jsonarray.negative.length;i++)
			{
				comments+='<span class="negative_span">'+jsonarray.negative[i]+'</span><br />';
			}
		}

		if(jsonarray.warnings!==undefined) {
			for (var i = 0; i < jsonarray.warnings.length; i++) {
				comments += '<span class="warning_span">' + jsonarray.warnings[i] + '</span><br />';
			}
		}
		if(jsonarray.positive!==undefined) {
			for (var i = 0; i < jsonarray.positive.length; i++) {
				comments += '<span class="positive_span">' + jsonarray.positive[i] + '</span><br />';
			}
		}
	var html='';
	html+='                           <br/><br /><div class="row">\n' +
		'                                             <div class="col-lg-4 form-group">\n' +
		'                                                 <span class="label label-'+PPS[index].status+'">'+PPS[index].status+'</span>\n' +
		'                                            </div>\n' +
		'                                            <div class="col-lg-4 form-group">\n' +
		'                                                <span class="label">'+PPS[index].doc+'</span>\n' +
		'                                            </div>\n' +
		'                                        </div>\n' +
		'                           			 <div class="row">\n' +
		'                                                <div class="col-lg-12 form-group"><h3>Comments</h3><br /><h4>'+comments+'</h4></div>\n' +
		'                                        </div>';

	$("#PPS_expand").html(html);
}

function pad2(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

function createPPS()
{
		var dt = new Date();
		var dtstring = dt.getFullYear()
			+ '-' + pad2(dt.getMonth()+1)
			+ '-' + pad2(dt.getDate())
			+ ' ' + pad2(dt.getHours())
			+ ':' + pad2(dt.getMinutes())
			+ ':' + pad2(dt.getSeconds());
		$.ajax({
			headers: {Authorization: 'Bearer ' + $.session.get("access_token")},
			contentType: 'application/json',
			data: JSON.stringify({
				uuid : document_id,
				status : $("#PPS_status").val(),
				comment : $("#PPS_comment").val(),
				doc: dtstring
			}),
			type: 'POST',
			url: api_host+'/logs/',
			success:function(data) {
				console.log(data)
				LoadPPS();
			},
			error:function(e) {toastr.error(e, {timeOut: 5000});},
			fail:function(e) {toastr.error(e, {timeOut: 5000})}
		})
}

function LoadPPS() {
	$.ajax({
		type: 'GET',
		headers: {Authorization: 'Bearer ' + $.session.get("access_token")},
		url: api_host + '/logs/?uuid=' + document_id ,
		success: function (data) {
			console.log(data)
			PPS=data.reverse();
			htmlPPS();
		},
		fail: function (data) {
			toastr.error(data.responseJSON.detail, {timeOut: 5000})
		},
		error: function (data) {
			toastr.error(data.responseJSON.detail, {timeOut: 5000})
		}
	});
}

function saveChanges()
{
	$.ajax({
	 				type: 'PUT',
                    headers: {Authorization:'Bearer '+$.session.get("access_token")},
                    url: api_host+'/documents/'+document_id+'/extractions',
					contentType: 'application/json',
					data:JSON.stringify(json_object.extractions),
                    success:function(json){toastr.success("Changes have been applied successfully", {timeOut: 5000})},
                    fail:function(data){toastr.error(data.responseJSON.detail, {timeOut: 5000})},
                    error:function(data){toastr.error(data.responseJSON.detail, {timeOut: 5000})}
	});
	$.ajax({
	 				type: 'PUT',
                    headers: {Authorization:'Bearer '+$.session.get("access_token")},
                    url: api_host+'/documents/'+document_id+'/ocr',
					contentType: 'application/json',
					data:JSON.stringify(json_object.ocr),
                    success:function(json){toastr.success("Changes have been applied successfully", {timeOut: 5000})},
                    fail:function(data){toastr.error(data.responseJSON.detail, {timeOut: 5000})},
                    error:function(data){toastr.error(data.responseJSON.detail, {timeOut: 5000})}
	});
}

var selection = null

function LoadImageArray(data)
{
    for (var i = 0; i < data.length; i++)
    {
        var pageindex=i+1;
        $('#zoomwrapper').append('<div class="document_page" id="page_'+pageindex+'" name="page"></div>');
        $('#page_'+pageindex).append('<img src="'+data[i]["data"]+'" class="document_page_img" id="img_'+pageindex+'"/>');
    }
}


function associate_results(key,values)
{
	if (values!==null)
	{
		$('#'+key).val(values["value"]);

		if(values["bbox_refs"] && values["bbox_refs"]!== null){
			var boxlist='';
			for(var i=0;i < values["bbox_refs"].length; i++)
			{
				boxvalue='box_'+values["bbox_refs"][i]["page_num"]+'_'+values["bbox_refs"][i]["bbox_id"];
				if(i==0){boxlist=boxvalue;}else{boxlist=boxlist+','+boxvalue;}
				$("#"+boxvalue).addClass('box_linked');
			}
			$('#'+key).attr('boxlist',boxlist);
		}else{$('#'+key).attr('boxlist','');}

	}
}

function LoadOcrBoxes(virtual)
{
	$('.document_page_box_hidden').remove();
    var ocr=json_object;
	if(virtual)
		$('.document_page_img').css('opacity',0);
	else
		$('.document_page_img').css('opacity',1);

    for (var i = 0; i < ocr['pages'].length; i++) {
			var pageindex=i+1;
            var imgheight=parseInt(ocr["pages"][i]["height"]);
			var imgwidth=parseInt(ocr["pages"][i]["width"]);
			var elts='';
			var compressor=2;
            for(var j=0;j<ocr["pages"][i]["bboxes"].length;j++)
			{

				var x1=parseInt(ocr["pages"][i]["bboxes"][j]["x1"]);
				var x2= parseInt(ocr["pages"][i]["bboxes"][j]["x2"]);
				var width=parseInt(ocr["pages"][i]["bboxes"][j]["x2"])-parseInt(ocr["pages"][i]["bboxes"][j]["x1"]);
				var y1=parseInt(ocr["pages"][i]["bboxes"][j]["y1"]);
				var y2= parseInt(ocr["pages"][i]["bboxes"][j]["y2"]);
				var height=parseInt(ocr["pages"][i]["bboxes"][j]["y2"])-parseInt(ocr["pages"][i]["bboxes"][j]["y1"]);

				var top=parseFloat((y1/imgheight)*100).toFixed(4);
				var left=parseFloat((x1/imgwidth)*100).toFixed(4);
				var percwidth=parseFloat((width/imgwidth)*100).toFixed(4);
				var percheight=parseFloat(height/(imgheight)*100).toFixed(4);
				var colorkey="";
				var title=""

				title+=ocr["pages"][i]["bboxes"][j]["text"];
				var colorkey ='';
				if(virtual)
				{
					var char_number=title.length;
					var fontsize=Math.max(Math.min(width / (compressor*char_number)))+'px';
					 elts+='<div class="document_page_box_hidden box_with_attributes" ocr_id="ocr_'+i+'_'+j+'"  colorkey="'+colorkey+'" title="'+title+'" data_text="'+ocr["pages"][i]["bboxes"][j]["text"]+'" id="box_'+pageindex+'_'+ocr["pages"][i]["bboxes"][j]["id"]+'" style="font-size:'+fontsize+';z-index:1000;position:absolute;top:'+top+'%;left:'+left+'%;width:'+percwidth+'%;height:'+percheight+'%; ">'+title+'</div>';
				}
				else
					elts+='<div class="document_page_box_hidden box_with_attributes" ocr_id="ocr_'+i+'_'+j+'"  colorkey="'+colorkey+'" title="'+title+'" data_text="'+ocr["pages"][i]["bboxes"][j]["text"]+'" id="box_'+pageindex+'_'+ocr["pages"][i]["bboxes"][j]["id"]+'" style="z-index:1000;position:absolute;top:'+top+'%;left:'+left+'%;width:'+percwidth+'%;height:'+percheight+'%; "></div>';
			}
            $('#page_'+pageindex).append(elts);
		}
}

function LoadBoxes(json)
{
    $('.document_page_box_hidden').remove();
    var ocr=json;

    for (var i = 0; i < ocr['pages'].length; i++) {
			var pageindex=i+1;
            var imgheight=parseInt(ocr["pages"][i]["height"]);
			var imgwidth=parseInt(ocr["pages"][i]["width"]);

            for(var j=0;j<ocr["pages"][i]["bboxes"].length;j++)
			{

				var x1=parseInt(ocr["pages"][i]["bboxes"][j]["x1"]);
				var x2= parseInt(ocr["pages"][i]["bboxes"][j]["x2"]);
				var width=parseInt(ocr["pages"][i]["bboxes"][j]["x2"])-parseInt(ocr["pages"][i]["bboxes"][j]["x1"]);
				var y1=parseInt(ocr["pages"][i]["bboxes"][j]["y1"]);
				var y2= parseInt(ocr["pages"][i]["bboxes"][j]["y2"]);
				var height=parseInt(ocr["pages"][i]["bboxes"][j]["y2"])-parseInt(ocr["pages"][i]["bboxes"][j]["y1"]);

				var top=parseFloat((y1/imgheight)*100).toFixed(4);
				var left=parseFloat((x1/imgwidth)*100).toFixed(4);
				var percwidth=parseFloat((width/imgwidth)*100).toFixed(4);
				var percheight=parseFloat(height/(imgheight)*100).toFixed(4);
				var colorkey="";
				var title=""

				title+=ocr["pages"][i]["bboxes"][j]["text"];
				var colorkey ='';
				if (ocr["pages"][i]["bboxes"][j]["assigned_type"] != 'VOID' && ocr["pages"][i]["bboxes"][j]["assigned_type"] != '') {
					colorkey = $('[data-type="' + ocr["pages"][i]["bboxes"][j]["assigned_type"] + '"]').attr("rgba");
					title += '\n'+ocr["pages"][i]["bboxes"][j]["assigned_type"];
				}
				var elt='<div class="document_page_box_hidden box_with_attributes" ocr_id="ocr_'+i+'_'+j+'"  colorkey="'+colorkey+'" title="'+title+'" data_text="'+ocr["pages"][i]["bboxes"][j]["text"]+'" id="box_'+pageindex+'_'+ocr["pages"][i]["bboxes"][j]["id"]+'" style="z-index:1000;position:absolute;top:'+top+'%;left:'+left+'%;width:'+percwidth+'%;height:'+percheight+'%; "></div>';
				$('#page_'+pageindex).append(elt);

			}
		}

}

function resultrow(key,data,col)
{
    var html='';
    var i=1;
    var colwidth=12/col;
    html+='<div class="row">';
    var arr=[];
    var typeid=key.replace(/ /g,'_').toLowerCase();
    for (const [key2, value2] of Object.entries(data))
    {
        if(i==0)
        {
            //do nothing
        }else if (i%col==0)
        {
            html+='</div><div class="row">';
        }
        if (config.Aggregation[key][key2].length >= 1)
        {
            var composedkey=key.toLowerCase().replace(/\s/g, '_')+'-'+key2.toLowerCase().replace(/\s/g, '_');
            html+=resultarray(composedkey);
            arr[composedkey]=[];
            for (const [key3, value3] of Object.entries(value2))
            {
              arr[composedkey].push(value3);
            }
        }else {
            var id=typeid+'-'+value2['code'];
            html += '<div class="col-sm-' + colwidth + '" placeholder="' + key2 + '">\
                    <input type="text" class="form-control form-control-sm"  data-structure="string-'+id+'" id="'+id+'"  name="'+id+'" title="' + key2 + '" placeholder="' + key2 + '">\
                </div>';
        }
    }
    html+='</div>';
    return [html,arr];
}

function resultarray(value)
{
    return '<div class="row col-sm-12">\
                <div class="col-sm-12 small">\
                    <table id="'+value+'_table" class="footable footable-1 breakpoint-sm" style="" data-structure="table-'+value+'"></table>\
                </div>\
            </div>'
}

function LoadExtractions(results)
{
    var html='<div class="panel-body">';
    var arr=[];
    for (const [key, value] of Object.entries(config.Aggregation)) {
        var dataadd='';
        var classadd='';
        var firstlvlkey=key.toLowerCase().replace(/\s/g, '_');
        if(config.Aggregation[key].length > 0)
        {
                dataadd=' data-backdrop="" data-toggle="modal" data-target="#modal'+firstlvlkey+'"';
                classadd=' modal_table';
        }
         html+='<div class="row">\
                    <div class="col-lg-12">\
                        <div class="ibox border-bottom">\
                            <div class="ibox-title">\
                                <h5>'+key+' <small>Information</small></h5>\
                                    <div class="ibox-tools">\
                                        <a class="collapse-link"  '+dataadd+' id="id_'+firstlvlkey+'">\
                                            <i class="fa fa-chevron-down"></i>\
                                        </a>\
                                     </div>\
                            </div>\
                            <div class="ibox-content'+classadd+' inmodal" style="display:none;" id="modal'+firstlvlkey+'">';
      if(config.Aggregation[key].length > 0)
      {
          html+=resultarray(firstlvlkey);
          arr[firstlvlkey]=[];
          for (const [key2, value2] of Object.entries(value))
          {
            arr[firstlvlkey].push(value2);
          }
      }
      else
      {
          var col=2;
          res=resultrow(key,value,col);
          html+=res[0];
          for (const[arrkey,arrvalue] of Object.entries(res[1]))
          {
              if(arrkey!='')
              {
                  arr[arrkey]=[];
                  for(var i=0;i<arrvalue.length;i++)
                  {
                      arr[arrkey].push(arrvalue[i]);
                  }
              }
          }
      }

         html+='                        </div>\
                                </div>\
                            </div>\
                         </div>';
    }
    html+='</div>';
    //loadhtml
    $("[name='tab_content_extract']").html(html);

    //load Data
    var tables_data=[];
    for(const [key, value] of Object.entries(arr))
    {
        tables_data[key]={header:value,data:[]};
    }

    if(results['extractions']!==undefined)
    {
        console.log('ohoh problem');
                results=results['extractions'];
    }
    for(var root in results)
		{

			if(results[root]!==null)
			{
				if(results[root] instanceof Array)
				{//List type
					// hack for general type
					var generalprefix='';

					if(!root.includes('-') && Object.entries(arr).find(([key]) => key === 'general-'+root))
					{
						generalprefix='general-';
					}
                    tables_data[generalprefix+root].data=extract_list(arr,root,results);
				}else
				{
					if(typeof results[root]["value"] === "undefined")
					{
						for (var root2 in results[root])
						{
							if(results[root][root2] instanceof Array)
							{//List type
                                    tables_data[root+'-'+root2].data=extract_list(arr,root,results[root],root2);
							}else
							{
								associate_results(root+'-'+root2,results[root][root2]);
							}
						}
					}else
					{
						associate_results('general-'+root,results[root]);
					}
				}
			}else
			{
			}
		}

    //loadTables
    for (const [key, value] of Object.entries(tables_data))
    {
          var struct=[];
          struct["columns"]=[];
          struct["placeholders"]=[];
          struct["addrow"]={};
          struct["rows"]=[];

          for (const [key2, value2] of Object.entries(value.header))
          {
            var datakeyname=Object.keys(value2)[0];
            var datakey=datakeyname.toLowerCase().replace(/\s/g, '_');
            struct["columns"].push({"name":datakey,"title":datakeyname});
            struct["placeholders"][datakey]=datakeyname;
            struct["addrow"][datakey]='<input class="form-control form-control-sm '+datakey+'" datatype="'+datakey+'" type="text" title="'+datakeyname+'" placeholder="'+datakeyname+'">';
          }

          for (const [key2, value2] of Object.entries(value.data))
          {
              var row={};
                for(var ind in struct["columns"])
			    {
			        var structref=struct["columns"][ind]["name"];
			        var rowval='';
			        var refrow='';
			        if(value2[structref] != null && value2[structref] !=undefined)
			            refrow=value2[structref];
			        else
			            refrow=null;
                    if(refrow != null)
                    {
                        rowval=refrow["value"];
                    }

				    var boxlist='';
                    if(refrow!=null && refrow["bbox_refs"] ){

                        for(var i=0;i < refrow["bbox_refs"].length; i++)
                        {
                            boxvalue='box_'+refrow["bbox_refs"][i]["page_num"]+'_'+refrow["bbox_refs"][i]["bbox_id"];
                            $("#"+boxvalue).addClass('box_linked');
                            if(i==0){boxlist=boxvalue;}else{boxlist=boxlist+','+boxvalue;}
                        }
                    }
                    row[structref]='<input type="text" value="'+rowval+'" boxlist="'+boxlist+'" class="form-control form-control-sm '+structref+'" datatype="'+structref+'" title="'+struct["placeholders"][structref]+'" placeholder="'+struct["placeholders"][structref]+'">';

			    }
              struct["rows"].push(row);
          }

          var refkey=null;
          refkey=key.toLowerCase().replace(/\s/g, '_')+'_table';
          ft_addrows[refkey]=struct["addrow"];
          // We have to let the refkey has the plain raw code inside the init function otherwise it doesn't work... No clue why...
          FooTable.init('#'+refkey, {
              columns:struct["columns"],
              rows:struct["rows"],
              editing: {
                  enabled: true,
                  alwaysShow: true,
                  allowAdd: true,
                  allowDelete:true,
                  allowEdit:false,
                  deleteRow: function(row){FooTable.get('#'+key.toLowerCase().replace(/\s/g, '_')+'_table').rows.delete(row);setTimeout(function(){ jQuery('#'+key.toLowerCase().replace(/\s/g, '_')+'_table').tableDnD() },1500);},
                  addRow: function(){FooTable.get('#'+key.toLowerCase().replace(/\s/g, '_')+'_table').rows.add(ft_addrows[key.toLowerCase().replace(/\s/g, '_')+'_table']);setTimeout(function(){;disableExtListener();enableExtListener();jQuery('#'+key.toLowerCase().replace(/\s/g, '_')+'_table').tableDnD()}, 1500)}
              },
          });
          setTimeout(function(){jQuery('#'+key.toLowerCase().replace(/\s/g, '_')+'_table').tableDnD()}, 1500);

    }
}

var ft_rows={};
var ft_addrows={};
var PPS=null;

function extract_list(conf,root,results,root2='')
{
                    if(root2!='')
                    {
                        var name=root+'-'+root2;
                        var structure=conf[name];
                        root=root2;
                    }
					else
                    {
                        var name=root;
                        var structure=conf[name];
                    }

                    var data=[];
					if(results!='' && structure!==undefined && structure!==null && structure!='undefined')
					{
						for(var i=0;i< results[root].length;i++)
						{
							var row={};
							for(const [key, value] of Object.entries(structure))
							{
							    var elt=Object.entries(value)[0][1]["code"];
								row[elt]=results[root][i][elt];
							}
							data.push(row);
						}
					}
					return data;
}

function load_tab_extract()
{
    disableListeners();
    LoadBoxes(json_object["ocr"]);
    LoadExtractions(json_object["extractions"]);
    enableibox();
    extSelection();
    setTimeout(function(){enableExtListener()}, 1500);
    $('[title][title!=""]').tooltip();
}

function load_tab_ocrboxes()
{
	LoadOcrBoxes(false);
	$('[title][title!=""]').tooltip();
}

function load_virtual_ocrboxes()
{
	LoadOcrBoxes(true);
}

function load_tab_data()
{
	$("#tab_content_data").html('<pre class="print_data">'+JSON.stringify(json_object,null,2)+'</pre>');
}

function load_tab_ocr()
{
    disableListeners();
    var html=loadMenu(config);
    $("#tab_content_ocr_body").html(html);
    LoadBoxes(json_object["ocr"]);
    $(".box_with_attributes").each(function()
					{
						if ($(this).attr("colorkey")==undefined || $(this).attr("colorkey")=='')
						{

						}else
						{
							$(this).css("background","rgba("+$(this).attr("colorkey")+")");
						}
					}
				);
    ocrSelection();
    enableOcrListener();
    $('[title][title!=""]').tooltip();
}

function load_tab_links()
{
    LoadBoxes(json_object["ocr"]);
    loadBoxLinks();
    $('[title][title!=""]').tooltip();
}


var pps=[];
function load_tab_pps()
{
    selection = null;
    LoadPPS();
    disableListeners();
    $('[title][title!=""]').tooltip();
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
   // activated tab
    eval("load_"+$(e.target).attr("id")+"()");
});
var json_object=null;
var config=null;
var document_id=findGetParameter("document_id");
var document_type=findGetParameter("document_type");
$('#documentid').html(document_id);
var pzoom=null;
const panzoomelem = document.getElementById('zoomwrapper');

jQuery(function($){
    if($.session.get("roles")!="demo")
    {
        jQuery("#changesbutton").show();
    }
    LoadDocument();

	$('.datepicker').datepicker({
            format: 'dd.mm.yyyy',
    });
	pzoom = panzoom(panzoomelem, {
	  beforeWheel: function(e) {
		// allow wheel-zoom only if altKey is down. Otherwise - ignore
		var shouldIgnore = !e.altKey;
		return shouldIgnore;
	  },
	  beforeMouseDown: function(e) {
		// allow mouse-down panning only if altKey is down. Otherwise - ignore
		var shouldIgnore = !e.altKey;
		return shouldIgnore;
	  },
	  beforeTouch: function(e) {
		// allow mouse-down panning only if altKey is down. Otherwise - ignore
		var shouldIgnore = !e.altKey;
		return shouldIgnore;
	  },
	  beforeDoubleClick: function(e) {
		// allow mouse-down panning only if altKey is down. Otherwise - ignore
		var shouldIgnore = !e.altKey;
		return shouldIgnore;
	  },
		bounds: true
	});


});

(function( $ ){

  $.fn.fitText = function( kompressor, options ) {

    // Setup options
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

    return this.each(function(){

      // Store the object
      var $this = $(this);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call once to set.
      resizer();

      // Call on resize. Opera debounces their resize by default.
      $(window).on('resize.fittext orientationchange.fittext', resizer);

    });

  };


})( jQuery );

//disable selection if altkey pressed
$(window).keydown(function(evt) {
  if (evt.altKey) { // ctrl
    if(selection != null){selection.disable()};
  }
});
$(window).keyup(function(evt) {
    if(selection != null){selection.enable()};
});
