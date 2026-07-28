/* ==========================================
   Maps Viewer

   Source:
   MapsDataExport

   Features:
   - Generate map buttons
   - Load selected map
   - Display default floor
========================================== */
import MAPS from "../data/mapsdata.js";

const selector = document.getElementById("map-selector");
const image = document.getElementById("map-image");
const elevator = document.getElementById("map-elevator");

let currentMap = null;

function createMapButtons()
{
    Object.entries(MAPS).forEach(([id,map])=>
       {
        const button = document.createElement("button");
        button.className = "map-button";
        button.textContent = map.name;
        button.dataset.map = id;
        button.onclick = () => 
       {
            loadMap(id);
       };
        selector.appendChild(button);
    });
}
function loadMap(id)
{
    currentMap = id;
    const map = MAPS[id];
    if(!map) return;
    createElevator(map);
    // affiche le niveau 0 par défaut
    const floor = map.floors.find(floor => floor.id === 0);
    if(floor)
    {
        image.src = floor.image;
    }
    document.querySelectorAll(".map-button")
        .forEach(btn=>
           {
            btn.classList.toggle("active",btn.dataset.map === id);
        });
}
function createElevator(map)
{
    elevator.innerHTML = "";
    map.floors.forEach(floor=>
    {
        const button = document.createElement("button");
        button.className = "floor-button";
        button.textContent = floor.label;
        button.onclick = ()=>
       {
         image.src = floor.image;
       };
      elevator.appendChild(button);
    });
}

document.addEventListener("DOMContentLoaded",()=>
{
   createMapButtons();
   loadMap(Object.keys(MAPS)[0]);
});
