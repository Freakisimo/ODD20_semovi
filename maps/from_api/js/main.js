"use strict;"

let map = L.map('map').setView([19.432545, -99.133209], 12);

let url = 'https://datos.cdmx.gob.mx/api/records/1.0/search/';

let controls = L.control.groupedLayers().addTo(map);

let color_by_route = {
    "CORREDORES CONCESIONADOS": '#FF8D80', 
    "METRO": '#DE68E8', 
    "METROBUS":'#8B7FFF', 
    "TROLEBUS":'#68C2E8', 
    "RTP":'#73FFB5', 
    "FERROCARRILES SUBURBANOS":'#D28EE8', 
    "TREN LIGERO":'#9CA2FF'
}

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    id: 'MapID',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
}).addTo(map);


const gtfs_layers = (data) => {
    let records = data[0].records,
        group_layers = {};
    for (let item of records) {
        if (!(item.fields.agencia in group_layers)) {
            group_layers[item.fields.agencia] = L.layerGroup().addTo(map);
            controls.addOverlay(group_layers[item.fields.agencia], item.fields.agencia, 'GTFS');
        }
        // L.geoJSON(item.geometry).addTo(group_layers[item.fields.agencia]);
        L.geoJSON(item.fields.geo_shape, {
            style: function (feature) {
                return { color: color_by_route[item.fields.agencia] };
            }
        }).addTo(group_layers[item.fields.agencia]);
        
    }
   
}

const ecobici = (data) => {
    let records = data[0].records;
    let ecobici_lg = L.layerGroup().addTo(map);
    controls.addOverlay(ecobici_lg, 'ecobici', 'ecobici');
    for (let item of records) {
        L.geoJSON(item.geometry).addTo(ecobici_lg);
    }
} 

const cetram = (data) => {
    let records = data[0].records;
    let ecobici_lg = L.layerGroup().addTo(map);
    controls.addOverlay(ecobici_lg, 'cetram', 'cetram');
    for (let item of records) {
        L.geoJSON(item.geometry).addTo(ecobici_lg);
    }
} 

const init = () => {

    let gtfs_req = new Requests({
        then_callback: gtfs_layers
    });
    gtfs_req.appendRequest({
        url: url,
        urldata: {
            dataset: 'gtfs-general-transit-feed-specifications-actualizado-de-la-ciudad-de-mexico',
            rows: 500
        }
    });
    gtfs_req.send()

    let ecobici_req = new Requests({
        then_callback: ecobici
    });

    ecobici_req.appendRequest({
        url: url,
        urldata: {
            dataset: 'estaciones-de-ecobici',
            rows: 500
        }
    });
    ecobici_req.send()

    let cetram_req = new Requests({
        then_callback: cetram
    });

    cetram_req.appendRequest({
        url: url,
        urldata: {
            dataset: 'ubicacion-de-centros-de-transferencia-modal-cetram',
            rows: 50
        }
    });
    cetram_req.send()

}