/* ==========================================
   Maps Viewer

   Source:
   MapsDataExport

   Features:
   - Generate map buttons
   - Load selected map
   - Display default floor
========================================== */
import { getMaps } from "./mapLoader.js";

const selector = document.getElementById("map-selector");
const image = document.getElementById("map-image");
const elevator = document.getElementById("map-elevator");

let MAPS = [];
let currentMap = null;
function createMapButtons()
{
    selector.innerHTML = "";
    MAPS.forEach((map)=>
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
function loadMap(map)
{
    currentMap = map;
    createElevator(map);
    const defaultFloor = map.floors.find(floor => floor.floor === 0);
    if(defaultFloor)
    {
        image.src = defaultFloor.image;
    }
    document.querySelectorAll(".map-button").forEach(button =>
        {
            button.classList.toggle( "active",button.textContent === map.name);
        });
}
function createElevator(map)
{
    elevator.innerHTML = "";
    // Tri des étages
    const floors = [...map.floors].sort((a,b)=> b.floor - a.floor);
    floors.forEach(floor =>
    {
        const button = document.createElement("button");
        button.className = "floor-button";
        button.textContent = floor.label;
        button.onclick = () =>
        {
            image.src = floor.image;
        };
        elevator.appendChild(button);
    });
}
document.addEventListener("DOMContentLoaded",async () =>
{
    MAPS = await getMaps();
    if(!MAPS.length)
    {
        console.warn( "Aucune map trouvée dans Supabase");

        return;
    }
    createMapButtons();
    loadMap(MAPS[0]);

});
