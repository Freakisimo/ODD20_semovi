"use strict;"

const init = () => {
    let map = L.map('map').setView([19.432545, -99.133209], 18);

    L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png',
    {id: 'MapID', attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'}).addTo(map);
}