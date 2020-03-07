"use strict;"

let map = L.map('map').setView([19.432545, -99.133209], 12);

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    id: 'MapID',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
}).addTo(map);

let url = 'https://datos.cdmx.gob.mx/api/records/1.0/search/';

let controls = L.control.groupedLayers().addTo(map);
let circle_filter = L.layerGroup().addTo(map);

let color_by_route = {
    "CORREDORES CONCESIONADOS": '#FF8D80', 
    "METRO": '#DE68E8', 
    "METROBUS":'#8B7FFF', 
    "TROLEBUS":'#68C2E8', 
    "RTP":'#73FFB5', 
    "FERROCARRILES SUBURBANOS":'#D28EE8', 
    "TREN LIGERO":'#9CA2FF'
}




const create_gtfs_layers = (data) => {
    gtfs_layers(data[0]);
    cetram(data[1]);
}

const create_bici_layers = (data) => {
    ecobici(data[0]);
    sitis(data[1]);
}

let gtfs_req = new Requests({
    requests_elements: [
        {
            url: url,
            urldata: {
                dataset: 'gtfs-general-transit-feed-specifications-actualizado-de-la-ciudad-de-mexico',
                rows: 500
            }
        },
        {
            url: url,
            urldata: {
                dataset: 'ubicacion-de-centros-de-transferencia-modal-cetram',
                rows: 50
            }
        }

    ],
    then_callback: create_gtfs_layers
});

const query_bici = (lat, lng, meters) => {
    let bici_req = new Requests({
        requests_elements: [
            {
                url: url,
                urldata: {
                    dataset: 'estaciones-de-ecobici',
                    rows: 500,
                    'geofilter.distance': `${lat},${lng},${meters}`
                }
            },
            {
                url: url,
                urldata: {
                    dataset: 'puntos-de-arribo-sitis',
                    rows: 75,
                    'geofilter.distance': `${lat},${lng},${meters}`
                }
            },

        ],
        then_callback: create_bici_layers
    })
    bici_req.send()
}

const gtfs_layers = (data) => {
    let records = data.records,
        group_layers = {};
    for (let item of records) {
        if (!(item.fields.agencia in group_layers)) {
            group_layers[item.fields.agencia] = L.layerGroup().addTo(map);
            controls.addOverlay(group_layers[item.fields.agencia], item.fields.agencia, 'GTFS');
        }
        L.geoJSON(item.fields.geo_shape, {
            style: () => { return { color: color_by_route[item.fields.agencia] } }
        }).addTo(group_layers[item.fields.agencia]);

    }

}

const ecobici = (data) => {
    let records = data.records;
    var bici_icon = L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'bicycle',
        markerColor: 'red'
    });
    // controls.addOverlay(ecobici_lg, 'ecobici', 'ecobici');
    for (let item of records) {
        let ll = L.latLng(item.fields.punto_geo);
        L.marker(ll, { icon: bici_icon }).addTo(circle_filter)
        // L.geoJSON(item.geometry).addTo(circle_filter);
    }
} 

const sitis = (data) => {
    let records = data.records;
    var sitis_icon = L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'map-marker',
        markerColor: 'green'
    });
    // controls.addOverlay(sitis_lg, 'sitis', 'sitis');
    for (let item of records) {
        // L.geoJSON(item.geometry).addTo(circle_filter);
        let ll = L.latLng(item.fields.punto_geo);
        L.marker(ll, { icon: sitis_icon }).addTo(circle_filter)
    }
}

const cetram = (data) => {
    let records = data.records;
    let cetram_lg = L.layerGroup().addTo(map);
    var cetram_icon = L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'exchange',
        markerColor: 'orange'
    });
    controls.addOverlay(cetram_lg, 'cetram', 'cetram');
    for (let item of records) {
        // console.log(item);
        let html_popup = `
            <div>Ubicación: ${item.fields.ubicacion}</div>
            <div>Metrobus: ${item.fields.t_metrobus}</div>
            <div>Metro: ${item.fields.t_metro}</div>            
        `
        let ll = L.latLng(item.fields.geo_point_2d);
        let marker = L.marker(ll, { icon: cetram_icon }).bindPopup(html_popup).addTo(cetram_lg);

        // let marker = L.geoJSON(item.geometry).bindPopup( () => {
        //     return html_popup;
        // }).addTo(cetram_lg);
        marker.on('click', (e) => {
            let circle_layers = circle_filter.getLayers();
            if (circle_layers.length > 0) {
                circle_filter.clearLayers();
                map.setView([19.432545, -99.133209], 12);
                return
            }
            L.circle(e.latlng, 500).addTo(circle_filter);
            map.setView(e.latlng, 15);
            query_bici(e.latlng.lat, e.latlng.lng, 500);
        })
    }
} 

const init = () => {

    gtfs_req.send()

}