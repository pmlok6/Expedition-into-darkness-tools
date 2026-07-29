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
import { supabase } from "../js/supabase.js";

const mapLayer = document.getElementById("map-layer");
const selector = document.getElementById("map-selector");
const image = document.getElementById("map-image");
const elevator = document.getElementById("map-elevator");


let MAPS = [];
let currentMap = null;
let currentFloor = null;


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

async function loadMap(map)
{
    currentMap = map;
    createElevator(map);
    // Affichage du niveau 0 par défaut
    const defaultFloor = map.floors.find(floor => floor.floor === 0);
    if(defaultFloor)
    {
        currentFloor = defaultFloor;
        image.src = defaultFloor.image;
        // Chargement des markers du niveau 0
        await loadMarkers();
    }
}
// ===============================
// Création ascenseur
// ===============================

function createElevator(map)
{
    elevator.innerHTML = "";
    const floors =[...map.floors].sort((a,b) => b.floor - a.floor);
    floors.forEach(floor =>
    {
        const button = document.createElement("button");
        button.className = "floor-button";
        button.textContent =floor.label;
        button.onclick = () =>
        {
           currentFloor = floor;
           image.src = floor.image;
           await loadMarkers();
        };
        elevator.appendChild(button);
    });
}

// ===============================
// marker
// ===============================
let pendingMarker = null;
const markerMenu =document.getElementById("marker-menu");

function openMarkerMenu(x,y)
{
    pendingMarker ={x:x,y:y};
    markerMenu.style.left = x + "%";
    markerMenu.style.top = y + "%";
    markerMenu.classList.remove( "hidden"  );
}

mapLayer.addEventListener("click",(event)=>
{
    const rect = mapLayer.getBoundingClientRect();
    const x =((event.clientX - rect.left) / rect.width) * 100;
    const y =((event.clientY - rect.top) / rect.height) * 100;
    console.log("Position:",x.toFixed(2),"%",y.toFixed(2),"%");
    openMarkerMenu(x,y);
});
// ===============================
// save marker
// ===============================
async function saveMarker(type)
{
    const markerData = {
        floor_id: currentFloor.id,
        x: pendingMarker.x,
        y: pendingMarker.y,
        type: type,
        title: type
    };

    console.log("Tentative création marker:", {
        map: currentMap,
        floor: currentFloor,
        position: pendingMarker,
        type: type
    });

    console.log("Payload envoyé à Supabase :", markerData);


    const { data, error } = await supabase
        .from("markers")
        .insert(markerData)
        .select();


    if(error)
    {
        console.error("Erreur création marker:", error);
        return;
    }

    console.log("Marker enregistré !", data);
}
if(markerMenu)
{
   markerMenu.querySelectorAll("button").forEach(button =>
   {
       button.onclick = async () =>
       {
          await saveMarker(button.dataset.type);
          markerMenu.classList.add("hidden");
       };
   });
}
// ===============================
// create marker
// ===============================
function createMarker(marker)
{
    const mapContainer = document.querySelector(".map-layer");

    if(!mapContainer)
    {
        console.error("Container map introuvable");
        return;
    }
    const element = document.createElement("div");
    element.className = "map-marker";
    element.dataset.id = marker.id;
    element.dataset.type = marker.type;
    element.style.left = marker.x + "%";
    element.style.top = marker.y + "%";
    element.innerHTML = getMarkerIcon(marker.type);
    mapContainer.appendChild(element);
}

function getMarkerIcon(type)
{
    switch(type)
    {
        case "chest":
            return "📦";

        case "elevator":
            return "🛗";

        case "npc":
            return "👤";

        default:
            return "📍";
    }
}
// ===============================
// load marker
// ===============================
async function loadMarkers()
{
    document.querySelectorAll(".map-marker").forEach(marker => marker.remove());
    if(!currentFloor)
    {
        console.error("Aucun étage sélectionné");
        return;
    }
    console.log("Chargement markers étage :", currentFloor.id);
    const { data, error } = await supabase.from("markers").select("*").eq("floor_id", currentFloor.id);

    if(error)
    {
        console.error("Erreur chargement markers :", error);
        return;
    }
   console.log("Markers trouvés :", data);
    data.forEach(marker => {
        createMarker(marker);
    });
}
// ===============================
// Initialisation
// ===============================
document.addEventListener("DOMContentLoaded",async () =>
{
    MAPS = await getMaps();
    console.log("Maps chargées:",MAPS);
    if(MAPS.length === 0)
    {
        console.warn("Aucune map disponible");
        return;
    }
    createMapButtons();
    // Charge la première map automatiquement
    loadMap(MAPS[0]);
});

