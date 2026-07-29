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

supabase.auth.getSession().then(({ data }) => {
    console.log("Session actuelle :", data.session);
});

const mapLayer = document.getElementById("map-layer");
const selector = document.getElementById("map-selector");
const image = document.getElementById("map-image");
const elevator = document.getElementById("map-elevator");


let MAPS = [];
let currentMap = null;
let currentFloor = null;
let currentUser = null;

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
        button.onclick = async () =>
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

document.getElementById("map-container").addEventListener("click",(event)=>
{
   // Empêche la création si on clique sur un marker existant
    if(event.target.closest(".map-marker"))
    {
        return;
    }
    markerMenu.classList.add("hidden"); //click out to close 
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log("Utilisateur connecté :", user);

    if(userError || !user)
    {
        console.error("Aucun utilisateur connecté");
        return;
    }

    const description = document.getElementById("marker-description").value;

    const markerData = {
        floor_id: currentFloor.id,
        x: pendingMarker.x,
        y: pendingMarker.y,
        type: type,
        title: type,
        description: description,
        created_by: user.id
    };

    console.log("Payload envoyé :", markerData);

    const { data, error } = await supabase
        .from("markers")
        .insert(markerData)
        .select();

    if(error)
    {
        console.error("Erreur création marker :", error);
        return;
    }

    console.log("Marker créé :", data);

    await loadMarkers();
}
if(markerMenu)
{
   markerMenu.querySelectorAll("button").forEach(button =>
   {
       button.onclick = async () =>
       {
          await saveMarker(button.dataset.type);
          document.getElementById("marker-description").value = "";
          markerMenu.classList.add("hidden");
       };
   });
}
// ===============================
// create marker
// ===============================
function createMarker(marker)
{
    const mapContainer = document.getElementById("map-layer");

    if(!mapContainer)
    {
        console.error("Layer markers introuvable");
        return;
    }
    const element = document.createElement("div");
    element.addEventListener("click",(event)=>
    {
       event.stopPropagation();
    });
    element.className = "map-marker";
    element.dataset.id = marker.id;
    element.dataset.type = marker.type;
    element.style.left = marker.x + "%";
    element.style.top = marker.y + "%";
    element.innerHTML = `
    ${getMarkerIcon(marker.type)}

    <div class="marker-popup">
        <div class="marker-title">
            ${marker.title}
        </div>

        <div class="marker-description">
            ${marker.description ?? "No description"}
        </div>
         <div class="marker-floor">    Floor ${currentFloor.floor}</div>
         ${
             currentUser &&    currentUser.id === marker.created_by    ?
             `   <div class="marker-actions">
             <button         class="edit-marker"        data-id="${marker.id}">        ✏ Modifier    </button>
             <button         class="delete-marker"        data-id="${marker.id}">        🗑 Supprimer    </button>
             </div>`:""
         }    
         </div>`;
         mapContainer.appendChild(element);
         element.querySelector(".delete-marker")?.addEventListener("click",async () =>
         {
             await deleteMarker(marker.id);
         });
}

function getMarkerIcon(type)
{
    switch(type)
    {
        case "chest":
            return `<img src="../assets/icons/${type}.png" alt="${type}">`;

        case "elevator":
            return "🛗";

        case "npc":
            return "👤";

        default:
            return "📍";
    }
}
// ===============================
// delete marker
// ===============================
async function deleteMarker(id)
{
    const confirmDelete =
    confirm(
        "Supprimer ce marker ?"
    );


    if(!confirmDelete)
        return;


    const { error } =
    await supabase
    .from("markers")
    .delete()
    .eq(
        "id",
        id
    );


    if(error)
    {
        console.error(
            "Erreur suppression :",
            error
        );

        return;
    }


    console.log(
        "Marker supprimé"
    );


    loadMarkers();
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
// user
// ===============================
async function getCurrentUser()
{
    const { data } = await supabase.auth.getSession();

    currentUser = data.session?.user ?? null;

    console.log(
        "Utilisateur actuel :",
        currentUser
    );
}
// ===============================
// Initialisation
// ===============================
document.addEventListener("DOMContentLoaded",async () =>
{
    await getCurrentUser();
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

