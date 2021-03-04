mapboxgl.accessToken = 'pk.eyJ1IjoiamFtZXN3aWxzb25zY2h1dHRlciIsImEiOiJja2xiamw0dTIwcjZlMm5xZXR1Z2oyNTZ0In0.ykjwA7KZIseTEFrKv-4aDw';

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
        '#ffffff',
        33966,
        '#ffbfbf',
        55898,
        '#ff8080',
        70390,
        '#ff4040',
        93366,
        '#ff0000',
      ],
      'fill-outline-color': '#ccc',
      'fill-opacity': 0.75
    }
  });

  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mouseenter', 'income-fill', function(e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';

    var coordinates = e.features[0].geometry.MultiPolygon
    var description = `<div style="">hello world</div>`;

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    popup.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  map.on('mouseleave', 'income-fill', function() {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

})

//2nd layer

map.on('style.load', function() {
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

  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mouseenter', 'death-fill', function(e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';

    var coordinates = e.features[0].geometry.MultiPolygon
    var description = `<div style="">hello world</div>`;

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    popup.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  map.on('mouseleave', 'death-fill', function() {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });


});


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
