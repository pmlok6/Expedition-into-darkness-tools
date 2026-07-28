/* ==========================================
   Maps Viewer

   Source:
   MapsDataExport

   Features:
   - Generate map buttons
   - Load selected map
   - Display default floor
========================================== */


import { MapsData } from "../data/MapsData.js";


const selector = document.getElementById("map-selector");
const image = document.getElementById("map-image");


let currentMap = null;
let currentFloor = "0";



function loadMap(mapId) {

    const map = MapsData[mapId];

    if (!map) return;


    currentMap = mapId;
    currentFloor = "0";


    updateImage();


    document.querySelectorAll(".map-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.map === mapId
            );

        });
}



function updateImage() {

    const map = MapsData[currentMap];

    if (!map?.floors[currentFloor])
        return;


    image.src = map.floors[currentFloor];

}



function createMapButtons() {

    Object.entries(MapsData)
        .forEach(([id, map]) => {


            const button = document.createElement("button");

            button.className = "map-button";
            button.dataset.map = id;
            button.textContent = map.name;


            button.addEventListener(
                "click",
                () => loadMap(id)
            );


            selector.appendChild(button);

        });

}



document.addEventListener(
    "DOMContentLoaded",
    () => {

        createMapButtons();

        loadMap(
            Object.keys(MapsData)[0]
        );

    }
);
