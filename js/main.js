"use strict;"
 
document.addEventListener('DOMContentLoaded', () =>  {
  init();
})

firebase.initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

const init = () => {

  let select_route = document.querySelector("#routes"),
      select_trip = document.querySelector("#trip");

  M.FormSelect.init(select_route);
  M.FormSelect.init(select_trip);

  let db = firebase.firestore();

  db.collection("gtfs_agency_routes").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      let agency_name = doc.data().agency_name,
          routes = doc.data().routes;
      let optGroup = document.createElement("optgroup");
      optGroup.setAttribute('label', agency_name);
      routes.forEach((route) => {
        let opt = document.createElement("option");
        opt.text = route.route_long_name;
        opt.value = route.route_id;
        optGroup.appendChild(opt);
      });
      select_route.appendChild(optGroup);
    });
    M.FormSelect.getInstance(select_route).destroy();
  }).then(() =>{
    M.FormSelect.init(select_route);
  });

  let map = L.map('map').setView([19.432545, -99.133209], 11);

  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      id: 'MapID',
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
  }).addTo(map);

  select_route.addEventListener('change', () => {

    db.collection("gtfs_routes_trips").where("route_id", "==", select_route.value).get().then((querySnapshot) => {
      select_trip.innerHTML = '<option value="#" disabled selected>Seleccione su destino</option>';
      querySnapshot.forEach((doc) => {
        let data = doc.data(),
            opt = document.createElement("option");
        opt.text = `${data.trip_short_name}`;
        opt.value = data.trip_id; 
        select_trip.appendChild(opt);
      });

      M.FormSelect.getInstance(select_trip).destroy();
    }).then(() => {
      M.FormSelect.init(select_trip);
    });
  });


  select_trip.addEventListener('change', () => {
    db.collection("gtfs_routes_trips").where("trip_id", "==", select_trip.value).get().then((querySnapshot) => {
      map.eachLayer(l => {
        if (l._url === undefined) {
          map.removeLayer(l);
        }
      })
      querySnapshot.forEach((doc) => {
        let data = doc.data(),
            coords = data.line.map(coord => coord.split(',').map(c => parseFloat(c)))
        let antPolyline = new L.Polyline.AntPath(coords);
        antPolyline.addTo(map);
      });
    });
  });

}

