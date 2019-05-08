///////////////////////////////////////////////////////////////////////////
// Map creation functions
///////////////////////////////////////////////////////////////////////////

jQuery( document ).ready(function() {
    //never cache ajax
    jQuery.ajaxSetup({ cache: false });
    console.log('ran');
    var map = L.map('map', {
        minZoom: 5,
        maxZoom: 7
    }).setView([45.4648009,-89.6321558], 7);

    


	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGxzY2huZWkiLCJhIjoiY2p2M3VtdG4wMms0bjN5czB5NXYzZnFjdSJ9.uphdRxKkjThKtX0vMPIyYA', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.light'
	}).addTo(map);
	
    var geojson;
    geojson = L.geoJson(countyData, {
		style: style,
		onEachFeature: onEachFeature
    }).addTo(map);
    
    console.log(geojson);

	function style(feature) {
		return {
			fillColor: getColor(feature.properties.AREA),
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7
		};
	}
	
	//highlight area function
	function highlightFeature(e) {
		var layer = e.target;
		
		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});
		
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
        }
        info.update(layer.feature.properties);
	}

	//remove highlight function
	function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}

	//Click to AED View
	function clickToAED(e) {
        
       
        var layer = e.target;
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
        }
        props = layer.feature.properties;
		if (typeof props !== 'undefined'){
            
		 var knackID = props.KnackID;           
         getLink(knackID);
          
		
        }
        
    }
    
    //test click to zoom
    function zoomToFeature(e) {
        //map.fitBounds(e.target.getBounds());
        window.open('https://people.extension.wisc.edu');
    }

	//add listeners to our counties
	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
            click: clickToAED
            //click: zoomToFeature
		});
	}
	
	//create a custom control for showing information
	var info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info.update = function (props) {
        
        if (typeof props !== 'undefined'){
            var knackID = props.KnackID;           
            getAD(knackID, props, this);
            
            
		
        }
        else{
            this._div.innerHTML = 'Hover over a county';
        }
	
		
	

		
	};

	// Add a color legend
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 10, 20, 50, 100, 200, 500, 1000],
			labels = [];

		// loop through our areas
		for (var i = 0; i < 22; i++) {
			div.innerHTML +=
				'<i style="background:' + getColor(i + 1) + '"></i> ' + 'Area ' + (i + 1) + '<br>';
		}

		return div;
	};

	legend.addTo(map);

	info.addTo(map);

	


});



///////////////////////////////////////////////////////////////////////////
// Helper function for Institute API calls
//////////////////////////////////////////////////////////////////////////


// This function creates the pop up info box
function makePopUp(allRecordsForObject, props, currentDiv) {
    //If the filter worked, we should only have 1 record. Filters that don't actually filter (no AED) return all the records for some reason 
    if(allRecordsForObject.length == 1){
        if(typeof(allRecordsForObject[0].field_37_raw['thumb_url']) != 'undefined'){
            picURL = '<img src="' + allRecordsForObject[0].field_37_raw['thumb_url'] + '"/><br/>';
        }
        else{
            picURL = '';
        }

        currentDiv._div.innerHTML = '<h4>Area Extension Director Information</h4>' +  
        '<b>' + props.AREA + ': ' + props.NAME + ' County</b><br />' +
        picURL + 
        allRecordsForObject[0].field_38 + '<br/>' + 
        allRecordsForObject[0].field_29 +
        '<br/><i style="font:smaller">Click county for more information</a>';

    }
    //if there are no records or all the records, there is no AED
    else{
                currentDiv._div.innerHTML = '<h4>Area Extension Director Information</h4>' +  
        '<b>' + props.AREA + ': ' + props.NAME + ' County</b><br /><br />AED Position Vacant';

    }
    
  }

  // This function sends the user to the AED page on click
function doLink(allRecordsForObject, props, currentDiv) {
    //If the filter worked, we should only have 1 record. Filters that don't actually filter (no AED) return all the records for some reason 
    if(allRecordsForObject.length == 1){
        aedLink = 'https://people.extension.wisc.edu/#home/person/' + allRecordsForObject[0].id;
       window.open(aedLink);

    }
    
  }
  
 
  
  function getAllRecordsForObject(sceneKey, viewKey, countyID, callbackFunctionToHandleData,  props, currentDiv) {
    if (!sceneKey || !viewKey) {
      throw new Error('Missing scene or view key!');
    }
  
    if (!callbackFunctionToHandleData) {
      throw new Error('No callback function provided; make sure the data is handled somehow.');
    }
  
    // AJAX prep
    var url = 'https://api.knack.com/v1/pages/' + sceneKey + '/views/' + viewKey + '/records?rows_per_page=500';
    var headers = {
      'X-Knack-Application-ID': '5b5881f5ff0b5252531f5e48',
      'X-Knack-REST-API-Key': 'knack',
      "cache-contro": "no-cache"
    };
    
    //Filters
    var filters = {
        'match': 'and',
        'rules': [
                {
                    'field':'field_29',
                    'operator':'contains',
                    'value': countyID
                }
                ]
    };
    var fullUrl = url + '&filters=' + encodeURIComponent(JSON.stringify(filters));    
    jQuery.ajax({
      url: fullUrl,
      cache: false,
      headers: headers,
      type: 'GET',
    }).done(function(responseData) {
        // Handle ALL records with our callback function
      callbackFunctionToHandleData(responseData.records, props, currentDiv);
    });
    
  }
  
  // Use the API call
 function getAD(countyID, props, currentDiv){

    //we should never have more than 1 page worth, so we don't need this to be recursive
    getAllRecordsForObject(sceneKey='scene_74', viewKey='view_126', countyID=countyID, callbackFunctionToHandleData=makePopUp,  props=props, currentDiv=currentDiv);

 }

 function getLink(countyID){
    
    getAllRecordsForObject(sceneKey='scene_74', viewKey='view_126', countyID=countyID, callbackFunctionToHandleData=doLink);
 }
 
 ///////////////////////////////////////////////////////////////////////////////////////////////////
 // General helper functions
 //////////////////////////////////////////////////////////////////////////////////////////////////////

 	
// Returns if a value is a string
function isString (value) {
    return typeof value === 'string' || value instanceof String;
    }

//function to get color by area
function getColor(d) {
    //palette from:https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
    var allColors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabebe', '#469990', '#e6beff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000']
    
    //split d and get the second half, if it's a string
    if(isString(d)){
        var areaID = parseInt(d.split(" ")[1]) - 1;
        return allColors[areaID];
    }
    else{
        return allColors[d-1];
    }		 
}
