function preload() {
	$.ajax({
		url: "http://web-dev.ci-connect.net/~erikhalperin/JobAnalysis/data-list.wsgi",
	 	dataType: 'jsonp',
	 	success: datahandler,
	});
}

var datahandler = function(data) {
 	s=data.sites;
 	p=data.projects;
 	u=data.users;
	s.splice(0, 0, "ALL");
	p.splice(0, 0, "ALL");
	u.splice(0, 0, "ALL");
 	for (i in s)	$("#idSiteSelect").append( '<option value="'+s[i]+'">' + s[i] + '</option>');
 	for (i in p)	$("#idProjectSelect").append( '<option value="'+p[i]+'">' + p[i] + '</option>');
 	for (i in u)	$("#idUserSelect").append( '<option value="'+u[i]+'">' + u[i] + '</option>');

}


/*
function getData() {
	$.ajax({
		url: "",
		data: { selSite: $("#idSiteSelect").val(), selUser: ("#idUserSelect").val(), selProj: ("#idProjectSelect").val() },
	 	dataType: 'jsonp',
	 	success: showData(data)
	});
}

function showData(data) {
	
	var T = [];
	for (i in data) {
		T.push(data[i][4]);
	}
	
 	var options = {
    			chart : {
    				renderTo : 'graphspace', zoomType : 'xy',
    				type : 'area', height : 600, margin : [ 60, 30, 45, 70 ]
    			},			
    			plotOptions: { 
					area: {
                		stacking: 'normal',
               		 	lineColor: '#666666',
               	  		lineWidth: 1,
                		marker: {
                    		lineWidth: 1,
                    		lineColor: '#666666'
                		}
            		}
				},		
    			title : { 
					text : 'Job Chart' 
				},		
    			xAxis : {  
					categories: T,
					type : 'datetime', 
					tickWidth : 0, 
					gridLineWidth : 1, 
					title : { text : 'Date' } 
				},	
    			yAxis : { 
					title : { text : 'Number of Jobs' },
					labels: { formatter: function () { return this.value; } } 
				},	
    			legend : { align : 'left', verticalAlign : 'top', y : 10, floating : true, borderWidth : 0 },
    			exporting: { buttons: { contextButton: {  text: 'Export' } }, sourceHeight: 1050, sourceWidth: 1485 },
    			credits: { enabled: false }
    	};
		
		var max = data[0][0];
		for (i in data) {
			if (data[i][0] >= max) {
				max = data[i][0];
			}
		}		
		
		var D = [][];
		for (i in data) {
			D[data[i][0]].push( data[i][3] );
		}
				
		options.series=D;
		
   		chart = new Highcharts.Chart(options);
}
*/
	 
$(document).ready( function() {
	preload();
	$('.dropdown').change(function () {
	    if ($(this).val().match("Site")) {
			$('#idUserSelect, #idProjectSelect').removeAttr('disabled');
			$('#idSiteSelect').attr('disabled', 'disabled').prop('selectedIndex',0);
	    }
	    else if ($(this).val().match("User")) {
			$('#idSiteSelect, #idProjectSelect').removeAttr('disabled');
			$('#idUserSelect').attr('disabled', 'disabled').prop('selectedIndex',0);
	    }
		else if ($(this).val().match("Project")) {
			$('#idUserSelect, #idSiteSelect').removeAttr('disabled');
			$('#idProjectSelect').attr('disabled', 'disabled').prop('selectedIndex',0);
		}
		else {
			$('#idProjectSelect, #idUserSelect, #idSiteSelect').attr('disabled', 'disabled').prop('selectedIndex',0);
		}
	});

	$('#idSiteSelect, #idUserSelect, #idProjectSelect').change(getData);
});
	

