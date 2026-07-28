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
let currentFloor = "0";

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

function loadMap(mapId) 
{
    const map = MapsData[mapId];
    if (!map) return;
    currentMap = mapId;
    currentFloor = "0";
    updateImage();
    document.querySelectorAll(".map-button")
      .forEach(button => 
      {
      button.classList.toggle("active",button.dataset.map === mapId);
      });
}
function updateImage() 
{
    const map = MapsData[currentMap];
    if (!map?.floors[currentFloor])
        return;
    image.src = map.floors[currentFloor];
}
function createMapButtons() 
{
   Object.entries(MapsData)
   .forEach(([id, map]) => 
   {
      const button = document.createElement("button");
      button.className = "map-button";
      button.dataset.map = id;
      button.textContent = map.name;
      button.addEventListener("click",() => loadMap(id));
      selector.appendChild(button);
   });
}
document.addEventListener("DOMContentLoaded",() => 
{
   createMapButtons();
   loadMap(Object.keys(MapsData)[0]);
});
