
// makes call to wsgi, which returns array of all sites, users, projects 
// on success, calls fillMenu
function preload() {
	$.ajax({
		url: "http://web-dev.ci-connect.net/~erikhalperin/JobAnalysis/data-list.wsgi",
	 	dataType: 'jsonp',
	 	success: fillMenu,
	});
}

// fills in dropdown menu with data from ajax call in preload() function
var fillMenu = function(data) {
	// assigns data to global var 'choices'
	window.choices = data;
	
	// remove @login01.osgconnect.net string
	var u = [];
	for (i in data.users) {
		var str = data.users[i];
		str = str.replace('@login01.osgconnect.net',"") 
		u.push(str);
	};
	
	s=data.sites;
 	p=data.projects;	
	
	// add 'ALL' option to each dropdown menu
	s.splice(0, 0, "ALL");
	p.splice(0, 0, "ALL");
	u.splice(0, 0, "ALL");
	
 	for (i in s)	$("#idSiteSelect").append( '<option value="'+ s[i] +'">' + s[i] + '</option>');
 	for (i in p)	$("#idProjectSelect").append( '<option value="'+ p[i] +'">' + p[i] + '</option>');
 	for (i in u)	$("#idUserSelect").append( '<option value="'+ u[i] +'">' + u[i] + '</option>');
}



// makes call to second wsgi, with selected user, site, project (or all)
// on success, calls showData 
function getData() {

	function makeURL() {
		
		var url = 'http://web-dev.ci-connect.net/~erikhalperin/JobAnalysis/data-entries.wsgi?';
		url += 'hours=' + $('#spinner').val();
		url += ';bin=' + parseInt($('#spinner').val() /o 15);
		return url;
	}
	
	$.ajax({
		url: makeURL(),
	 	dataType: 'jsonp',
	 	success: showData
	});
	

}

// create new array from data in getData function
// creates chart
var showData = function(data) {
	
	// makes x-axis values array of unique timestamps
	var cs = [];
	for (i in data) {
		var t = data[i][3];
		if (cs.indexOf(t) == -1) {
			cs.push(t);
		}
	}
	cs.sort(function(a,b){return a-b});
	
	var convert = [];
	for (i in cs) {
		var date = Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', cs[i]*1000);
		convert.push(date);
	}
	console.log(convert);


 	// chart options
	var options = {
		chart : {
			renderTo : 'graphspace', zoomType : 'xy',
			type : 'area', height : 600, margin : [ 60, 30, 45, 70 ],
			marginBottom: 180,
		    panning: true,
		    panKey: 'shift',
		},	
		// tooltip: { enabled: false },
		noData: {
		    	style: {
		        	fontWeight: 'bold',
		            fontSize: '15px',
		           	color: '#303030'
		        }
		},		
		plotOptions: { 
			area: {
        		stacking: 'normal',
       		 	lineColor: '#666666',
       	  		lineWidth: 1,
        		marker: { enabled: false },
				//dataLabels: { enabled: false },
    		}
		},		
		title : { 
			text : 'Job Chart',
		},		
		subtitle: {
		   	text: 'User: ' + $('#idUserSelect').val() + '  |  Project: ' + $('#idProjectSelect').val()
		},	
		xAxis : {  
			categories: convert,
			labels: {
			 	overflow: 'justify',
				staggerLines: 2
			},
			type : 'datetime', 
			tickWidth : 0, 
			gridLineWidth : 1, 
			align: 'left',
			title : { text : 'Timestamp' } 
		},	
		yAxis : { 
			title : { text : 'Number of Jobs' },
			labels: { formatter: function () { return this.value ; } } 
		},	
		legend : { align: 'center', verticalAlign: 'bottom', floating: true, itemMarginBottom: 5},
		exporting: { buttons: { contextButton: {  text: 'Export' } }, sourceHeight: 1050, sourceWidth: 1485 },
		credits: { enabled: false }
    	};


		
		// creates array of unique sites
		var S = [];
		for (i in data) {
			var n = data[i][2];
			// n+1 bc want to make sure 'ALL' is not included
			var k = choices.sites[n+1];
			if (S.indexOf(k) == -1) {
				S.push(k);
			}		
		}
		
		/*
		// creates array of unique users
		var Us = [];
		for (i in data) {
			var n = data[i][1];
			var k = choices.users[n+1];
			if (Us.indexOf(k) == -1) {
				Us.push(k);
			}
		} */
		
		// creates array of number of jobs running at each timestamp
		var TS = [];
		for (i in cs) {
			var TSa = [];
			for (j in data) {
				if (data[j][3]==cs[i]) {
					TSa.push(data[j][4]);
				}
			}
			TS.push(TSa);
		}
	
		if ($(this).val().match("Site")) {
			// creates data series from arrays
			var sd = [];
			for (i in S) {
				sd.push({ 'name': S[i], 'data': TS[i] });
			}
		}
		
		if ($(this).val().match("User")) {
			// creates data series from arrays
			var sd = [];
			for (i in P) {
				sd.push({ 'name': P[i], 'data': TS[i] });
			}
		}
		
		options.series=sd;

		// create chart
		
   		chart = new Highcharts.Chart(options);
		//chart.redraw();
		
}


// once page is ready, calls functions, enables/disables dropdown menu depending on selections
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
	//$('#idUserSelect, #idProjectSelect').change(getData);
	
});
	
