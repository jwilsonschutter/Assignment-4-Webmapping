mapboxgl.accessToken = 'pk.eyJ1IjoiamFtZXN3aWxzb25zY2h1dHRlciIsImEiOiJja2xiamw0dTIwcjZlMm5xZXR1Z2oyNTZ0In0.ykjwA7KZIseTEFrKv-4aDw';

//before we get started huge shout out to Nicholas Cowan whose code I learned a lot from and helped out with pop ups tremendously
//https://github.com/nicholascowan17/nyc-essential-workers/blob/12d5c9625bd20ab9139e7a57739978dab464d5e9/js/scripts.js#L120

// map

var options = {
  container: 'mapcountainer',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-74.0060, 40.7128],
  zoom: 10
};

var map = new mapboxgl.Map(options);

//controls for map

var navigators = new mapboxgl.NavigationControl();
map.addControl(navigators, 'bottom-right');

//add in a geojson source

// data for income using 2018 acs survey
// https://docs.mapbox.com/mapbox-gl-js/example/updating-choropleth/ was used for fill color
map.on('style.load', function() {
  map.addSource('income', {
    type: 'geojson',
    data: './data/incometest.geojson'
  });


  map.addLayer({
    'id': 'income-fill',
    'type': 'fill',
    'source': 'income',
    'layout': {
      'visibility': 'none'
    },
    'paint': {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'Refactored_estimate'],
        0,
        '#fffffe',
        33966,
        '#ffffff',
        55898,
        '#ffbfbf',
        70390,
        '#ff8080',
        93366,
        '#ff4040',
        260000,
        '#ff0000',
      ],
      'fill-outline-color': '#ccc',
      'fill-opacity': 0.75
    }
  });

  map.addSource('death', {
    type: 'geojson',
    data: './data/coviddeathratev2.geojson'
  });



  map.addLayer({
    'id': 'death-fill',
    'type': 'fill',
    'source': 'death',
    'layout': {
      'visibility': 'visible'
    },
    'paint': {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'Refactored_COVID_DEATH_RATE'],
        0,
        '#b3cde0',
        169,
        '#6497b1',
        247,
        '#005b96',
        283,
        '#03396c',
        351,
        '#011f4b',
      ],
      'fill-outline-color': '#ccc',
      'fill-opacity': 0.75
    }
  });

  // add an empty data source, which we will use to highlight the lot the user is hovering over
map.addSource('highlight-feature', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: []
  }
})

// add a layer for the highlighted lot
map.addLayer({
  id: 'highlight-line',
  type: 'line',
  source: 'highlight-feature',
  paint: {
    'line-width': 2,
    'line-color': 'white',
  }
});

});


//popup figuring it out

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on('mousemove', function (e) {
  // query for the features under the mouse
  var features = map.queryRenderedFeatures(e.point, {
      layers: ['income-fill', 'death-fill'],
  });

  if (features.length > 0) {
   var hoveredFeature = features[0]
   if (hoveredFeature.layer.id === 'death-fill') {
     var zipcode = hoveredFeature.properties.ZIPCODE
     var name = hoveredFeature.properties.PO_NAME
     var drate = hoveredFeature.properties.Refactored_COVID_DEATH_RATE
     var population = hoveredFeature.properties.POPULATION
     var popupContent = `
       <div>
       <h2>Zip Code: ${zipcode}</h2>
       <h4>Area: ${name}</h4>
       <p> This part of NYC has a population of ${population}, and a deathrate of ${drate} people per 100 thousand.</p>
       </div>
     `

     popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
   }

   if (hoveredFeature.layer.id === 'income-fill') {
     var zipcode = hoveredFeature.properties.ZIPCODE
     var name = hoveredFeature.properties.PO_NAME
     var dollas = hoveredFeature.properties.Refactored_estimate
     var population = hoveredFeature.properties.POPULATION
     var popupContent = `
       <div>
       <h2>Zip Code: ${zipcode}</h2>
       <h4>Area: ${name}</h4>
       <p> This part of NYC has a population of ${population}, and an average houseold income of ${dollas} $ per year. </p>
       </div>
     `

     popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
   }
    else {

   }
   // set this lot's polygon feature as the data for the highlight source
   map.getSource('highlight-feature').setData(hoveredFeature.geometry);

   // show the cursor as a pointer
   map.getCanvas().style.cursor = 'pointer';
 } else {
   // remove the Popup
   popup.remove();
   map.getCanvas().style.cursor = '';
   map.getSource('highlight-feature').setData({
         "type": "FeatureCollection",
         "features": []
     });
 }
})

// my homies at mapbox with the toggle layers:
// https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/

// had some help from a friend figuring out for loops

var toggleableLayerIds = ['income-fill', 'death-fill'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = 'active';
  link.textContent = id;

  link.onclick = function(e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();

    toggleLayer(clickedLayer);
  };

  var layers = document.getElementById('menu');
  layers.appendChild(link);
}

function toggleLayer(layer) {
  var visibility = map.getLayoutProperty(layer, 'visibility');
  map.setLayoutProperty(layer, 'visibility', 'visible');

  for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];
    if (id !== layer) {
      map.setLayoutProperty(id, 'visibility', 'none');
    }
  }
}

// tutorial used https://docs.mapbox.com/mapbox-gl-js/example/center-on-symbol/
