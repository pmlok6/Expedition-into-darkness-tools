/* ==========================================
   Maps Viewer

   Source:
   MapsDataExport

   Features:
   - Generate map buttons
   - Load selected map
   - Display default floor
========================================== */
import { getMaps } from "../data/mapsloader.js";

const selector = document.getElementById("map-selector");
const image = document.getElementById("map-image");
const elevator = document.getElementById("map-elevator");

let currentMap = null;

function createMapButtons()
{
    MAPS.forEach((map)=>
   {
      const button = document.createElement("button");
       button.className="map-button";
       button.textContent=map.name;
       button.onclick=()=>
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
    const floor =map.floors.find(f => f.floor === 0);
    if(floor)
    {
        image.src = floor.image;
    }
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

document.addEventListener("DOMContentLoaded",async () =>
{
    MAPS = await getMaps();
    createMapButtons();
    if(MAPS.length)
    {
        loadMap(MAPS[0]);
    }
});
