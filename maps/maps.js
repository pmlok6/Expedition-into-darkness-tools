/* ==========================================
   Maps Viewer

   Source:
   Supabase

   Features:
   - Load maps from database
   - Generate map buttons
   - Generate elevator
   - Display selected floor
========================================== */


import { getMaps } from "../js/mapsloader.js";


const selector = document.getElementById("map-selector");
const image = document.getElementById("map-image");
const elevator = document.getElementById("map-elevator");


let MAPS = [];
let currentMap = null;



// ===============================
// Création des boutons de maps
// ===============================

function createMapButtons()
{

    selector.innerHTML = "";


    MAPS.forEach(map =>
    {

        const button = document.createElement("button");

        button.className = "map-button";
        button.textContent = map.name;


        button.onclick = () =>
        {
            loadMap(map);
        };


        selector.appendChild(button);

    });

}



// ===============================
// Chargement d'une map
// ===============================

function loadMap(map)
{

    currentMap = map;


    createElevator(map);


    // Affichage du niveau 0 par défaut

    const defaultFloor =
        map.floors.find(
            floor => floor.floor === 0
        );


    if(defaultFloor)
    {
        image.src = defaultFloor.image;
    }


}



// ===============================
// Création ascenseur
// ===============================

function createElevator(map)
{

    elevator.innerHTML = "";


    const floors =
        [...map.floors]
        .sort(
            (a,b) => b.floor - a.floor
        );



    floors.forEach(floor =>
    {

        const button = document.createElement("button");


        button.className = "floor-button";

        button.textContent =
            floor.label;



        button.onclick = () =>
        {
            image.src = floor.image;
        };



        elevator.appendChild(button);

    });

}



// ===============================
// Initialisation
// ===============================

document.addEventListener(
"DOMContentLoaded",
async () =>
{

    MAPS = await getMaps();


    console.log(
        "Maps chargées:",
        MAPS
    );


    if(MAPS.length === 0)
    {
        console.warn(
            "Aucune map disponible"
        );

        return;
    }


    createMapButtons();


    // Charge la première map automatiquement

    loadMap(MAPS[0]);

});
