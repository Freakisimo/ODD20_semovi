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

  select_route.addEventListener('change', () => {

    db.collection("gtfs_routes_trips").where("route_id", "==", select_route.value).get().then((querySnapshot) => {
      select_trip.innerHTML = '<option value="#" disabled selected>Seleccione su destino</option>';
      querySnapshot.forEach((doc) => {
        let trips = doc.data().trips;
        trips.forEach((trip) => {
          let opt = document.createElement("option");
          console.log(trip.trip_headsign)
          opt.text = trip.trip_headsign;
          opt.value = trip.trip_id;
          select_trip.appendChild(opt);
        });
      });

      M.FormSelect.getInstance(select_trip).destroy();
    }).then(() => {
      M.FormSelect.init(select_trip);
    });
  });


  select_trip.addEventListener('change', () => {
    console.log(select_trip.value)
    console.log({'trip_id': select_trip.value})
    db.collection("gtfs_routes_trips").where("trips", "array-contains", {trip_id: select_trip.value}).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
      })
    })
  })

  let map = L.map('map').setView([19.432545, -99.133209], 12);

  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      id: 'MapID',
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
  }).addTo(map);
}

