
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
		if ($('#idUserSelect').val() == 'ALL' && $('#idProjectSelect').val() == 'ALL') {
			url += ';hours=' + $('#spinner').val() + ';bin=' + parseInt($('#spinner').val() * 60 / 15);
			return url;
		}
		else if ($('#idUserSelect').val() == 'ALL') {
			url += 'project=' + $('#idProjectSelect').val();
		}
		else if ($('#idProjectSelect').val() == 'ALL') {
			url += 'user=' + $('#idUserSelect').val() + '@login01.osgconnect.net';
		}
		
		else {	
			url += 'user=' + $('#idUserSelect').val() + '@login01.osgconnect.net';
			url += ';project=' + $('#idProjectSelect').val();
		}
		
		url += ';hours=' + $('#spinner').val();
		url += ';bin=' + parseInt($('#spinner').val() * 60 / 15);
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
	cs.sort(function(a,b) {return a-b} );
	
	// console.log(cs);
	
	var convert = [];
	for (i in cs) {
		var date = Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', cs[i]*1000);
		convert.push(date);
	}
	// console.log(convert);

 	// chart options
	var options = {
    			chart : {
    				renderTo : 'graphspace', zoomType : 'xy',
    				type : 'area', height : 600, margin : [ 60, 30, 45, 70 ],
					marginBottom: 220,
				    panning: true,
				    panKey: 'shift'
    			},	
				tooltip: {
					formatter: function() {
						return '<b>' + this.series.name + '</b><br>' +
						'Timestamp: <b>' + this.x + '<br>' +
						'</b>Number of Jobs: <b>'  + this.y + '</b>';
					}
				},
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
						dataLabels: { enabled: false },
            		}
				},		
    			title : { 
					text : 'Job Chart',
				},
				subtitle: {
				   	text: 'Site: ' + $('#idSiteSelect').val() + '   |   User: ' + $('#idUserSelect').val() + '  |  Project: ' + $('#idProjectSelect').val()
				},		
    			xAxis : {  
					categories: convert,
					labels: {
					 	overflow: 'justify',
						rotation: -45
					},
					//type : 'datetime', 
					tickWidth : 0, 
					gridLineWidth : 1, 
					align: 'left',
					title : { text : 'Timestamp' },
				},	
    			yAxis : { 
					title : { text : 'Number of Jobs' },
					labels: { formatter: function () { return this.value ; } } 
				},	
    			legend : { align: 'center', verticalAlign: 'bottom', floating: true, itemMarginBottom: 5},
    			exporting: { buttons: { contextButton: {  text: 'Export' } }, sourceHeight: 1050, sourceWidth: 1485 },
    			credits: { enabled: false }
    	};


		console.log(data);
		// creates array of unique sites
		var S = [];
		for (i in data) {
			var n = data[i][2];
			// n+1 bc want to make sure 'ALL' is not included
			var k = choices.sites[n+1];
			if ( S.indexOf(k) == -1 && k != 'ALL') {
				S.push(k);
			}		
		}
		// console.log(S);
		
		// creates array of unique users
		var U = [];
		for (i in data) {
			var n = data[i][0];
			// n+1 bc want to make sure 'ALL' is not included
			var k = choices.users[n+1];
			if ( U.indexOf(k)==-1 && k!='ALL') {
				U.push(k);
			}		
		}
		console.log(U);
		
		// creates array of unique projects
		var P = [];
		for (i in data) {
			var n = data[i][0];
			// n+1 bc want to make sure 'ALL' is not included
			var k = choices.projects[n+1];
			if ( P.indexOf(k)==-1 && k!='ALL') {
				P.push(k);
			}
		}
		
		
		if ($('.dropdown').val().match("Site")) {
			var TS = []; // length=number of sites
			for (i in S) {
				var TSa = [];
				for (j in cs) {
					var total = 0;
					for (k in data) {
						var n = data[k][2];
						if (data[k][3]==cs[j] && choices.sites[n]==S[i]) {
							total += data[k][4];
						}
					}
					TSa.push(total);
				}
				TS.push(TSa);
			}
		}

		
		if ($('.dropdown').val().match("User")) {
			var TS = []; 
			for (i in U) {
				var TSa = [];
				for (j in cs) {
					var total = 0;
					for (k in data) {
						var n = data[k][0];
						if (data[k][3]==cs[j] && choices.users[n]==U[i]) {
							total += data[k][4];
						}
					}
					TSa.push(total);
				}
				TS.push(TSa);
			}
		}
		
		if ($('.dropdown').val().match("Project")) {
			var TS = []; 
			for (i in P) {
				var TSa = [];
				for (j in cs) {
					var total = 0;
					for (k in data) {
						var n = data[k][1];
						if (data[k][3]==cs[j] && choices.projects[n]==P[i]) {
							total += data[k][4];
						}
					}
					TSa.push(total);
				}
				TS.push(TSa);
			}
		}
	
		// console.log(TS);
	
		// if user selects sort by site
		if ($('.dropdown').val().match("Site")) {
			var sd = [];
			for (i in S) {
				sd.push({ 'name': S[i], 'data': TS[i] });
			}
		}
		
		var Ua = [];
		for (i in U) {
			var str = U[i];
			str = str.replace('@login01.osgconnect.net',"") 
			Ua.push(str);
		};
		// if user selects sort by user
		if ($('.dropdown').val().match("User")) {
			var sd = [];
			for (i in Ua) {
				sd.push({ 'name': Ua[i], 'data': TS[i] });
			}
		}
		
		// if user selects sort by project
		if ($('.dropdown').val().match("Project")) {
			var sd = [];
			for (i in P) {
				sd.push({ 'name': P[i], 'data': TS[i] });
			}
		}
		
		// console.log(sd);
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
	
