/* ==========================================
   Maps Viewer

   Source:
   Supabase

   Features:
   - Load maps
   - Generate buttons
   - Generate elevator
   - Display floors
   - Create/Delete markers
========================================== */

import { getMaps } from "../js/mapsloader.js";
import { supabase } from "../js/supabase.js";

const mapLayer=document.getElementById("map-layer");
const selector=document.getElementById("map-selector");
const image=document.getElementById("map-image");
const elevator=document.getElementById("map-elevator");
const markerMenu=document.getElementById("marker-menu");

let MAPS=[];
let currentMap=null;
let currentFloor=null;
let currentUser=null;
let pendingMarker=null;

// ===============================
// user
// ===============================
async function getCurrentUser()
{
    const {data}=await supabase.auth.getSession();

    currentUser=data.session?.user??null;

    console.log("Utilisateur:",currentUser);
}
// ===============================
// maps
// ===============================
function createMapButtons()
{
    selector.innerHTML="";

    MAPS.forEach(map=>
    {
        const button=document.createElement("button");

        button.className="map-button";
        button.textContent=map.name;
        button.onclick=()=>loadMap(map);

        selector.appendChild(button);
    });
}

async function loadMap(map)
{
    currentMap=map;

    createElevator(map);

    currentFloor=map.floors.find(floor=>floor.floor===0);

    if(currentFloor)
    {
        image.src=currentFloor.image;
        await loadMarkers();
    }
}

function createElevator(map)
{
    elevator.innerHTML="";

    [...map.floors]
    .sort((a,b)=>b.floor-a.floor)
    .forEach(floor=>
    {
        const button=document.createElement("button");

        button.className="floor-button";
        button.textContent=floor.label;

        button.onclick=async()=>
        {
            currentFloor=floor;
            image.src=floor.image;
            await loadMarkers();
        };

        elevator.appendChild(button);
    });
}
// ===============================
// marker menu
// ===============================
function openMarkerMenu(x,y)
{
    pendingMarker={x,y};

    markerMenu.style.left=x+"%";
    markerMenu.style.top=y+"%";

    markerMenu.classList.remove("hidden");
}

document
.getElementById("map-container")
.addEventListener("click",event=>
{
    if(event.target.closest(".map-marker"))
    return;
   document
   .querySelectorAll(".map-marker")
   .forEach(m=>m.classList.remove("active"));
   markerMenu.classList.add("hidden");
    const rect=mapLayer.getBoundingClientRect();
    const x=((event.clientX-rect.left)/rect.width)*100;
    const y=((event.clientY-rect.top)/rect.height)*100;

    markerMenu.classList.add("hidden");

    openMarkerMenu(x,y);
});
// ===============================
// save marker
// ===============================
async function saveMarker(type)
{
    const {data:{user}}=await supabase.auth.getUser();

    if(!user||!pendingMarker||!currentFloor)
        return;

    const markerData={
        floor_id:currentFloor.id,
        x:pendingMarker.x,
        y:pendingMarker.y,
        type,
        title:type,
        description:document.getElementById("marker-description").value,
        created_by:user.id
    };

    const {error}=await supabase
    .from("markers")
    .insert(markerData);

    if(error)
    {
        console.error("Erreur création:",error);
        return;
    }

    document.getElementById("marker-description").value="";

    markerMenu.classList.add("hidden");

    await loadMarkers();
}

markerMenu?.querySelectorAll("button")
.forEach(button=>
{
    button.onclick=()=>saveMarker(button.dataset.type);
});
// ===============================
// create marker
// ===============================
function createMarker(marker)
{
    const element=document.createElement("div");

    element.className="map-marker";

    element.style.left=marker.x+"%";
    element.style.top=marker.y+"%";

    element.onclick=event=>
   {
       event.stopPropagation();
       document
       .querySelectorAll(".map-marker")
       .forEach(m=>m.classList.remove("active"));
       element.classList.add("active");
   };

    element.innerHTML=
`
<div class="marker-icon">
    ${getMarkerIcon(marker.type)}
</div>

<div class="marker-popup">
    <div class="marker-title">
        ${marker.title}
    </div>

    <div class="marker-description">
        ${marker.description??"No description"}
    </div>

    <div class="marker-floor">
        Floor ${currentFloor.floor}
    </div>

    ${
    currentUser?.id===marker.created_by
    ?
    `
    <div class="marker-actions">
        <button class="edit-marker">✏ Modifier</button>
        <button class="delete-marker">🗑 Supprimer</button>
    </div>
    `
    :
    ""
    }
</div>
`;

    mapLayer.appendChild(element);

    element
    .querySelector(".delete-marker")
    ?.addEventListener("click",()=>
    {
        deleteMarker(marker.id);
    });
}

function getMarkerIcon(type)
{
    switch(type)
    {
        case "chest":
            return `<img src="../assets/icons/chest.png" alt="chest">`;

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
    if(!confirm("Supprimer ce marker ?"))
        return;

    const {error}=await supabase
    .from("markers")
    .delete()
    .eq("id",id);

    if(error)
    {
        console.error("Erreur suppression:",error);
        return;
    }

    await loadMarkers();
}
// ===============================
// load markers
// ===============================
async function loadMarkers()
{
    document
    .querySelectorAll(".map-marker")
    .forEach(marker=>marker.remove());

    if(!currentFloor)
        return;

    const {data,error}=await supabase
    .from("markers")
    .select("*")
    .eq("floor_id",currentFloor.id);

    if(error)
    {
        console.error("Erreur chargement:",error);
        return;
    }

    data.forEach(marker=>createMarker(marker));
}
// ===============================
// start
// ===============================
document
.addEventListener("DOMContentLoaded",async()=>
{
    await getCurrentUser();

    MAPS=await getMaps();

    console.log("Maps chargées:",MAPS);

    if(!MAPS.length)
        return;

    createMapButtons();

    await loadMap(MAPS[0]);
});
